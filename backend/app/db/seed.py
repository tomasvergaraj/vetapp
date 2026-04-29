"""
Script de seed (datos iniciales).

Ejecutar con:
    cd backend
    python -m app.db.seed

Es idempotente: solo inserta lo que falta. Se puede correr múltiples veces.
"""
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal, engine
from app.models import (
    CoverageZone,
    Service,
    ServiceCategory,
    User,
    UserRole,
)


# ---------- Datos a sembrar ----------

INITIAL_SERVICES: list[dict] = [
    {
        "name": "Consulta veterinaria a domicilio",
        "description": (
            "Evaluación general de la mascota en su hogar, sin necesidad de traslado. "
            "Incluye anamnesis, examen físico y orientación inicial."
        ),
        "base_price": None,  # "valor a confirmar"
        "estimated_duration_minutes": 45,
        "category": ServiceCategory.CONSULTA,
    },
    {
        "name": "Vacunación",
        "description": (
            "Aplicación de vacunas según calendario sanitario para perros y gatos. "
            "El valor depende del tipo de vacuna."
        ),
        "base_price": None,
        "estimated_duration_minutes": 20,
        "category": ServiceCategory.PREVENTIVO,
    },
    {
        "name": "Desparasitación",
        "description": (
            "Tratamiento antiparasitario interno y/o externo. "
            "Recomendado de forma periódica como parte del cuidado preventivo."
        ),
        "base_price": None,
        "estimated_duration_minutes": 15,
        "category": ServiceCategory.PREVENTIVO,
    },
    {
        "name": "Control sano",
        "description": (
            "Chequeo de rutina para mascotas sanas: peso, condición corporal, "
            "piel y pelaje, dentadura, oídos y orientación nutricional."
        ),
        "base_price": None,
        "estimated_duration_minutes": 30,
        "category": ServiceCategory.PREVENTIVO,
    },
    {
        "name": "Corte de uñas",
        "description": "Corte y limado de uñas con técnica segura para perros y gatos.",
        "base_price": Decimal("8000"),
        "estimated_duration_minutes": 15,
        "category": ServiceCategory.PROCEDIMIENTO_SIMPLE,
    },
    {
        "name": "Curación simple",
        "description": (
            "Limpieza y curación de heridas superficiales que no requieran sutura "
            "ni atención de urgencia."
        ),
        "base_price": None,
        "estimated_duration_minutes": 30,
        "category": ServiceCategory.PROCEDIMIENTO_SIMPLE,
    },
    {
        "name": "Asesoría nutricional",
        "description": (
            "Recomendación personalizada de dieta y manejo alimentario "
            "según edad, peso y condiciones de la mascota."
        ),
        "base_price": None,
        "estimated_duration_minutes": 30,
        "category": ServiceCategory.ASESORIA,
    },
    {
        "name": "Revisión postoperatoria",
        "description": (
            "Control de heridas, retiro de puntos cuando corresponda y "
            "seguimiento de recuperación tras una cirugía."
        ),
        "base_price": None,
        "estimated_duration_minutes": 30,
        "category": ServiceCategory.PROCEDIMIENTO_SIMPLE,
    },
]


# Comunas iniciales — Región de Valparaíso
INITIAL_ZONES: list[dict] = [
    {"name": "Viña del Mar", "travel_surcharge": None},
    {"name": "Valparaíso", "travel_surcharge": None},
    {"name": "Concón", "travel_surcharge": Decimal("3000")},
    {"name": "Reñaca", "travel_surcharge": Decimal("2000")},
    {"name": "Quilpué", "travel_surcharge": Decimal("4000")},
    {"name": "Villa Alemana", "travel_surcharge": Decimal("5000")},
    {"name": "Limache", "travel_surcharge": Decimal("6000")},
    {"name": "Olmué", "travel_surcharge": Decimal("7000")},
    {"name": "Quintero", "travel_surcharge": Decimal("6000")},
    {"name": "Casablanca", "travel_surcharge": Decimal("7000")},
]


# ---------- Funciones de seed ----------

def seed_admin_user(db: Session) -> User:
    """Crea el usuario administrador si no existe."""
    existing = db.query(User).filter(User.email == settings.admin_email).first()
    if existing:
        print(f"  · Admin ya existe: {existing.email}")
        return existing

    admin = User(
        email=settings.admin_email,
        full_name=settings.admin_full_name,
        hashed_password=hash_password(settings.admin_password),
        role=UserRole.ADMIN,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print(f"  ✓ Admin creado: {admin.email}")
    print(f"    ⚠️  Recuerda cambiar la contraseña en producción.")
    return admin


def seed_services(db: Session) -> int:
    """Inserta servicios iniciales si no existen (por nombre)."""
    created = 0
    for svc_data in INITIAL_SERVICES:
        existing = db.query(Service).filter(Service.name == svc_data["name"]).first()
        if existing:
            continue
        db.add(Service(**svc_data))
        created += 1
    db.commit()
    print(f"  ✓ Servicios nuevos: {created} (existentes: {len(INITIAL_SERVICES) - created})")
    return created


def seed_zones(db: Session) -> int:
    """Inserta zonas iniciales si no existen (por nombre)."""
    created = 0
    for zone_data in INITIAL_ZONES:
        existing = (
            db.query(CoverageZone)
            .filter(CoverageZone.name == zone_data["name"])
            .first()
        )
        if existing:
            continue
        db.add(CoverageZone(**zone_data))
        created += 1
    db.commit()
    print(f"  ✓ Zonas nuevas: {created} (existentes: {len(INITIAL_ZONES) - created})")
    return created


def run_seed() -> None:
    print(f"\n→ Conectando a {engine.url.render_as_string(hide_password=True)}\n")
    print("Sembrando datos iniciales...")
    with SessionLocal() as db:
        seed_admin_user(db)
        seed_services(db)
        seed_zones(db)
    print("\n✅ Seed completado.\n")


if __name__ == "__main__":
    run_seed()
