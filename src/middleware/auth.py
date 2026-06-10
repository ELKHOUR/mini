from fastapi import Request, status
from fastapi.responses import JSONResponse
from controllers.AuthController import AuthController
from models.UserModel import UserModel
from models import ResponseSignal

auth_controller = AuthController()

async def auth_middleware(request: Request, call_next):

    # Public routes — no token needed
    public_routes = [
        "/api/v1/auth/register",
        "/api/v1/auth/login",
        "/api/v1/",
        "/api/v1",
    ]

    # Skip auth for public routes and verify routes
    if request.url.path in public_routes or request.url.path.startswith("/api/v1/auth/verify"):
        return await call_next(request)

    # Check for API key (for external bot usage)
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

    # Check for JWT token
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

    return await call_next(request)