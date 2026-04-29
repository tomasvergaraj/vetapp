# Veterinaria a domicilio — Plataforma freelance

Aplicación web completa para una médico veterinario independiente que atiende
a domicilio. Permite a clientes solicitar atención y a la veterinaria gestionar
las solicitudes desde un panel privado.

> **Estado:** ✅ MVP completo — backend + frontend público + panel admin.

---

## Demo del flujo

1. **Cliente** entra a la landing → ve servicios y zonas → llena formulario.
2. La solicitud queda **pendiente**, no se reserva hora automáticamente.
3. **Veterinaria** entra al panel → recibe la solicitud → contacta al cliente → confirma fecha y precio → marca como agendada → en atención → completada.

---

## Stack

- **Backend:** FastAPI 0.115 · SQLAlchemy 2.0 · Alembic · Pydantic v2 · python-jose (JWT) · passlib (bcrypt)
- **Base de datos:** PostgreSQL 16
- **Frontend:** React 18 · Vite 5 · Tailwind CSS 3 · React Router 6 · React Hook Form + Zod · Axios · Lucide
- **Tipografía:** Fraunces (display) + Geist (cuerpo)

---

## Estructura del proyecto

```
vetapp/
├── backend/                      # API FastAPI
│   ├── app/
│   │   ├── api/
│   │   │   ├── public/           # Endpoints sin auth
│   │   │   │   ├── services.py
│   │   │   │   ├── coverage_zones.py
│   │   │   │   └── service_requests.py
│   │   │   └── admin/            # Endpoints protegidos (JWT)
│   │   │       ├── deps.py
│   │   │       ├── auth.py
│   │   │       ├── dashboard.py
│   │   │       ├── service_requests.py
│   │   │       ├── services.py
│   │   │       └── coverage_zones.py
│   │   ├── core/
│   │   │   ├── config.py         # Settings con pydantic-settings
│   │   │   └── security.py       # Hash + JWT
│   │   ├── db/
│   │   │   ├── session.py        # Engine + SessionLocal + Base
│   │   │   └── seed.py           # Datos iniciales (Valparaíso)
│   │   ├── models/               # 7 modelos SQLAlchemy
│   │   ├── schemas/              # Schemas Pydantic
│   │   ├── services/             # Lógica de negocio
│   │   └── main.py
│   ├── alembic/
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env.example
├── frontend/                     # SPA Vite + React
│   ├── src/
│   │   ├── components/           # UI compartida
│   │   ├── lib/                  # api, auth, format, endpoints
│   │   ├── pages/                # Páginas públicas
│   │   │   └── admin/            # Páginas del panel
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/favicon.svg
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
├── database/
│   └── init.sql                  # Esquema en SQL puro (alternativa a Alembic)
├── docs/
│   ├── ARCHITECTURE.md
│   └── API.md
├── docker-compose.yml
└── README.md
```

---

## Requisitos previos

- Python 3.11+
- Node.js 20+
- PostgreSQL 14+ (o Docker)

---

## Setup completo paso a paso

### 1. Levantar PostgreSQL

**Con Docker (recomendado):**

```bash
docker compose up -d db
```

Crea la base `vetapp` con usuario `vetuser` / contraseña `vetpass` en `localhost:5432`.

**Manual:**

```sql
CREATE USER vetuser WITH PASSWORD 'vetpass';
CREATE DATABASE vetapp OWNER vetuser;
```

### 2. Configurar y arrancar el backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Linux/Mac
# .venv\Scripts\activate            # Windows
pip install -r requirements.txt
cp .env.example .env
```

> **Importante:** edita `.env` y, en producción, genera un `JWT_SECRET_KEY` nuevo:
> ```bash
> python -c "import secrets; print(secrets.token_urlsafe(64))"
> ```

Crea el esquema (elige **una** opción):

- **Alembic (recomendado):**
  ```bash
  alembic revision --autogenerate -m "initial schema"
  alembic upgrade head
  ```
- **SQL directo (rápido):**
  ```bash
  psql -U vetuser -d vetapp -f ../database/init.sql
  ```

Siembra datos iniciales (admin + servicios + zonas de Valparaíso):

```bash
python -m app.db.seed
```

Levanta el servidor:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verifica:
- http://localhost:8000/health → `{"status":"ok"}`
- http://localhost:8000/docs → documentación interactiva (Swagger)

### 3. Configurar y arrancar el frontend

En otra terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Abre http://localhost:5173

El frontend hace proxy a `/api` → `http://localhost:8000` en desarrollo
(configurado en `vite.config.js`).

### 4. Acceder al panel admin

- URL: http://localhost:5173/admin/login
- Email: `admin@veterinaria.local`
- Contraseña: `Cambiar123!` (defínela en `.env`)

> ⚠️ **Cambia la contraseña antes de exponer el sistema a internet.**

---

## Datos iniciales (seed)

El script `app/db/seed.py` siembra:

**Servicios** (8):

