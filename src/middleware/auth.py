from fastapi import Request, status
from fastapi.responses import JSONResponse
from controllers.AuthController import AuthController
from models.UserModel import UserModel
from models import ResponseSignal

auth_controller = AuthController()

# Routes that don't need a token
PUBLIC_ROUTES = [
    "/api/v1/auth/register",
    "/api/v1/auth/login",
    "/api/v1/",
    "/api/v1",
]

# Routes that need a token but don't need a project
NO_PROJECT_ROUTES = [
    "/api/v1/project/create",
    "/api/v1/project/dashboard",
    "/api/v1/project/update",
]


async def auth_middleware(request: Request, call_next):

    # 1. Public routes — no token needed
    if request.url.path in PUBLIC_ROUTES or request.url.path.startswith("/api/v1/auth/verify"):
        return await call_next(request)

    # 2. API key auth — for external chatbot usage
    api_key = request.headers.get("X-API-KEY")
    if api_key:
        from models.ProjectModel import ProjectModel
        project_model = await ProjectModel.create_instance(
            db_client=request.app.db_client
        )
        project = await project_model.get_project_by_api_key(api_key=api_key)
        if not project:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"signal": ResponseSignal.INVALID_API_KEY.value}
            )
        request.state.project = project
        request.state.auth_type = "api_key"
        return await call_next(request)

    # 3. JWT auth
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"signal": ResponseSignal.MISSING_TOKEN.value}
        )

    token = auth_header.split(" ")[1]
    payload = auth_controller.decode_access_token(token=token)

    if not payload:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"signal": ResponseSignal.INVALID_TOKEN.value}
        )

    user_id = payload.get("sub")
    if not user_id:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"signal": ResponseSignal.INVALID_TOKEN.value}
        )

    user_model = await UserModel.create_instance(
        db_client=request.app.db_client
    )
    user = await user_model.get_user_by_id(user_id=int(user_id))

    if not user or not user.is_active:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"signal": ResponseSignal.INVALID_TOKEN.value}
        )

    request.state.user = user
    request.state.auth_type = "jwt"

    # 4. Project guard — block data/nlp routes if no project yet
    if request.url.path not in NO_PROJECT_ROUTES:
        from sqlalchemy.future import select
        from models.db_schemes import Project

        async with request.app.db_client() as session:
            result = await session.execute(
                select(Project).where(Project.user_id == user.user_id)
            )
            project = result.scalar_one_or_none()

        if not project:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"signal": ResponseSignal.PROJECT_NOT_FOUND_ERROR.value}
            )

        request.state.project = project

    return await call_next(request)