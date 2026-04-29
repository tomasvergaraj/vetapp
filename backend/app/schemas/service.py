"""
Schemas Pydantic para Service.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import Field

from app.models.enums import ServiceCategory
from app.schemas.base import APIBaseModel


class ServiceBase(APIBaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = Field(default=None, max_length=2000)
    base_price: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2)
    estimated_duration_minutes: Optional[int] = Field(default=None, ge=5, le=600)
    category: ServiceCategory = ServiceCategory.OTRO
    is_active: bool = True


class ServiceCreate(ServiceBase):
    """Datos para crear un servicio (admin)."""
    pass


class ServiceUpdate(APIBaseModel):
    """Datos para actualizar un servicio. Todos opcionales."""
    name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    description: Optional[str] = Field(default=None, max_length=2000)
    base_price: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2)
    estimated_duration_minutes: Optional[int] = Field(default=None, ge=5, le=600)
    category: Optional[ServiceCategory] = None
    is_active: Optional[bool] = None


class ServiceRead(ServiceBase):
    """Servicio expuesto por la API."""
    id: int
    created_at: datetime
    updated_at: datetime


class ServicePublicRead(APIBaseModel):
    """
    Versión pública (resumida) del servicio para la landing.
    Solo expone campos seguros para clientes no autenticados.
    """
    id: int
    name: str
    description: Optional[str]
    base_price: Optional[Decimal]
    estimated_duration_minutes: Optional[int]
    category: ServiceCategory
