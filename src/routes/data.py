from fastapi import APIRouter, Request, Depends, UploadFile, status
from fastapi.responses import JSONResponse
from helpers.config import get_settings, Settings
from controllers import DataController, ProcessController, NLPController
from models import ResponseSignal
from models.ChunkModel import ChunkModel
from models.AssetModel import AssetModel
from models.db_schemes import DataChunk, Asset, Project
from models.enums.AssetTypeEnum import AssetTypeEnum
from routes.schemes.data import ProcessRequest
from sqlalchemy.future import select
from sqlalchemy import delete
import logging, os, aiofiles

logger = logging.getLogger('uvicorn.error')

data_router = APIRouter(
    prefix="/api/v1/data",
    tags=["api_v1", "data"],
)


# ── helper ────────────────────────────────────────────────
def get_project(request: Request):
    return request.state.project


# ── upload ────────────────────────────────────────────────
@data_router.post("/upload")
async def upload_data(request: Request, file: UploadFile,
                      app_settings: Settings = Depends(get_settings)):

    project = get_project(request)
    data_controller = DataController()

    is_valid, result_signal = data_controller.validate_uploaded_file(file=file)
    if not is_valid:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"signal": result_signal}
        )

    is_size_valid, size_signal = data_controller.validate_project_size(
        project_id=project.project_id,
        new_file_size=file.size
    )
    if not is_size_valid:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"signal": size_signal}
        )

    file_path, file_id = data_controller.generate_unique_filepath(
        orig_file_name=file.filename,
        project_id=project.project_id,
    )

    try:
        async with aiofiles.open(file_path, "wb") as f:
            while chunk := await file.read(app_settings.FILE_DEFAULT_CHUNK_SIZE):
                await f.write(chunk)
    except Exception as e:
        logger.error(f"Error while uploading file: {e}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"signal": ResponseSignal.FILE_UPLOAD_FAILED.value}
        )

    asset_model = await AssetModel.create_instance(db_client=request.app.db_client)
    asset_resource = Asset(
        asset_project_id=project.project_id,
        asset_type=AssetTypeEnum.FILE.value,
        asset_name=file_id,
        asset_size=os.path.getsize(file_path)
    )
    asset_record = await asset_model.create_asset(asset=asset_resource)

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "signal": ResponseSignal.FILE_UPLOAD_SUCCESS.value,
            "file_id": str(asset_record.asset_id),
            "file_name": file_id,
        }
    )


# ── list files ────────────────────────────────────────────
@data_router.get("/files")
async def list_files(request: Request):

    project = get_project(request)

    asset_model = await AssetModel.create_instance(db_client=request.app.db_client)
    assets = await asset_model.get_all_project_assets(
        asset_project_id=project.project_id,
        asset_type=AssetTypeEnum.FILE.value
    )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "project_name": project.project_name,
            "project_id": project.project_id,
            "files": [
                {
                    "asset_id": a.asset_id,
                    "name": a.asset_name,
                    "size": a.asset_size,
                    "created_at": a.create_at.isoformat(),
                }
                for a in assets
            ]
        }
    )


