from fastapi import APIRouter, Request, status, BackgroundTasks
from fastapi.responses import JSONResponse
from models.UserModel import UserModel
from models import ResponseSignal
from models.db_schemes import User
from controllers.AuthController import AuthController
from routes.schemes.auth import RegisterRequest, LoginRequest
import logging

logger = logging.getLogger("uvicorn.error")

auth_router = APIRouter(
    prefix="/api/v1/auth",
    tags=["api_v1", "auth"],
)

auth_controller = AuthController()


@auth_router.post("/register")
async def register(request: Request, register_request: RegisterRequest,
                   background_tasks: BackgroundTasks):

    user_model = await UserModel.create_instance(db_client=request.app.db_client)

    existing_user = await user_model.get_user_by_email(email=register_request.email)
    if existing_user:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"signal": ResponseSignal.EMAIL_ALREADY_EXISTS.value}
        )

    verification_token = auth_controller.generate_verification_token()
    hashed_password = auth_controller.hash_password(register_request.password)

    user = User(
        user_name=register_request.name,
        user_email=register_request.email,
        user_password=hashed_password,
        is_active=False,
        verification_token=verification_token,
    )
    user = await user_model.create_user(user=user)

    background_tasks.add_task(
        auth_controller.send_verification_email,
        email=user.user_email,
        name=user.user_name,
        token=verification_token
    )

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "signal": ResponseSignal.REGISTER_SUCCESS_SIGNAL.value,
            "message": ResponseSignal.REGISTER_SUCCESS_MESSAGE.value,
        }
    )


@auth_router.get("/verify/{token}")
async def verify_email(request: Request, token: str):

    user_model = await UserModel.create_instance(db_client=request.app.db_client)
    user = await user_model.get_user_by_verification_token(token=token)

    if not user:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"signal": ResponseSignal.INVALID_TOKEN.value}
        )

    user.is_active = True
    user.verification_token = None
    await user_model.update_user(user=user)

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"signal": ResponseSignal.EMAIL_VERIFIED_SUCCESS.value}
    )


@auth_router.post("/login")
async def login(request: Request, login_request: LoginRequest):

    user_model = await UserModel.create_instance(db_client=request.app.db_client)

    user = await user_model.get_user_by_email(email=login_request.email)
    if not user:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"signal": ResponseSignal.INVALID_EMAIL_OR_PASSWORD.value}
        )

    if not auth_controller.verify_password(login_request.password, user.user_password):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"signal": ResponseSignal.INVALID_EMAIL_OR_PASSWORD.value}
        )

    if not user.is_active:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"signal": ResponseSignal.EMAIL_NOT_VERIFIED.value}
        )

    access_token = auth_controller.create_access_token(
        data={"sub": str(user.user_id)}
    )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "signal": ResponseSignal.LOGIN_SUCCESS.value,
            "access_token": access_token,
            "token_type": "bearer",
        }
    )