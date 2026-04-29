"""
Configuración de SQLAlchemy: engine, sessionmaker y Base declarativa.
"""
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

# Engine único para toda la app
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # valida conexiones antes de usarlas
    echo=settings.debug and settings.app_env == "development",
    future=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Clase base para todos los modelos ORM."""
    pass


def get_db() -> Generator[Session, None, None]:
    """
    Dependencia de FastAPI: entrega una sesión y la cierra al terminar.
    Usar como: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
