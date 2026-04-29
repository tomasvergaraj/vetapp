-- =============================================================================
-- Esquema inicial — Veterinaria a domicilio
-- =============================================================================
-- Este script crea todas las tablas y tipos enum necesarios.
-- Es una alternativa a las migraciones Alembic, útil para inicializar
-- una base de datos PostgreSQL desde cero rápidamente.
--
-- Para usar Alembic en su lugar:
--   cd backend && alembic upgrade head
--
-- Uso de este script:
--   psql -U vetuser -d vetapp -f database/init.sql
-- =============================================================================

-- ---------- Tipos ENUM ----------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE pet_type AS ENUM ('PERRO', 'GATO', 'OTRO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE pet_sex AS ENUM ('MACHO', 'HEMBRA', 'DESCONOCIDO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE urgency_level AS ENUM ('BAJA', 'MEDIA', 'ALTA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM (
        'PENDIENTE', 'CONTACTADO', 'AGENDADO',
        'EN_ATENCION', 'COMPLETADO', 'CANCELADO'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE service_category AS ENUM (
        'CONSULTA', 'PREVENTIVO', 'PROCEDIMIENTO_SIMPLE', 'ASESORIA', 'OTRO'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ---------- Tabla users ----------
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    full_name       VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role            user_role NOT NULL DEFAULT 'ADMIN',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);


-- ---------- Tabla services ----------
CREATE TABLE IF NOT EXISTS services (
    id                          SERIAL PRIMARY KEY,
    name                        VARCHAR(150) NOT NULL,
    description                 TEXT,
    base_price                  NUMERIC(10, 2),
    estimated_duration_minutes  INTEGER,
    category                    service_category NOT NULL DEFAULT 'OTRO',
    is_active                   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_services_name ON services(name);


-- ---------- Tabla coverage_zones ----------
CREATE TABLE IF NOT EXISTS coverage_zones (
    id                SERIAL PRIMARY KEY,
    name              VARCHAR(150) NOT NULL UNIQUE,
    travel_surcharge  NUMERIC(10, 2),
    notes             TEXT,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_coverage_zones_name ON coverage_zones(name);


-- ---------- Tabla clients ----------
CREATE TABLE IF NOT EXISTS clients (
    id                  SERIAL PRIMARY KEY,
    full_name           VARCHAR(200) NOT NULL,
    phone               VARCHAR(50)  NOT NULL,
    email               VARCHAR(255) NOT NULL,
    address             VARCHAR(300) NOT NULL,
    commune             VARCHAR(150) NOT NULL,
    location_reference  TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_clients_email   ON clients(email);
CREATE INDEX IF NOT EXISTS ix_clients_phone   ON clients(phone);
CREATE INDEX IF NOT EXISTS ix_clients_commune ON clients(commune);


-- ---------- Tabla pets ----------
CREATE TABLE IF NOT EXISTS pets (
    id                      SERIAL PRIMARY KEY,
    owner_id                INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name                    VARCHAR(100) NOT NULL,
    pet_type                pet_type NOT NULL,
    breed                   VARCHAR(150),
    approximate_age_years   NUMERIC(4, 1),
    approximate_weight_kg   NUMERIC(5, 2),
    sex                     pet_sex NOT NULL DEFAULT 'DESCONOCIDO',
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_pets_owner_id ON pets(owner_id);


-- ---------- Tabla service_requests ----------
CREATE TABLE IF NOT EXISTS service_requests (
    id                    SERIAL PRIMARY KEY,
    client_id             INTEGER NOT NULL REFERENCES clients(id)  ON DELETE RESTRICT,
    pet_id                INTEGER NOT NULL REFERENCES pets(id)     ON DELETE RESTRICT,
    service_id            INTEGER NOT NULL REFERENCES services(id) ON DELETE RESTRICT,

    preferred_date        DATE NOT NULL,
    preferred_time_start  TIME,
    preferred_time_end    TIME,
    description           TEXT,
    urgency               urgency_level NOT NULL DEFAULT 'BAJA',
    accepts_whatsapp      BOOLEAN NOT NULL DEFAULT TRUE,

    status                request_status NOT NULL DEFAULT 'PENDIENTE',
    final_price           NUMERIC(10, 2),
    internal_notes        TEXT,
    commune_snapshot      VARCHAR(150) NOT NULL,

    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_service_requests_client_id      ON service_requests(client_id);
CREATE INDEX IF NOT EXISTS ix_service_requests_pet_id         ON service_requests(pet_id);
CREATE INDEX IF NOT EXISTS ix_service_requests_service_id     ON service_requests(service_id);
CREATE INDEX IF NOT EXISTS ix_service_requests_status         ON service_requests(status);
CREATE INDEX IF NOT EXISTS ix_service_requests_preferred_date ON service_requests(preferred_date);
CREATE INDEX IF NOT EXISTS ix_service_requests_created_at     ON service_requests(created_at);


-- ---------- Tabla request_status_history ----------
CREATE TABLE IF NOT EXISTS request_status_history (
    id                    SERIAL PRIMARY KEY,
    request_id            INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    from_status           request_status,
    to_status             request_status NOT NULL,
    note                  TEXT,
    changed_by_user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_request_status_history_request_id ON request_status_history(request_id);
CREATE INDEX IF NOT EXISTS ix_request_status_history_created_at ON request_status_history(created_at);
