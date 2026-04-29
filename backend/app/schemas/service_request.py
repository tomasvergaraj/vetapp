"""
Schemas Pydantic para ServiceRequest y RequestStatusHistory.
"""
from datetime import date, datetime, time, timezone
from decimal import Decimal
from typing import Optional

from pydantic import Field, field_validator, model_validator

from app.models.enums import RequestStatus, UrgencyLevel
from app.schemas.base import APIBaseModel
from app.schemas.client_pet import ClientCreate, ClientRead, PetCreate, PetRead
from app.schemas.service import ServicePublicRead


# ===================== Creación pública =====================

class ServiceRequestCreate(APIBaseModel):
    """
    Payload del formulario público.
    Anida todos los datos del cliente, mascota y solicitud.
    """
    # Datos del dueño
    client: ClientCreate

    # Datos de la mascota
    pet: PetCreate

    # Detalles de la solicitud
    service_id: int = Field(..., gt=0)
    preferred_date: date
    preferred_time_start: Optional[time] = None
    preferred_time_end: Optional[time] = None
    description: Optional[str] = Field(default=None, max_length=2000)
    urgency: UrgencyLevel = UrgencyLevel.BAJA
    accepts_whatsapp: bool = True

    @field_validator("preferred_date")
    @classmethod
    def date_not_in_past(cls, v: date) -> date:
        today = datetime.now(timezone.utc).date()
        if v < today:
            raise ValueError("La fecha preferida no puede ser anterior a hoy.")
        return v

    @model_validator(mode="after")
    def validate_time_window(self) -> "ServiceRequestCreate":
        start, end = self.preferred_time_start, self.preferred_time_end
        # Si solo se entregó uno, está bien (ventana abierta)
        if start and end and start >= end:
            raise ValueError(
                "El horario de inicio debe ser anterior al horario de fin."
            )
        return self


# ===================== Confirmación pública =====================

class ServiceRequestConfirmation(APIBaseModel):
    """
    Respuesta al cliente tras crear una solicitud.
    Solo expone lo mínimo: id, estado y mensaje.
    """
    id: int
    status: RequestStatus
    created_at: datetime
    message: str = (
        "Solicitud recibida correctamente. La veterinaria revisará tu solicitud "
        "y se contactará contigo para confirmar disponibilidad, horario y valor "
        "final del servicio."
    )


# ===================== Lectura admin =====================

class RequestStatusHistoryRead(APIBaseModel):
    id: int
    from_status: Optional[RequestStatus]
    to_status: RequestStatus
    note: Optional[str]
    changed_by_user_id: Optional[int]
    created_at: datetime


class ServiceRequestListItem(APIBaseModel):
    """Versión resumida para el listado en el panel admin."""
    id: int
    status: RequestStatus
    urgency: UrgencyLevel
    preferred_date: date
    preferred_time_start: Optional[time]
    preferred_time_end: Optional[time]
    commune_snapshot: str
    final_price: Optional[Decimal]
    created_at: datetime

    # Datos resumidos
    client_name: str
    client_phone: str
    pet_name: str
    service_name: str


class ServiceRequestDetail(APIBaseModel):
    """Detalle completo para el panel admin."""
    id: int
    status: RequestStatus
    urgency: UrgencyLevel
    preferred_date: date
    preferred_time_start: Optional[time]
    preferred_time_end: Optional[time]
    description: Optional[str]
    accepts_whatsapp: bool
    final_price: Optional[Decimal]
    internal_notes: Optional[str]
    commune_snapshot: str
    created_at: datetime
    updated_at: datetime

    client: ClientRead
    pet: PetRead
    service: ServicePublicRead
    status_history: list[RequestStatusHistoryRead] = []


# ===================== Cambio de estado (admin) =====================

class ServiceRequestStatusUpdate(APIBaseModel):
    status: RequestStatus
    note: Optional[str] = Field(default=None, max_length=1000)


class ServiceRequestAdminUpdate(APIBaseModel):
    """Permite editar precio final o notas internas."""
    final_price: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2)
    internal_notes: Optional[str] = Field(default=None, max_length=2000)
