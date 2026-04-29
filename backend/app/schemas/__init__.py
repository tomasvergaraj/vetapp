"""Reexporta todos los schemas Pydantic."""
from app.schemas.auth import LoginRequest, TokenResponse, UserRead
from app.schemas.client_pet import (
    ClientBase,
    ClientCreate,
    ClientRead,
    PetBase,
    PetCreate,
    PetRead,
)
from app.schemas.coverage_zone import (
    CoverageZoneBase,
    CoverageZoneCreate,
    CoverageZonePublicRead,
    CoverageZoneRead,
    CoverageZoneUpdate,
)
from app.schemas.dashboard import DashboardResponse, DashboardStats
from app.schemas.service import (
    ServiceBase,
    ServiceCreate,
    ServicePublicRead,
    ServiceRead,
    ServiceUpdate,
)
from app.schemas.service_request import (
    RequestStatusHistoryRead,
    ServiceRequestAdminUpdate,
    ServiceRequestConfirmation,
    ServiceRequestCreate,
    ServiceRequestDetail,
    ServiceRequestListItem,
    ServiceRequestStatusUpdate,
)

__all__ = [
    "LoginRequest", "TokenResponse", "UserRead",
    "ClientBase", "ClientCreate", "ClientRead",
    "PetBase", "PetCreate", "PetRead",
    "CoverageZoneBase", "CoverageZoneCreate", "CoverageZoneRead",
    "CoverageZoneUpdate", "CoverageZonePublicRead",
    "ServiceBase", "ServiceCreate", "ServiceRead", "ServiceUpdate",
    "ServicePublicRead",
    "ServiceRequestCreate", "ServiceRequestConfirmation",
    "ServiceRequestDetail", "ServiceRequestListItem",
    "ServiceRequestStatusUpdate", "ServiceRequestAdminUpdate",
    "RequestStatusHistoryRead",
    "DashboardResponse", "DashboardStats",
]
