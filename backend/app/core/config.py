"""
Configuración de la aplicación.
Carga variables desde el archivo .env y las expone como un objeto tipado.
"""
from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Aplicación
    app_name: str = "Veterinaria a domicilio"
    app_env: str = "development"
    debug: bool = True

    # Servidor
    host: str = "0.0.0.0"
    port: int = 8000

    # Base de datos
    database_url: str = Field(
        default="postgresql+psycopg2://vetuser:vetpass@localhost:5432/vetapp"
    )

    # JWT
    jwt_secret_key: str = Field(default="change-me")
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 480

    # CORS — recibe string separado por comas y lo convierte en lista
    cors_origins: List[str] = Field(
        default=["http://localhost:5173", "http://127.0.0.1:5173"]
    )

    # Admin seed
    admin_email: str = "admin@veterinaria.cl"
    admin_password: str = "Cambiar123!"
    admin_full_name: str = "Veterinaria Administradora"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance — evita releer .env en cada request."""
    return Settings()


settings = get_settings()
