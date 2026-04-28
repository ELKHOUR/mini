from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from controllers import ProjectController
from models import ResponseSignal
import logging
import os
import shutil

logger = logging.getLogger('uvicorn.error')

project_router = APIRouter(
    prefix="/api/v1/project",
    tags=["api_v1", "project"],
)


# إنشاء مشروع جديد
@project_router.post("/create/{user_id}/{project_id}")
async def create_project(user_id: str, project_id: str):
    project_path = ProjectController().get_project_path(
        project_id=project_id,
        user_id=user_id
    )

    
    if not os.path.exists(project_path):
            os.makedirs(project_path)

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "signal": ResponseSignal.PROJECT_CREATED_SUCCESS.value,
            "project_id": project_id,
            "project_path": project_path
        }
    )


# حذف مشروع
@project_router.delete("/delete/{user_id}/{project_id}")
async def delete_project(user_id: str, project_id: str):
    project_path = ProjectController().get_project_path(
        project_id=project_id,
        user_id=user_id
    )

    if not os.path.exists(project_path):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"signal": ResponseSignal.PROJECT_NOT_FOUND.value}
        )

    try:
        shutil.rmtree(project_path)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"signal": ResponseSignal.PROJECT_DELETED_SUCCESS.value}
        )
    except Exception as e:
        logger.error(f"Error while deleting project: {e}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"signal": ResponseSignal.PROJECT_DELETE_FAILED.value}
        )


# عرض ملفات المشروع
@project_router.get("/files/{user_id}/{project_id}")
async def get_project_files(user_id: str, project_id: str):
    project_path = ProjectController().get_project_path(
        project_id=project_id,
        user_id=user_id
    )


    if not os.path.exists(project_path):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"signal": ResponseSignal.PROJECT_NOT_FOUND.value}
        )

    files = os.listdir(project_path)
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "project_id": project_id,
            "files": files
        }
    )


# حذف ملف من المشروع
@project_router.delete("/files/{user_id}/{project_id}/{file_id}")
async def delete_file(user_id: str, project_id: str, file_id: str):
    project_path = ProjectController().get_project_path(
        project_id=project_id,
        user_id=user_id
    )

    file_path = os.path.join(project_path, file_id)

    if not os.path.exists(file_path):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"signal": ResponseSignal.FILE_NOT_FOUND.value}
        )

    try:
        os.remove(file_path)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"signal": ResponseSignal.FILE_DELETED_SUCCESS.value}
        )
    except Exception as e:
        logger.error(f"Error while deleting file: {e}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"signal": ResponseSignal.FILE_DELETE_FAILED.value}
        )