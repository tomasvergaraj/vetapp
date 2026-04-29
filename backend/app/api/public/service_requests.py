"""
Endpoint público: creación de solicitudes de atención.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.service_request import (
    ServiceRequestConfirmation,
    ServiceRequestCreate,
)
from app.services.service_requests import (
    BusinessRuleError,
    create_service_request,
)

router = APIRouter(prefix="/service-requests", tags=["public"])


@router.post(
    "",
    response_model=ServiceRequestConfirmation,
    status_code=status.HTTP_201_CREATED,
    summary="Crear una nueva solicitud de atención (formulario público)",
)
def create_request(
    payload: ServiceRequestCreate,
    db: Session = Depends(get_db),
):
    """
    Crea una solicitud pública de atención.

    La solicitud queda en estado **pendiente** hasta que la veterinaria
    revise y confirme disponibilidad. **No agenda automáticamente** una hora.

    Reglas:
    - El servicio debe existir y estar activo.
    - La comuna debe estar dentro de las zonas de atención activas.
    - La fecha preferida no puede ser anterior a hoy.
    - Si se especifica ventana horaria, el inicio debe ser anterior al fin.
    """
    try:
        request = create_service_request(db, payload)
    except BusinessRuleError as exc:
        # 422 deja claro que es un problema con los datos, no un error de servidor
        detail: dict = {"message": str(exc)}
        if exc.field:
            detail["field"] = exc.field
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
        ) from exc

    return ServiceRequestConfirmation(
        id=request.id,
        status=request.status,
        created_at=request.created_at,
    )
