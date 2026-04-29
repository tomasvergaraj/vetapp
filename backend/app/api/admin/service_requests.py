"""
Gestión de solicitudes de atención desde el panel admin.

Endpoints:
- GET    /admin/service-requests               -> listado con filtros
- GET    /admin/service-requests/{id}          -> detalle completo
- PATCH  /admin/service-requests/{id}/status   -> cambiar estado (con historial)
- PATCH  /admin/service-requests/{id}          -> editar precio final / notas internas
"""
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.admin.deps import get_current_admin
from app.db.session import get_db
from app.models import (
    RequestStatus,
    RequestStatusHistory,
    ServiceRequest,
    User,
)
from app.schemas.service_request import (
    ServiceRequestAdminUpdate,
    ServiceRequestDetail,
    ServiceRequestListItem,
    ServiceRequestStatusUpdate,
)
from app.services.request_mappers import to_list_item

router = APIRouter(
    prefix="/admin/service-requests",
    tags=["admin"],
    dependencies=[Depends(get_current_admin)],
)


# ------------------------------------------------------------------
# Reglas de transición de estado
# ------------------------------------------------------------------
# Definen qué estados se pueden alcanzar desde cada estado actual.
# CANCELADO se permite desde cualquier estado no terminal.
ALLOWED_TRANSITIONS: dict[RequestStatus, set[RequestStatus]] = {
    RequestStatus.PENDIENTE: {
        RequestStatus.CONTACTADO,
        RequestStatus.AGENDADO,
        RequestStatus.CANCELADO,
    },
    RequestStatus.CONTACTADO: {
        RequestStatus.AGENDADO,
        RequestStatus.CANCELADO,
        RequestStatus.PENDIENTE,  # permite retroceder si fue un error
    },
    RequestStatus.AGENDADO: {
        RequestStatus.EN_ATENCION,
        RequestStatus.CONTACTADO,
        RequestStatus.CANCELADO,
    },
    RequestStatus.EN_ATENCION: {
        RequestStatus.COMPLETADO,
        RequestStatus.CANCELADO,
    },
    RequestStatus.COMPLETADO: set(),  # estado terminal
    RequestStatus.CANCELADO: set(),   # estado terminal
}


def _is_transition_allowed(current: RequestStatus, target: RequestStatus) -> bool:
    return target in ALLOWED_TRANSITIONS.get(current, set())


# ------------------------------------------------------------------
# Endpoints
# ------------------------------------------------------------------

@router.get("", response_model=list[ServiceRequestListItem])
def list_requests(
    db: Session = Depends(get_db),
    status_filter: Optional[RequestStatus] = Query(default=None, alias="status"),
    date_from: Optional[date] = Query(default=None),
    date_to: Optional[date] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
):
    """
    Lista solicitudes con filtros opcionales.
    - `status`: filtra por estado.
    - `date_from` / `date_to`: filtran por `preferred_date`.
    Ordena por fecha de creación descendente.
    """
    stmt = (
        select(ServiceRequest)
        .options(
            selectinload(ServiceRequest.client),
            selectinload(ServiceRequest.pet),
            selectinload(ServiceRequest.service),
        )
        .order_by(ServiceRequest.created_at.desc())
    )

    if status_filter is not None:
        stmt = stmt.where(ServiceRequest.status == status_filter)
    if date_from is not None:
        stmt = stmt.where(ServiceRequest.preferred_date >= date_from)
    if date_to is not None:
        stmt = stmt.where(ServiceRequest.preferred_date <= date_to)

    stmt = stmt.offset(skip).limit(limit)
    rows = db.execute(stmt).scalars().all()
    return [to_list_item(r) for r in rows]


@router.get("/{request_id}", response_model=ServiceRequestDetail)
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
):
    """Detalle completo de una solicitud, con cliente, mascota, servicio e historial."""
    stmt = (
        select(ServiceRequest)
        .where(ServiceRequest.id == request_id)
        .options(
            selectinload(ServiceRequest.client),
            selectinload(ServiceRequest.pet),
            selectinload(ServiceRequest.service),
            selectinload(ServiceRequest.status_history),
        )
    )
    request = db.execute(stmt).scalar_one_or_none()
    if not request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada.")
    return request


@router.patch("/{request_id}/status", response_model=ServiceRequestDetail)
def update_status(
    request_id: int,
    payload: ServiceRequestStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """
    Cambia el estado de una solicitud y registra el cambio en el historial.
    Valida que la transición sea permitida.
    """
    request = db.get(ServiceRequest, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada.")

    if request.status == payload.status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La solicitud ya está en estado '{payload.status.value}'.",
        )

    if not _is_transition_allowed(request.status, payload.status):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Transición no permitida: '{request.status.value}' "
                f"→ '{payload.status.value}'."
            ),
        )

    previous_status = request.status
    request.status = payload.status

    history = RequestStatusHistory(
        request_id=request.id,
        from_status=previous_status,
        to_status=payload.status,
        note=payload.note,
        changed_by_user_id=current_user.id,
    )
    db.add(history)
    db.commit()

    # Reabrir con relaciones cargadas
    return db.execute(
        select(ServiceRequest)
        .where(ServiceRequest.id == request_id)
        .options(
            selectinload(ServiceRequest.client),
            selectinload(ServiceRequest.pet),
            selectinload(ServiceRequest.service),
            selectinload(ServiceRequest.status_history),
        )
    ).scalar_one()


@router.patch("/{request_id}", response_model=ServiceRequestDetail)
def update_request(
    request_id: int,
    payload: ServiceRequestAdminUpdate,
    db: Session = Depends(get_db),
):
    """Actualiza precio final y/o notas internas de una solicitud."""
    request = db.get(ServiceRequest, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada.")

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(request, field, value)

    db.commit()

    return db.execute(
        select(ServiceRequest)
        .where(ServiceRequest.id == request_id)
        .options(
            selectinload(ServiceRequest.client),
            selectinload(ServiceRequest.pet),
            selectinload(ServiceRequest.service),
            selectinload(ServiceRequest.status_history),
        )
    ).scalar_one()
