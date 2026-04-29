"""
Endpoint público: zonas de atención activas.
Se usa para poblar el dropdown de comunas en el formulario.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import CoverageZone
from app.schemas.coverage_zone import CoverageZonePublicRead

router = APIRouter(prefix="/coverage-zones", tags=["public"])


@router.get("", response_model=list[CoverageZonePublicRead])
def list_active_zones(db: Session = Depends(get_db)):
    """Devuelve las comunas activas ordenadas alfabéticamente."""
    stmt = (
        select(CoverageZone)
        .where(CoverageZone.is_active.is_(True))
        .order_by(CoverageZone.name)
    )
    return db.execute(stmt).scalars().all()
