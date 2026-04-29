"""
Schemas Pydantic para CoverageZone.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import Field

from app.schemas.base import APIBaseModel


class CoverageZoneBase(APIBaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    travel_surcharge: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2)
    notes: Optional[str] = Field(default=None, max_length=1000)
    is_active: bool = True


class CoverageZoneCreate(CoverageZoneBase):
    pass


class CoverageZoneUpdate(APIBaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    travel_surcharge: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2)
    notes: Optional[str] = Field(default=None, max_length=1000)
    is_active: Optional[bool] = None


class CoverageZoneRead(CoverageZoneBase):
    id: int
    created_at: datetime
    updated_at: datetime


class CoverageZonePublicRead(APIBaseModel):
    """Versión pública mínima — solo lo necesario para el formulario."""
    id: int
    name: str
    travel_surcharge: Optional[Decimal]
