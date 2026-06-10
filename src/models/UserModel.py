from .BaseDataModel import BaseDataModel
from .db_schemes import User
from sqlalchemy.future import select


class UserModel(BaseDataModel):

    def __init__(self, db_client: object):
        super().__init__(db_client=db_client)
        self.db_client = db_client

    @classmethod
    async def create_instance(cls, db_client: object):
        instance = cls(db_client)
        return instance

    async def create_user(self, user: User):
        async with self.db_client() as session:
            async with session.begin():
                session.add(user)
            await session.commit()
            await session.refresh(user)
        return user

    async def get_user_by_email(self, email: str):
        async with self.db_client() as session:
            result = await session.execute(
                select(User).where(User.user_email == email)
            )
            return result.scalar_one_or_none()

    async def get_user_by_verification_token(self, token: str):
        async with self.db_client() as session:
            result = await session.execute(
                select(User).where(User.verification_token == token)
            )
            return result.scalar_one_or_none()

    async def update_user(self, user: User):
        async with self.db_client() as session:
            async with session.begin():
                await session.merge(user)
            await session.commit()
        return user
    
    async def get_user_by_id(self, user_id: int):
        async with self.db_client() as session:
            result = await session.execute(
                select(User).where(User.user_id == user_id)
            )
            return result.scalar_one_or_none()