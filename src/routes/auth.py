from fastapi import APIRouter, Request, status, BackgroundTasks  
from fastapi.responses import JSONResponse
from models.UserModel import UserModel
from models import ResponseSignal
from models.ProjectModel import ProjectModel
from models.db_schemes import User, Project
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
async def register(request: Request, register_request: RegisterRequest, background_tasks: BackgroundTasks):

    user_model = await UserModel.create_instance(
        db_client=request.app.db_client
    )

    # check if email already exists
    existing_user = await user_model.get_user_by_email(
        email=register_request.email
    )
    if existing_user:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"signal": ResponseSignal.EMAIL_ALREADY_EXISTS.value}
        )

    # create verification token
    verification_token = auth_controller.generate_verification_token()

    # create api key
    api_key = auth_controller.generate_api_key()

    # hash password
    hashed_password = auth_controller.hash_password(register_request.password)

    # create user
    user = User(
        user_name=register_request.name,
        user_email=register_request.email,
        user_password=hashed_password,
        is_active=False,
        verification_token=verification_token,
    )
    user = await user_model.create_user(user=user)

    # create project for user
    project_model = await ProjectModel.create_instance(
        db_client=request.app.db_client
    )
    project = Project(
        user_id=user.user_id,
        project_api_key=api_key,
        project_lang=register_request.project_lang,
    )
    async with request.app.db_client() as session:
        async with session.begin():
            session.add(project)
        await session.commit()
        await session.refresh(project)

    # send verification email
    # email_sent = auth_controller.send_verification_email(
    #     email=user.user_email,
    #     name=user.user_name,
    #     token=verification_token
    # )

    background_tasks.add_task(
        auth_controller.send_verification_email,
        email=user.user_email,
        name=user.user_name,
        token=verification_token
    )

    # if not email_sent:
    #     logger.error(f"Failed to send verification email to {user.user_email}")

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "signal": ResponseSignal.REGISTER_SUCCESS_SIGNAL.value,
            "message": ResponseSignal.REGISTER_SUCCESS_MESSAGE.value,
        }
    )


@auth_router.get("/verify/{token}")
async def verify_email(request: Request, token: str):

    user_model = await UserModel.create_instance(
        db_client=request.app.db_client
    )

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

    user_model = await UserModel.create_instance(
        db_client=request.app.db_client
    )

    # check if user exists
    user = await user_model.get_user_by_email(email=login_request.email)
    if not user:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"signal": ResponseSignal.INVALID_EMAIL_OR_PASSWORD.value}
        )

    # check password
    if not auth_controller.verify_password(login_request.password, user.user_password):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"signal": ResponseSignal.INVALID_EMAIL_OR_PASSWORD.value}
        )

    # check if active
    if not user.is_active:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"signal": ResponseSignal.EMAIL_NOT_VERIFIED.value}
        )

    # generate JWT
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




@auth_router.get("/me")
async def get_me(request: Request):

    # user is set by JWT middleware
    if not hasattr(request.state, "user"):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"signal": "unauthorized"}
        )

    user = request.state.user

    # get user's project
    project_model = await ProjectModel.create_instance(
        db_client=request.app.db_client
    )

    async with request.app.db_client() as session:
        from sqlalchemy.future import select
        from models.db_schemes import Project
        result = await session.execute(
            select(Project).where(Project.user_id == user.user_id)
        )
        project = result.scalar_one_or_none()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "user_id": user.user_id,
            "name": user.user_name,
            "email": user.user_email,
            "project_id": project.project_id if project else None,
            "api_key": project.project_api_key if project else None,
            "project_lang": project.project_lang if project else None,
        }
    )