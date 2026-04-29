"""
Dashboard del panel admin: estadísticas + próximas atenciones + últimas solicitudes.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.api.admin.deps import get_current_admin
from app.db.session import get_db
from app.models import RequestStatus, ServiceRequest, User
from app.schemas.dashboard import DashboardResponse, DashboardStats
from app.services.request_mappers import to_list_item

router = APIRouter(
    prefix="/admin/dashboard",
    tags=["admin"],
    dependencies=[Depends(get_current_admin)],
)


def _count(db: Session, status: RequestStatus | None = None) -> int:
    stmt = select(func.count(ServiceRequest.id))
    if status is not None:
        stmt = stmt.where(ServiceRequest.status == status)
    return db.execute(stmt).scalar_one()


@router.get("", response_model=DashboardResponse)
def dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """
    Devuelve:
    - Conteos globales por estado.
    - Próximas atenciones agendadas (>= hoy).
    - Últimas 10 solicitudes recibidas.
    """
    stats = DashboardStats(
        total_requests=_count(db),
        pending_requests=_count(db, RequestStatus.PENDIENTE),
        scheduled_requests=_count(db, RequestStatus.AGENDADO),
        completed_requests=_count(db, RequestStatus.COMPLETADO),
        in_attention_requests=_count(db, RequestStatus.EN_ATENCION),
        canceled_requests=_count(db, RequestStatus.CANCELADO),
    )

    today = datetime.now(timezone.utc).date()

    upcoming_stmt = (
        select(ServiceRequest)
        .where(
            ServiceRequest.status.in_(
                [RequestStatus.AGENDADO, RequestStatus.CONTACTADO]
            ),
            ServiceRequest.preferred_date >= today,
        )
        .options(
            selectinload(ServiceRequest.client),
            selectinload(ServiceRequest.pet),
            selectinload(ServiceRequest.service),
        )
        .order_by(
            ServiceRequest.preferred_date.asc(),
            ServiceRequest.preferred_time_start.asc().nullslast(),
        )
        .limit(10)
    )
    upcoming = db.execute(upcoming_stmt).scalars().all()

    latest_stmt = (
        select(ServiceRequest)
        .options(
            selectinload(ServiceRequest.client),
            selectinload(ServiceRequest.pet),
            selectinload(ServiceRequest.service),
        )
        .order_by(ServiceRequest.created_at.desc())
        .limit(10)
    )
    latest = db.execute(latest_stmt).scalars().all()

    return DashboardResponse(
        stats=stats,
        upcoming_appointments=[to_list_item(r) for r in upcoming],
        latest_requests=[to_list_item(r) for r in latest],
    )
