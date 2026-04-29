"""
Enums usados a lo largo del dominio.
Se definen como str para serializarse fácilmente en JSON y persistirse legibles en DB.
"""
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"


class PetType(str, enum.Enum):
    PERRO = "perro"
    GATO = "gato"
    OTRO = "otro"


class PetSex(str, enum.Enum):
    MACHO = "macho"
    HEMBRA = "hembra"
    DESCONOCIDO = "desconocido"


class UrgencyLevel(str, enum.Enum):
    BAJA = "baja"
    MEDIA = "media"
    ALTA = "alta"


class RequestStatus(str, enum.Enum):
    PENDIENTE = "pendiente"
    CONTACTADO = "contactado"
    AGENDADO = "agendado"
    EN_ATENCION = "en_atencion"
    COMPLETADO = "completado"
    CANCELADO = "cancelado"


class ServiceCategory(str, enum.Enum):
    CONSULTA = "consulta"
    PREVENTIVO = "preventivo"
    PROCEDIMIENTO_SIMPLE = "procedimiento_simple"
    ASESORIA = "asesoria"
    OTRO = "otro"
