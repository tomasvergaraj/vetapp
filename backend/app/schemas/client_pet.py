"""
Schemas Pydantic para Pet y Client.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import EmailStr, Field, field_validator

from app.models.enums import PetSex, PetType
from app.schemas.base import APIBaseModel


# ===================== Pet =====================

class PetBase(APIBaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    pet_type: PetType
    breed: Optional[str] = Field(default=None, max_length=150)
    approximate_age_years: Optional[Decimal] = Field(
        default=None, ge=0, le=40, decimal_places=1
    )
    approximate_weight_kg: Optional[Decimal] = Field(
        default=None, ge=0, le=200, decimal_places=2
    )
    sex: PetSex = PetSex.DESCONOCIDO
    notes: Optional[str] = Field(default=None, max_length=1000)


class PetCreate(PetBase):
    """Datos de la mascota al crear una solicitud (sin owner_id, se asigna luego)."""
    pass


class PetRead(PetBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime


# ===================== Client =====================

class ClientBase(APIBaseModel):
    full_name: str = Field(..., min_length=2, max_length=200)
    phone: str = Field(..., min_length=6, max_length=50)
    email: EmailStr
    address: str = Field(..., min_length=3, max_length=300)
    commune: str = Field(..., min_length=2, max_length=150)
    location_reference: Optional[str] = Field(default=None, max_length=500)

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, v: str) -> str:
        """Quita espacios internos pero conserva + y dígitos."""
        cleaned = "".join(ch for ch in v if ch.isdigit() or ch == "+")
        if len(cleaned) < 6:
            raise ValueError("Teléfono demasiado corto")
        return cleaned


class ClientCreate(ClientBase):
    """Datos del dueño al crear una solicitud."""
    pass


class ClientRead(ClientBase):
    id: int
    created_at: datetime
    updated_at: datetime
