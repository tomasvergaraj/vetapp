# Arquitectura

## Vista general

```
┌─────────────────────┐         ┌──────────────────────┐         ┌──────────────┐
│   Cliente público   │         │   Veterinaria        │         │              │
│   (navegador)       │         │   (navegador)        │         │  PostgreSQL  │
└──────────┬──────────┘         └───────────┬──────────┘         │              │
           │ GET /                          │ /admin/login        └──────▲───────┘
           │ POST /service-requests         │ + JWT Bearer               │
           ▼                                ▼                            │
        ┌──────────────────────────────────────────┐                    │
        │       Frontend SPA (React + Vite)        │                    │
        │  · Landing y formulario público          │                    │
        │  · Panel admin protegido (JWT)           │                    │
        └──────────────────┬───────────────────────┘                    │
                           │ HTTPS / Bearer token                       │
                           ▼                                            │
        ┌──────────────────────────────────────────┐                    │
        │              FastAPI                     │ SQLAlchemy 2.0     │
        │  ├── api/public/   (sin auth)            │◄───────────────────┘
        │  ├── api/admin/    (JWT, role=admin)     │
        │  ├── services/     (lógica de negocio)   │
        │  └── core/         (config, security)    │
        └──────────────────────────────────────────┘
```

## Capas

### 1. `models/` — ORM (SQLAlchemy 2.0)

Modelado declarativo con `Mapped[...]`. Cada entidad en su archivo. Enums separados en `enums.py`.

**7 modelos**: User, Service, CoverageZone, Client, Pet, ServiceRequest, RequestStatusHistory.

### 2. `schemas/` — Contratos (Pydantic v2)

Schemas separados por entidad y por operación: `Base`, `Create`, `Update`, `Read`, y variantes públicas (`PublicRead`) para endpoints sin auth.

Todos heredan de `APIBaseModel` que activa `from_attributes`, `str_strip_whitespace` y `validate_assignment`.

### 3. `services/` — Lógica de negocio

- `service_requests.py` — encapsula la creación de solicitudes (validación de servicio activo + zona cubierta + creación transaccional cliente→mascota→solicitud→historial).
- `request_mappers.py` — helpers para construir representaciones de lectura.

Define `BusinessRuleError` que los routers traducen a HTTP 422 con `{message, field}`.

### 4. `api/` — Endpoints

Dos sub-paquetes:
- `public/` — sin autenticación: `/services`, `/coverage-zones`, `/service-requests`.
- `admin/` — protegidos por JWT con dependencia `get_current_admin`.

`deps.py` centraliza la extracción de usuario desde el JWT (con manejo de errores 401/403).

### 5. `core/` — Infraestructura

- `config.py` — `pydantic-settings` con validación de tipos y CORS_ORIGINS desde CSV.
- `security.py` — bcrypt + JWT.

## Frontend

```
src/
├── lib/
│   ├── api.js           # axios + interceptores (Bearer + 401 handler)
│   ├── auth.jsx         # AuthContext con useAuth()
│   ├── endpoints.js     # funciones que envuelven cada endpoint
│   └── format.js        # formatters (precio, fecha, labels de enums)
├── components/          # UI compartida (sin estado de negocio)
├── pages/               # rutas públicas
│   └── admin/           # rutas protegidas
├── App.jsx              # routing
└── main.jsx             # bootstrap (BrowserRouter, AuthProvider, Toaster)
```

### Flujo de autenticación

1. `AdminLoginPage` → `useAuth().login(email, password)`.
2. `AuthContext` llama `POST /auth/login`, guarda el token en `sessionStorage` y carga `/auth/me`.
3. `RequireAuth` (en `AdminLayout`) bloquea las rutas hasta tener `user`.
4. El interceptor de Axios añade `Authorization: Bearer <token>` automáticamente.
5. Si una respuesta admin devuelve 401, el interceptor limpia el token y emite un evento `vetapp:unauthorized` que el `AuthContext` escucha para volver al login.

### Flujo de creación de solicitud (público)

1. `RequestServicePage` carga `/services` y `/coverage-zones` para poblar selects.
2. React Hook Form + Zod valida cliente, mascota, solicitud y la coherencia de la ventana horaria.
3. Submit → `POST /service-requests` con payload anidado `{ client, pet, ...solicitud }`.
4. Backend valida y crea Cliente → Mascota → Solicitud → primer evento de historial en una transacción.
5. Frontend redirige a `/solicitar/confirmacion?id=...`.

## Base de datos

Doble vía para crear el esquema:

- **Alembic** (`alembic upgrade head`) — recomendado, permite evolución con autogenerate.
- **`database/init.sql`** — script idempotente con todos los `CREATE TABLE` y `CREATE TYPE` (ENUMs); útil para inicializar rápidamente.

Los enums se persisten como tipos `ENUM` nativos de PostgreSQL (no como `VARCHAR` con check constraint), lo que aporta integridad y mejor autodocumentación.

## Seguridad

- Hash de contraseñas con **bcrypt** (`passlib`).
- JWT firmado con HS256; secret en variable de entorno.
- Token en `sessionStorage` (se pierde al cerrar la pestaña → menos ventana XSS).
- CORS restringido por configuración.
- Mensajes de error de login genéricos (no revela si el email existe).
- Errores no manejados: en producción se ocultan los detalles; en desarrollo se muestran.
