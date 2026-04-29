"""
Lógica de negocio para solicitudes de atención.

Mantiene los routers delgados y centraliza las validaciones cruzadas
(verificación de servicio activo, zona activa, etc.) y la creación
transaccional de la cadena Cliente → Mascota → Solicitud → Historial.
"""
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import (
    Client,
    CoverageZone,
    Pet,
    RequestStatus,
    RequestStatusHistory,
    Service,
    ServiceRequest,
)
from app.schemas.service_request import ServiceRequestCreate


class BusinessRuleError(Exception):
    """Error de regla de negocio. El router lo traduce a HTTP 400/422."""

    def __init__(self, message: str, field: Optional[str] = None):
        super().__init__(message)
        self.field = field


def _find_or_create_client(db: Session, payload) -> Client:
    """
    Busca un cliente existente por email + teléfono normalizado.
    Si existe, actualiza datos básicos (nombre/dirección/comuna). Si no, lo crea.
    Esto evita duplicados cuando el mismo dueño hace múltiples solicitudes.
    """
    existing = (
        db.query(Client)
        .filter(Client.email == payload.email, Client.phone == payload.phone)
        .first()
    )
    if existing:
        # Refresca datos por si el cliente cambió de dirección
        existing.full_name = payload.full_name
        existing.address = payload.address
        existing.commune = payload.commune
        existing.location_reference = payload.location_reference
        db.flush()
        return existing

    client = Client(
        full_name=payload.full_name,
        phone=payload.phone,
        email=payload.email,
        address=payload.address,
        commune=payload.commune,
        location_reference=payload.location_reference,
    )
    db.add(client)
    db.flush()  # asigna id sin cerrar la transacción
    return client


def _create_pet(db: Session, owner: Client, payload) -> Pet:
    """
    Crea siempre una nueva mascota asociada al cliente.
    No deduplicamos porque un cliente puede tener varias mascotas con el mismo nombre,
    y los datos (peso, edad) cambian en el tiempo.
    """
    pet = Pet(
        owner_id=owner.id,
        name=payload.name,
        pet_type=payload.pet_type,
        breed=payload.breed,
        approximate_age_years=payload.approximate_age_years,
        approximate_weight_kg=payload.approximate_weight_kg,
        sex=payload.sex,
        notes=payload.notes,
    )
    db.add(pet)
    db.flush()
    return pet


def _validate_service(db: Session, service_id: int) -> Service:
    service = db.get(Service, service_id)
    if not service:
        raise BusinessRuleError("El servicio solicitado no existe.", field="service_id")
    if not service.is_active:
        raise BusinessRuleError(
            "El servicio solicitado no está disponible actualmente.",
            field="service_id",
        )
    return service


def _validate_commune(db: Session, commune_name: str) -> CoverageZone:
    """
    Verifica que la comuna del cliente esté dentro de las zonas de atención activas.
    La comparación es case-insensitive y tolerante a espacios.
    """
    normalized = commune_name.strip().lower()
    zone = (
        db.execute(
            select(CoverageZone).where(CoverageZone.is_active.is_(True))
        )
        .scalars()
        .all()
    )
    for z in zone:
        if z.name.strip().lower() == normalized:
            return z

    raise BusinessRuleError(
        "Lo sentimos, aún no atendemos en esa comuna. "
        "Puedes contactarnos para consultar disponibilidad.",
        field="client.commune",
    )


def create_service_request(
    db: Session, payload: ServiceRequestCreate
) -> ServiceRequest:
    """
    Crea una solicitud completa de forma transaccional:
      1. Valida que el servicio exista y esté activo.
      2. Valida que la comuna esté cubierta.
      3. Crea o reutiliza el cliente.
      4. Crea la mascota.
      5. Crea la solicitud en estado PENDIENTE.
      6. Registra el primer evento en el historial de estados.

    Si algo falla, se hace rollback completo.
    """
    try:
        service = _validate_service(db, payload.service_id)

        client = _find_or_create_client(db, payload.client)
        pet = _create_pet(db, client, payload.pet)

        request = ServiceRequest(
            client_id=client.id,
            pet_id=pet.id,
            service_id=service.id,
            preferred_date=payload.preferred_date,
            preferred_time_start=payload.preferred_time_start,
            preferred_time_end=payload.preferred_time_end,
            description=payload.description,
            urgency=payload.urgency,
            accepts_whatsapp=payload.accepts_whatsapp,
            status=RequestStatus.PENDIENTE,
            commune_snapshot=payload.client.commune,
        )
        db.add(request)
        db.flush()

        # Primer evento del historial: creación
        history = RequestStatusHistory(
            request_id=request.id,
            from_status=None,
            to_status=RequestStatus.PENDIENTE,
            note="Solicitud creada por el cliente.",
            changed_by_user_id=None,
        )
        db.add(history)

        db.commit()
        db.refresh(request)
        return request

    except BusinessRuleError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise


def get_service_request_detail(
    db: Session, request_id: int
) -> Optional[ServiceRequest]:
    """Obtiene una solicitud con todas sus relaciones cargadas."""
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
    return db.execute(stmt).scalar_one_or_none()
