"""
CRUD de servicios para el panel admin.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.admin.deps import get_current_admin
from app.db.session import get_db
from app.models import Service
from app.schemas.service import ServiceCreate, ServiceRead, ServiceUpdate

router = APIRouter(
    prefix="/admin/services",
    tags=["admin"],
    dependencies=[Depends(get_current_admin)],
)


@router.get("", response_model=list[ServiceRead])
def list_services(db: Session = Depends(get_db)):
    """Lista todos los servicios (activos e inactivos)."""
    stmt = select(Service).order_by(Service.category, Service.name)
    return db.execute(stmt).scalars().all()


@router.post("", response_model=ServiceRead, status_code=status.HTTP_201_CREATED)
def create_service(payload: ServiceCreate, db: Session = Depends(get_db)):
    """Crea un nuevo servicio."""
    existing = db.query(Service).filter(Service.name == payload.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un servicio con ese nombre.",
        )
    service = Service(**payload.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.put("/{service_id}", response_model=ServiceRead)
def update_service(
    service_id: int,
    payload: ServiceUpdate,
    db: Session = Depends(get_db),
):
    """Actualiza un servicio existente."""
    service = db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado.")

    data = payload.model_dump(exclude_unset=True)

    # Si cambia el nombre, validar que no choque con otro
    if "name" in data and data["name"] != service.name:
        clash = db.query(Service).filter(Service.name == data["name"]).first()
        if clash:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe otro servicio con ese nombre.",
            )

    for field, value in data.items():
        setattr(service, field, value)

    db.commit()
    db.refresh(service)
    return service


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(service_id: int, db: Session = Depends(get_db)):
    """
    Elimina (desactiva) un servicio.
    Si el servicio tiene solicitudes asociadas, lo marcamos como inactivo
    en vez de borrarlo, para preservar el histórico.
    """
    service = db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado.")

    # Si tiene solicitudes, soft-delete
    if service.requests:
        service.is_active = False
        db.commit()
        return

    db.delete(service)
    db.commit()
