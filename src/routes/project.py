from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from models.db_schemes import Project
from models import ResponseSignal
from controllers.AuthController import AuthController
from routes.schemes.project import CreateProjectRequest, UpdateProjectRequest
from sqlalchemy.future import select
import logging

logger = logging.getLogger("uvicorn.error")

project_router = APIRouter(
    prefix="/api/v1/project",
    tags=["api_v1", "project"],
)

auth_controller = AuthController()


@project_router.post("/create")
async def create_project(request: Request, body: CreateProjectRequest):
    user = request.state.user

    async with request.app.db_client() as session:
        result = await session.execute(
            select(Project).where(Project.user_id == user.user_id)
        )
        existing = result.scalar_one_or_none()

    if existing:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"signal": "project_already_exists"}
        )

    api_key = auth_controller.generate_api_key()

    project = Project(
        user_id=user.user_id,
        project_name=body.project_name,
        project_lang=body.project_lang,
        project_api_key=api_key,
    )

    async with request.app.db_client() as session:
        async with session.begin():
            session.add(project)
        await session.commit()
        await session.refresh(project)

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "signal": ResponseSignal.PROJECT_CREATED_SUCCESS.value,
            "project_id": project.project_id,
            "project_name": project.project_name,
            "project_lang": project.project_lang,
            "api_key": project.project_api_key,
        }
    )


@project_router.get("/dashboard")
async def get_dashboard(request: Request):
    user = request.state.user

    async with request.app.db_client() as session:
        result = await session.execute(
            select(Project).where(Project.user_id == user.user_id)
        )
        project = result.scalar_one_or_none()

    if not project:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"signal": ResponseSignal.PROJECT_NOT_FOUND_ERROR.value}
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "user_name": user.user_name,
            "user_email": user.user_email,
            "project_id": project.project_id,
            "project_name": project.project_name,
            "project_lang": project.project_lang,
            "api_key": project.project_api_key,
            "created_at": project.create_at.isoformat(),
            "updated_at": project.updated_at.isoformat() if project.updated_at else None,
        }
    )


@project_router.patch("/update")
async def update_project(request: Request, body: UpdateProjectRequest):
    user = request.state.user

    async with request.app.db_client() as session:
        async with session.begin():
            result = await session.execute(
                select(Project).where(Project.user_id == user.user_id)
            )
            project = result.scalar_one_or_none()

            if not project:
                return JSONResponse(
                    status_code=status.HTTP_404_NOT_FOUND,
                    content={"signal": ResponseSignal.PROJECT_NOT_FOUND_ERROR.value}
                )

            if body.project_name is not None:
                project.project_name = body.project_name
            if body.project_lang is not None:
                project.project_lang = body.project_lang

        await session.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "signal": "project_updated",
            "project_name": project.project_name,
            "project_lang": project.project_lang,
        }
    )