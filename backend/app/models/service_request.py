"""
Modelos de solicitud de atención y su historial de cambios de estado.
"""
from datetime import date, datetime, time
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Numeric,
    String,
    Text,
    Time,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.enums import RequestStatus, UrgencyLevel

if TYPE_CHECKING:
    from app.models.client import Client
    from app.models.pet import Pet
    from app.models.service import Service
    from app.models.user import User


class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Relaciones obligatorias
    client_id: Mapped[int] = mapped_column(
        ForeignKey("clients.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    pet_id: Mapped[int] = mapped_column(
        ForeignKey("pets.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    service_id: Mapped[int] = mapped_column(
        ForeignKey("services.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    # Detalle de la solicitud
    preferred_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    preferred_time_start: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    preferred_time_end: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    urgency: Mapped[UrgencyLevel] = mapped_column(
        Enum(UrgencyLevel, name="urgency_level"),
        default=UrgencyLevel.BAJA,
        nullable=False,
    )
    accepts_whatsapp: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )

    # Estado y precio
    status: Mapped[RequestStatus] = mapped_column(
        Enum(RequestStatus, name="request_status"),
        default=RequestStatus.PENDIENTE,
        nullable=False,
        index=True,
    )
    # Precio final fijado por la veterinaria (puede quedar null si todavía "a confirmar")
    final_price: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2), nullable=True
    )
    # Notas privadas del admin (no visibles al cliente)
    internal_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Snapshot textual de la comuna al momento de la solicitud
    # (útil aunque la coverage_zone cambie de nombre o se desactive)
    commune_snapshot: Mapped[str] = mapped_column(String(150), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relaciones
    client: Mapped["Client"] = relationship(back_populates="requests")
    pet: Mapped["Pet"] = relationship(back_populates="requests")
    service: Mapped["Service"] = relationship(back_populates="requests")
    status_history: Mapped[List["RequestStatusHistory"]] = relationship(
        back_populates="request",
        cascade="all, delete-orphan",
        order_by="RequestStatusHistory.created_at.asc()",
    )

    def __repr__(self) -> str:
        return (
            f"<ServiceRequest id={self.id} status={self.status.value} "
            f"client_id={self.client_id}>"
        )


class RequestStatusHistory(Base):
    """Registro inmutable de cada cambio de estado de una solicitud."""

    __tablename__ = "request_status_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    request_id: Mapped[int] = mapped_column(
        ForeignKey("service_requests.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    from_status: Mapped[Optional[RequestStatus]] = mapped_column(
        Enum(RequestStatus, name="request_status"), nullable=True
    )
    to_status: Mapped[RequestStatus] = mapped_column(
        Enum(RequestStatus, name="request_status"), nullable=False
    )
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Quién hizo el cambio (puede ser null si lo hizo el sistema, ej. creación)
    changed_by_user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    # Relaciones
    request: Mapped["ServiceRequest"] = relationship(back_populates="status_history")
    changed_by: Mapped[Optional["User"]] = relationship()

    def __repr__(self) -> str:
        return (
            f"<RequestStatusHistory id={self.id} "
            f"{self.from_status} -> {self.to_status.value}>"
        )
