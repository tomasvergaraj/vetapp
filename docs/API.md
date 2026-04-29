# API — Referencia rápida

Documentación interactiva: `http://localhost:8000/docs`.

## Autenticación

Las rutas bajo `/admin/*` requieren un token JWT enviado como
`Authorization: Bearer <token>`.

### `POST /auth/login`

```json
{
  "email": "admin@veterinaria.local",
  "password": "Cambiar123!"
}
```

**Respuesta 200**:

```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "expires_in": 28800
}
```

**Respuesta 401**: credenciales inválidas (mensaje genérico).

### `GET /auth/me`

Requiere token. Devuelve `UserRead`.

---

## Endpoints públicos

### `GET /services`

Lista de servicios activos:

```json
[
  {
    "id": 5,
    "name": "Corte de uñas",
    "description": "...",
    "base_price": "8000.00",
    "estimated_duration_minutes": 15,
    "category": "procedimiento_simple"
  }
]
```

### `GET /coverage-zones`

```json
[
  { "id": 1, "name": "Viña del Mar", "travel_surcharge": null },
  { "id": 3, "name": "Concón", "travel_surcharge": "3000.00" }
]
```

### `POST /service-requests`

```json
{
  "client": {
    "full_name": "María González",
    "phone": "+56912345678",
    "email": "maria@example.com",
    "address": "Av. Libertad 123, depto 5B",
    "commune": "Viña del Mar",
    "location_reference": "Frente al parque"
  },
  "pet": {
    "name": "Olivia",
    "pet_type": "gato",
    "breed": "Siamés",
    "approximate_age_years": 7,
    "approximate_weight_kg": 4.2,
    "sex": "hembra",
    "notes": "Es nerviosa con extraños."
  },
  "service_id": 1,
  "preferred_date": "2026-05-18",
  "preferred_time_start": "10:00:00",
  "preferred_time_end": "12:00:00",
  "description": "Quisiera una consulta general.",
  "urgency": "baja",
  "accepts_whatsapp": true
}
```

**Respuesta 201**:

```json
{
  "id": 42,
  "status": "pendiente",
  "created_at": "2026-04-29T15:42:11Z",
  "message": "Solicitud recibida correctamente. ..."
}
```

**Respuesta 422** (regla de negocio):

```json
{
  "detail": {
    "message": "Lo sentimos, aún no atendemos en esa comuna.",
    "field": "client.commune"
  }
}
```

---

## Endpoints admin

Todos requieren JWT.

### `GET /admin/dashboard`

```json
{
  "stats": {
    "total_requests": 27,
    "pending_requests": 5,
    "scheduled_requests": 8,
    "completed_requests": 12,
    "in_attention_requests": 1,
    "canceled_requests": 1
  },
  "upcoming_appointments": [ /* ServiceRequestListItem[] */ ],
  "latest_requests": [ /* ServiceRequestListItem[] */ ]
}
```

### `GET /admin/service-requests`

Query params opcionales:
- `status` — uno de: `pendiente`, `contactado`, `agendado`, `en_atencion`, `completado`, `cancelado`.
- `date_from`, `date_to` — formato `YYYY-MM-DD`, filtra por `preferred_date`.
- `skip`, `limit` — paginación.

### `GET /admin/service-requests/{id}`

Devuelve `ServiceRequestDetail` (con cliente, mascota, servicio e historial).

### `PATCH /admin/service-requests/{id}/status`

```json
{
  "status": "agendado",
  "note": "Confirmado por WhatsApp"
}
```

Valida que la transición sea permitida. Registra el cambio en `request_status_history`. Devuelve el detalle actualizado.

**Transiciones permitidas:**

| Desde | Hacia |
|---|---|
| `pendiente` | `contactado`, `agendado`, `cancelado` |
| `contactado` | `agendado`, `cancelado`, `pendiente` |
| `agendado` | `en_atencion`, `contactado`, `cancelado` |
| `en_atencion` | `completado`, `cancelado` |
| `completado` | (terminal) |
| `cancelado` | (terminal) |

### `PATCH /admin/service-requests/{id}`

```json
{
  "final_price": 25000,
  "internal_notes": "Cliente recurrente."
}
```

### CRUD `/admin/services`

```
GET    /admin/services
POST   /admin/services
PUT    /admin/services/{id}
DELETE /admin/services/{id}
```

`DELETE` hace soft-delete (marca `is_active=false`) si el servicio tiene solicitudes asociadas.

### CRUD `/admin/coverage-zones`

```
GET    /admin/coverage-zones
POST   /admin/coverage-zones
PUT    /admin/coverage-zones/{id}
DELETE /admin/coverage-zones/{id}
```

`DELETE` es hard delete: el histórico se preserva por `commune_snapshot` en cada solicitud.