| Servicio | Categoría | Precio base |
|---|---|---|
| Consulta veterinaria a domicilio | Consulta | A confirmar |
| Vacunación | Preventivo | A confirmar |
| Desparasitación | Preventivo | A confirmar |
| Control sano | Preventivo | A confirmar |
| Corte de uñas | Procedimiento simple | $8.000 |
| Curación simple | Procedimiento simple | A confirmar |
| Asesoría nutricional | Asesoría | A confirmar |
| Revisión postoperatoria | Procedimiento simple | A confirmar |

**Zonas — Región de Valparaíso** (10):

Viña del Mar, Valparaíso, Concón, Reñaca, Quilpué, Villa Alemana, Limache, Olmué, Quintero, Casablanca.

Algunas tienen recargo por traslado, todas modificables desde el panel admin.

---

## Modelo de datos

| Tabla | Descripción |
|---|---|
| `users` | Administradores. |
| `services` | Catálogo de servicios. Precio nullable = "a confirmar". |
| `coverage_zones` | Comunas de atención + recargo opcional. |
| `clients` | Dueños de mascotas. Se reutilizan por (email + teléfono). |
| `pets` | Mascotas. Cada solicitud crea una nueva (no deduplica). |
| `service_requests` | Solicitudes de atención. Guardan `commune_snapshot`. |
| `request_status_history` | Historial inmutable de cambios de estado. |

**Estados de una solicitud:**

```
pendiente → contactado → agendado → en_atencion → completado
                  └────────┴──────────┴─→ cancelado
```

Las transiciones permitidas se validan tanto en el backend (`ALLOWED_TRANSITIONS` en `app/api/admin/service_requests.py`) como en el frontend (`AdminRequestDetailPage`).

---

## Endpoints principales

### Públicos (sin auth)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/services` | Listado de servicios activos. |
| GET | `/coverage-zones` | Listado de zonas activas. |
| POST | `/service-requests` | Crea una solicitud. |

### Auth

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/login` | `{ email, password }` → `{ access_token, ... }`. |
| GET | `/auth/me` | Usuario autenticado actual. |

### Admin (JWT requerido)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/admin/dashboard` | Stats + próximas atenciones + últimas recibidas. |
| GET | `/admin/service-requests` | Listado con filtros `?status=...&date_from=...&date_to=...`. |
| GET | `/admin/service-requests/{id}` | Detalle completo. |
| PATCH | `/admin/service-requests/{id}/status` | Cambia estado + nota → registra en historial. |
| PATCH | `/admin/service-requests/{id}` | Edita `final_price` y `internal_notes`. |
| GET / POST / PUT / DELETE | `/admin/services` | CRUD de servicios. |
| GET / POST / PUT / DELETE | `/admin/coverage-zones` | CRUD de zonas. |

Documentación interactiva: `http://localhost:8000/docs`.

---

## Decisiones de diseño

- **Cliente sin cuenta**: para reducir fricción, el cliente público no se autentica. Se identifica por email + teléfono.
- **Solicitud entra como pendiente**: nunca se auto-confirma. La veterinaria contacta y agenda manualmente.
- **`commune_snapshot`**: guardamos la comuna como texto plano en cada solicitud, además del FK lógico, para preservar el histórico aunque la zona se desactive o renombre.
- **`final_price` nullable**: soporta el caso real "valor a confirmar" sin sentinelas.
- **`RequestStatusHistory` append-only**: cada cambio queda registrado con quién, cuándo y por qué. Auditoría limpia.
- **`sessionStorage` para el JWT**: minimiza la ventana de un eventual XSS. El token se pierde al cerrar la pestaña.
- **No es servicio de urgencias**: visible en footer y formulario.

---

## Checklist de seguridad pre-producción

- [ ] Generar nuevo `JWT_SECRET_KEY` (`secrets.token_urlsafe(64)`).
- [ ] Cambiar credenciales del admin (`ADMIN_EMAIL` y `ADMIN_PASSWORD` en `.env`).
- [ ] Restringir `CORS_ORIGINS` a dominios reales.
- [ ] Configurar HTTPS (proxy reverso: Nginx, Caddy, Cloudflare, etc.).
- [ ] `APP_ENV=production` y `DEBUG=false`.
- [ ] Configurar backups automáticos de PostgreSQL.
- [ ] Rotación de logs.
- [ ] Rate limiting en `/auth/login` y `/service-requests` (recomendado: SlowAPI o proxy).

---

## Roadmap (futuras fases)

La arquitectura está preparada para incorporar:

1. **Notificaciones por WhatsApp**: el campo `accepts_whatsapp` ya está en cada solicitud. Integrar Twilio API o WhatsApp Business API.
2. **Pagos en línea**: `final_price` está listo; agregar tabla `payments` con FK a `service_requests` e integrar Mercado Pago / Transbank.
3. **Recordatorios de vacunación**: extender `pets` con tabla `vaccinations` y enviar emails programados.
4. **Multi-veterinaria**: el modelo `User` ya tiene `role`; agregar más roles (`assistant`, etc.) y filtrar solicitudes por veterinaria.

---

## Aviso

Este servicio no reemplaza atención veterinaria de urgencia. En caso de
emergencia grave, acude a una clínica veterinaria cercana.
