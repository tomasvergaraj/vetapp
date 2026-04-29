"""
Helpers para construir las representaciones de lectura de ServiceRequest.
Mantiene la lógica de mapeo en un solo lugar.
"""
from app.models import ServiceRequest
from app.schemas.service_request import (
    ServiceRequestDetail,
    ServiceRequestListItem,
)


def to_list_item(request: ServiceRequest) -> ServiceRequestListItem:
    """Construye el item resumido para listados del panel admin."""
    return ServiceRequestListItem(
        id=request.id,
        status=request.status,
        urgency=request.urgency,
        preferred_date=request.preferred_date,
        preferred_time_start=request.preferred_time_start,
        preferred_time_end=request.preferred_time_end,
        commune_snapshot=request.commune_snapshot,
        final_price=request.final_price,
        created_at=request.created_at,
        client_name=request.client.full_name,
        client_phone=request.client.phone,
        pet_name=request.pet.name,
        service_name=request.service.name,
    )


def to_detail(request: ServiceRequest) -> ServiceRequestDetail:
    """Construye el detalle completo para el panel admin."""
    return ServiceRequestDetail.model_validate(request)
