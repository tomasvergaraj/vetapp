"""
Modelo de servicio veterinario ofrecido.
"""
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, Enum, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.enums import ServiceCategory

if TYPE_CHECKING:
    from app.models.service_request import ServiceRequest


class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # Precio base opcional — null significa "valor a confirmar"
    base_price: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2), nullable=True
    )
    # Duración estimada en minutos
    estimated_duration_minutes: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )
    category: Mapped[ServiceCategory] = mapped_column(
        Enum(ServiceCategory, name="service_category"),
        default=ServiceCategory.OTRO,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

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
    requests: Mapped[List["ServiceRequest"]] = relationship(
        back_populates="service", cascade="save-update"
    )

    def __repr__(self) -> str:
        return f"<Service id={self.id} name={self.name!r}>"
