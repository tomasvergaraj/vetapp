"""
CRUD de zonas de atención para el panel admin.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.admin.deps import get_current_admin
from app.db.session import get_db
from app.models import CoverageZone
from app.schemas.coverage_zone import (
    CoverageZoneCreate,
    CoverageZoneRead,
    CoverageZoneUpdate,
)

router = APIRouter(
    prefix="/admin/coverage-zones",
    tags=["admin"],
    dependencies=[Depends(get_current_admin)],
)


@router.get("", response_model=list[CoverageZoneRead])
def list_zones(db: Session = Depends(get_db)):
    """Lista todas las zonas (activas e inactivas)."""
    stmt = select(CoverageZone).order_by(CoverageZone.name)
    return db.execute(stmt).scalars().all()


@router.post("", response_model=CoverageZoneRead, status_code=status.HTTP_201_CREATED)
def create_zone(payload: CoverageZoneCreate, db: Session = Depends(get_db)):
    """Crea una nueva zona."""
    existing = (
        db.query(CoverageZone).filter(CoverageZone.name == payload.name).first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una zona con ese nombre.",
        )
    zone = CoverageZone(**payload.model_dump())
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone


@router.put("/{zone_id}", response_model=CoverageZoneRead)
def update_zone(
    zone_id: int,
    payload: CoverageZoneUpdate,
    db: Session = Depends(get_db),
):
    """Actualiza una zona existente."""
    zone = db.get(CoverageZone, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zona no encontrada.")

    data = payload.model_dump(exclude_unset=True)

    if "name" in data and data["name"] != zone.name:
        clash = (
            db.query(CoverageZone).filter(CoverageZone.name == data["name"]).first()
        )
        if clash:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe otra zona con ese nombre.",
            )

    for field, value in data.items():
        setattr(zone, field, value)

    db.commit()
    db.refresh(zone)
    return zone


@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_zone(zone_id: int, db: Session = Depends(get_db)):
    """Elimina una zona. Si está referenciada (snapshot), basta con desactivarla."""
    zone = db.get(CoverageZone, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zona no encontrada.")
    db.delete(zone)
    db.commit()
