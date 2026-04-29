"""
Endpoint público: catálogo de servicios activos.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Service
from app.schemas.service import ServicePublicRead

router = APIRouter(prefix="/services", tags=["public"])


@router.get("", response_model=list[ServicePublicRead])
def list_active_services(db: Session = Depends(get_db)):
    """
    Devuelve los servicios activos para mostrar en la landing pública.
    Solo expone campos seguros (sin flags internos).
    """
    stmt = (
        select(Service)
        .where(Service.is_active.is_(True))
        .order_by(Service.category, Service.name)
    )
    return db.execute(stmt).scalars().all()
