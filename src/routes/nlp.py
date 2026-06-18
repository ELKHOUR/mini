from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from routes.schemes.nlp import PushRequest, SearchRequest
from models.ChunkModel import ChunkModel
from controllers import NLPController
from models import ResponseSignal
from models.db_schemes import QueryLog
from tqdm.auto import tqdm
import logging, time

logger = logging.getLogger("uvicorn.error")

nlp_router = APIRouter(
    prefix="/api/v1/nlp",
    tags=["api_v1", "nlp"],
)


@nlp_router.post("/index/push")
async def index_project(request: Request, push_request: PushRequest):
    """Index all project chunks into vector DB — JWT auth"""

    project = request.state.project

    chunk_model = await ChunkModel.create_instance(db_client=request.app.db_client)

    nlp_controller = NLPController(
        vectordb_client=request.app.vectordb_client,
        generation_client=request.app.generation_client,
        embedding_client=request.app.embedding_client,
        template_parser=request.app.template_parser
    )

    collection_name = nlp_controller.create_collection_name(project_id=project.project_id)
    await request.app.vectordb_client.create_collection(
        collection_name=collection_name,
        embedding_size=request.app.embedding_client.embedding_size,
        do_reset=push_request.do_reset,
    )

    total_chunks_count = await chunk_model.get_total_chunks_count(
        project_id=project.project_id
    )

    if total_chunks_count == 0:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"signal": ResponseSignal.NO_FILES_ERROR.value}
        )

    pbar = tqdm(total=total_chunks_count, desc="Vector Indexing", position=0)
    page_no = 1
    inserted_items_count = 0

    while True:
        page_chunks = await chunk_model.get_project_chunks(
            project_id=project.project_id, page_no=page_no
        )

        if not page_chunks or len(page_chunks) == 0:
            break

        page_no += 1
        chunks_ids = [c.chunk_id for c in page_chunks]

        is_inserted = await nlp_controller.index_into_vector_db(
            project=project,
            chunks=page_chunks,
            chunks_ids=chunks_ids
        )

        if not is_inserted:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"signal": ResponseSignal.INSERT_INTO_VECTORDB_ERROR.value}
            )

        pbar.update(len(page_chunks))
        inserted_items_count += len(page_chunks)

    return JSONResponse(
        content={
            "signal": ResponseSignal.INSERT_INTO_VECTORDB_SUCCESS.value,
            "inserted_items_count": inserted_items_count
        }
    )


@nlp_router.post("/answer")
async def answer_with_api_key(request: Request, search_request: SearchRequest):
    """RAG answer endpoint — X-API-KEY auth (for chatbot)"""

    if not hasattr(request.state, "project"):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"signal": ResponseSignal.INVALID_API_KEY.value}
        )

    project = request.state.project

    nlp_controller = NLPController(
        vectordb_client=request.app.vectordb_client,
        generation_client=request.app.generation_client,
        embedding_client=request.app.embedding_client,
        template_parser=request.app.template_parser,
    )

    start_time = time.time()

    answer, full_prompt, chat_history = await nlp_controller.answer_rag_question(
        project=project,
        query=search_request.text,
        limit=search_request.limit
    )

    response_time_ms = (time.time() - start_time) * 1000
    was_answered = bool(answer)

    async with request.app.db_client() as session:
        async with session.begin():
            log = QueryLog(
                project_id=project.project_id,
                query_text=search_request.text,
                was_answered=was_answered,
                response_time_ms=response_time_ms,
                latitude=search_request.latitude,
                longitude=search_request.longitude,
                country=search_request.country,
                city=search_request.city,
            )
            session.add(log)

    if not answer:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"signal": ResponseSignal.RAG_ANSWER_ERROR.value}
        )

    return JSONResponse(
        content={
            "signal": ResponseSignal.RAG_ANSWER_SUCCESS.value,
            "answer": answer,
        }
    )