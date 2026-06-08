-- Schema del registro por WhatsApp. Correr una vez en Neon:
--   psql $DATABASE_URL -f scripts/schema.sql

CREATE TABLE IF NOT EXISTS wa_sessions (
  phone       text PRIMARY KEY,
  step        text NOT NULL,
  answers     jsonb NOT NULL DEFAULT '{}',
  tries       int NOT NULL DEFAULT 0,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Dedup de reintentos de webhook de Meta
CREATE TABLE IF NOT EXISTS wa_messages (
  id          text PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registrations (
  id          serial PRIMARY KEY,
  code        text UNIQUE,                    -- CRAFTER-001, asignado post-insert
  phone       text UNIQUE NOT NULL,
  name        text NOT NULL,
  email       text NOT NULL,
  role        text NOT NULL,
  team_status text,                           -- tengo | busco | solo
  team_name   text,
  adult       boolean NOT NULL DEFAULT false,
  github      text,
  source      text,
  status      text NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  notified_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
