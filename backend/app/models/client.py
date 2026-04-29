"""
Modelo de cliente (dueño de mascota).
Se crea automáticamente al recibir una solicitud pública.
No tiene autenticación: la identidad se reutiliza por email + teléfono.
"""
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.pet import Pet
    from app.models.service_request import ServiceRequest


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    address: Mapped[str] = mapped_column(String(300), nullable=False)
    commune: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    location_reference: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relaciones
    pets: Mapped[List["Pet"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )
    requests: Mapped[List["ServiceRequest"]] = relationship(
        back_populates="client", cascade="save-update"
    )

    def __repr__(self) -> str:
        return f"<Client id={self.id} email={self.email}>"
