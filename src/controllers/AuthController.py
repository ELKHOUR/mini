from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from helpers.config import get_settings
from sib_api_v3_sdk.rest import ApiException
import secrets
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
import httpx


logger = logging.getLogger("uvicorn.error")

class AuthController:

    def __init__(self):
        self.settings = get_settings()
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.algorithm = "HS256"

    # ==================== Password ====================

    def hash_password(self, password: str) -> str:
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)

    # ==================== JWT ====================

    def create_access_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(
            minutes=self.settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, self.settings.SECRET_KEY, algorithm=self.algorithm)

    def decode_access_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(token, self.settings.SECRET_KEY, algorithms=[self.algorithm])
            return payload
        except JWTError:
            return None

    # ==================== Verification Token ====================

    def generate_verification_token(self) -> str:
        return secrets.token_urlsafe(32)

    # ==================== API Key ====================

    def generate_api_key(self) -> str:
        return secrets.token_urlsafe(32)

    # ==================== Email ====================

   

    def send_verification_email(self, email: str, name: str, token: str) -> bool:
        try:
            verification_link = f"http://localhost:5173/verify/{token}"
            
            response = httpx.post(
                "https://api.brevo.com/v3/smtp/email",
                headers={
                    "api-key": self.settings.BREVO_API_KEY,
                    "Content-Type": "application/json"
                },
                json={
                    "sender": {
                        "email": self.settings.BREVO_SENDER_EMAIL,
                        "name": self.settings.BREVO_SENDER_NAME
                    },
                    "to": [{"email": email, "name": name}],
                    "subject": "Verify your email - Mini RAG",
                    "htmlContent": f"""
                        <h2>Welcome to Mini RAG, {name}!</h2>
                        <p>Click the link below to verify your email:</p>
                        <a href="{verification_link}">Verify Email</a>
                        <p>This link will expire in 24 hours.</p>
                    """
                }
            )
            
            logger.info(f"Brevo response: {response.status_code} - {response.text}")
            return response.status_code == 201
            
        except Exception as e:
            logger.error(f"Email error: {e}")
            return False