from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    project_lang: str = "en"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str