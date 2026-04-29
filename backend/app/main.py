"""
Punto de entrada de la aplicación FastAPI.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Hook de inicio/cierre de la app. Útil para validar conexión a BD, etc."""
    # Startup
    print(f"🚀 {settings.app_name} iniciando en modo {settings.app_env}")
    yield
    # Shutdown
    print(f"👋 {settings.app_name} detenido")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        description=(
            "API para una veterinaria freelance que ofrece atención a domicilio. "
            "Expone endpoints públicos para solicitar atención y endpoints "
            "privados (JWT) para que la veterinaria gestione las solicitudes."
        ),
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # ---------- CORS ----------
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ---------- Manejo global de errores no esperados ----------
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        # En producción no exponer detalles internos
        if settings.is_production:
            message = "Ocurrió un error inesperado. Por favor intenta nuevamente."
        else:
            message = f"{type(exc).__name__}: {exc}"
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": message},
        )

    # ---------- Rutas básicas ----------
    @app.get("/", tags=["meta"])
    def root():
        return {
            "app": settings.app_name,
            "version": "0.1.0",
            "docs": "/docs",
        }

    @app.get("/health", tags=["meta"])
    def health():
        return {"status": "ok"}

    # ---------- Routers públicos (Fase 2) ----------
    from app.api.public import coverage_zones as public_zones
    from app.api.public import service_requests as public_requests
    from app.api.public import services as public_services

    app.include_router(public_services.router)
    app.include_router(public_zones.router)
    app.include_router(public_requests.router)

    # ---------- Routers admin (Fase 3) ----------
    from app.api.admin import auth as admin_auth
    from app.api.admin import coverage_zones as admin_zones
    from app.api.admin import dashboard as admin_dashboard
    from app.api.admin import service_requests as admin_requests
    from app.api.admin import services as admin_services

    app.include_router(admin_auth.router)
    app.include_router(admin_dashboard.router)
    app.include_router(admin_requests.router)
    app.include_router(admin_services.router)
    app.include_router(admin_zones.router)

    return app


app = create_app()