# ── delete file ───────────────────────────────────────────
@data_router.delete("/files/{asset_id}")
async def delete_file(request: Request, asset_id: int):

    project = get_project(request)

    # 1. fetch asset and verify it belongs to this project
    async with request.app.db_client() as session:
        result = await session.execute(
            select(Asset).where(
                Asset.asset_id == asset_id,
                Asset.asset_project_id == project.project_id
            )
        )
        asset = result.scalar_one_or_none()

    if not asset:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"signal": ResponseSignal.FILE_NOT_FOUND.value}
        )

    # 2. delete physical file from disk
    from controllers.ProjectController import ProjectController
    file_path = os.path.join(
        ProjectController().get_project_path(project_id=project.project_id),
        asset.asset_name
    )
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            logger.error(f"Could not delete file from disk: {e}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"signal": ResponseSignal.FILE_DELETE_FAILED.value}
            )

    # 3. get chunk ids for this asset (needed for vector deletion)
    async with request.app.db_client() as session:
        chunk_ids_result = await session.execute(
            select(DataChunk.chunk_id).where(
                DataChunk.chunk_asset_id == asset_id
            )
        )
        chunk_ids = [row[0] for row in chunk_ids_result.fetchall()]

    # 4. delete vectors from vector DB
    if chunk_ids:
        nlp_controller = NLPController(
            vectordb_client=request.app.vectordb_client,
            generation_client=request.app.generation_client,
            embedding_client=request.app.embedding_client,
            template_parser=request.app.template_parser,
        )
        collection_name = nlp_controller.create_collection_name(
            project_id=project.project_id
        )
        try:
            await request.app.vectordb_client.delete_by_ids(
                collection_name=collection_name,
                ids=chunk_ids
            )
        except Exception as e:
            logger.error(f"Could not delete vectors: {e}")

    # 5. delete chunks from DB
    async with request.app.db_client() as session:
        async with session.begin():
            await session.execute(
                delete(DataChunk).where(DataChunk.chunk_asset_id == asset_id)
            )

    # 6. delete asset record
    async with request.app.db_client() as session:
        async with session.begin():
            await session.execute(
                delete(Asset).where(Asset.asset_id == asset_id)
            )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"signal": ResponseSignal.FILE_DELETED_SUCCESS.value}
    )


# ── process ───────────────────────────────────────────────
@data_router.post("/process")
async def process_endpoint(request: Request, process_request: ProcessRequest):

    project = get_project(request)

    nlp_controller = NLPController(
        vectordb_client=request.app.vectordb_client,
        generation_client=request.app.generation_client,
        embedding_client=request.app.embedding_client,
        template_parser=request.app.template_parser,
    )

    asset_model = await AssetModel.create_instance(db_client=request.app.db_client)

    project_file_ids = {}
    if process_request.file_id:
        asset_record = await asset_model.get_asset_record(
            asset_project_id=project.project_id,
            asset_name=process_request.file_id
        )
        if asset_record is None:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"signal": ResponseSignal.FILE_ID_ERROR.value}
            )
        project_file_ids = {asset_record.asset_id: asset_record.asset_name}
    else:
        project_files = await asset_model.get_all_project_assets(
            asset_project_id=project.project_id,
            asset_type=AssetTypeEnum.FILE.value
        )
        project_file_ids = {r.asset_id: r.asset_name for r in project_files}

    if len(project_file_ids) == 0:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"signal": ResponseSignal.NO_FILES_ERROR.value}
        )

    process_controller = ProcessController(project_id=project.project_id)
    chunk_model = await ChunkModel.create_instance(db_client=request.app.db_client)

    if process_request.do_reset == 1:
        collection_name = nlp_controller.create_collection_name(
            project_id=project.project_id
        )
        _ = await request.app.vectordb_client.delete_collection(
            collection_name=collection_name
        )
        _ = await chunk_model.delete_chunks_by_project_id(
            project_id=project.project_id
        )

    on_records = 0
    on_files = 0

    for asset_id, file_id in project_file_ids.items():
        file_content = process_controller.get_file_content(file_id=file_id)
        if file_content is None:
            logger.error(f"Error while processing file: {file_id}")
            continue

        file_chunks = process_controller.process_file_content(
            file_content=file_content,
            file_id=file_id,
            chunk_size=process_request.chunk_size,
            overlap_size=process_request.overlap_size
        )

        if not file_chunks:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"signal": ResponseSignal.PROCESSING_FAILED.value}
            )

        file_chunks_records = [
            DataChunk(
                chunk_text=chunk.page_content,
                chunk_metadata=chunk.metadata,
                chunk_order=i + 1,
                chunk_project_id=project.project_id,
                chunk_asset_id=asset_id
            )
            for i, chunk in enumerate(file_chunks)
        ]

        on_records += await chunk_model.insert_many_chunks(chunks=file_chunks_records)
        on_files += 1

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "signal": ResponseSignal.PROCESSING_SUCCESS.value,
            "inserted_chunks": on_records,
            "processed_files": on_files,
        }
    )