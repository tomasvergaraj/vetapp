"""
Schema base con configuración común para todos los schemas Pydantic.
"""
from pydantic import BaseModel, ConfigDict


class APIBaseModel(BaseModel):
    """
    Base para todos los schemas de la API.
    - from_attributes=True permite leer directamente desde modelos SQLAlchemy.
    - str_strip_whitespace recorta espacios en los strings de entrada.
    """
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
        validate_assignment=True,
    )
