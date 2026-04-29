"""
Schemas Pydantic para autenticación y usuarios (admin).
"""
from datetime import datetime

from pydantic import EmailStr, Field

from app.models.enums import UserRole
from app.schemas.base import APIBaseModel


# ===================== Auth =====================

class LoginRequest(APIBaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=200)


class TokenResponse(APIBaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # segundos


# ===================== User =====================

class ChangePasswordRequest(APIBaseModel):
    current_password: str = Field(..., min_length=1, max_length=200)
    new_password: str = Field(..., min_length=8, max_length=200)

class UserRead(APIBaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime
