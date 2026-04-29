"""
Reexporta todos los modelos. Importar este módulo asegura que SQLAlchemy
registre todas las tablas en Base.metadata (necesario para Alembic y create_all).
"""
from app.models.client import Client
from app.models.coverage_zone import CoverageZone
from app.models.enums import (
    PetSex,
    PetType,
    RequestStatus,
    ServiceCategory,
    UrgencyLevel,
    UserRole,
)
from app.models.pet import Pet
from app.models.service import Service
from app.models.service_request import RequestStatusHistory, ServiceRequest
from app.models.user import User

__all__ = [
    # Modelos
    "User",
    "Service",
    "CoverageZone",
    "Client",
    "Pet",
    "ServiceRequest",
    "RequestStatusHistory",
    # Enums
    "UserRole",
    "PetType",
    "PetSex",
    "UrgencyLevel",
    "RequestStatus",
    "ServiceCategory",
]
