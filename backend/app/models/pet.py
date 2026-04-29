"""
Modelo de mascota.
"""
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.enums import PetSex, PetType

if TYPE_CHECKING:
    from app.models.client import Client
    from app.models.service_request import ServiceRequest


class Pet(Base):
    __tablename__ = "pets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    pet_type: Mapped[PetType] = mapped_column(
        Enum(PetType, name="pet_type"), nullable=False
    )
    breed: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    # Edad aproximada en años (decimal para permitir "0.5" = 6 meses)
    approximate_age_years: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(4, 1), nullable=True
    )
    # Peso aproximado en kg
    approximate_weight_kg: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2), nullable=True
    )
    sex: Mapped[PetSex] = mapped_column(
        Enum(PetSex, name="pet_sex"),
        default=PetSex.DESCONOCIDO,
        nullable=False,
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

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
    owner: Mapped["Client"] = relationship(back_populates="pets")
    requests: Mapped[List["ServiceRequest"]] = relationship(
        back_populates="pet", cascade="save-update"
    )

    def __repr__(self) -> str:
        return f"<Pet id={self.id} name={self.name!r} owner_id={self.owner_id}>"
