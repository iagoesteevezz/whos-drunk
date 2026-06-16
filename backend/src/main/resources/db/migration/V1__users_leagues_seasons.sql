-- =====================================================================
-- V1: Usuarios, ligas, membresías y temporadas
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- gen_random_uuid()

-- ---------------------------------------------------------------------
-- Usuarios
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    display_name    VARCHAR(80)  NOT NULL,
    birth_date      DATE         NOT NULL,                 -- gate +18
    auth_provider   VARCHAR(20)  NOT NULL DEFAULT 'LOCAL', -- LOCAL | GOOGLE | APPLE
    auth_subject    VARCHAR(255),                          -- id del proveedor OAuth
    avatar_url      TEXT,
    responsible_use_ack BOOLEAN  NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- Ligas (grupos privados)
-- ---------------------------------------------------------------------
CREATE TABLE leagues (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(120) NOT NULL,
    description     TEXT,
    invite_code     VARCHAR(12)  NOT NULL UNIQUE,          -- código de invitación
    owner_id        UUID         NOT NULL REFERENCES users(id),
    scoring_mode    VARCHAR(30)  NOT NULL DEFAULT 'PURE_ALCOHOL',
    score_multiplier NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    grams_per_unit  NUMERIC(5,2) NOT NULL DEFAULT 10.00,   -- UBE España = 10 g
    season_length_days INT       NOT NULL DEFAULT 30,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_leagues_owner ON leagues(owner_id);

-- ---------------------------------------------------------------------
-- Membresías (N:M usuario <-> liga)
-- ---------------------------------------------------------------------
CREATE TABLE league_memberships (
    league_id   UUID        NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    user_id     UUID        NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    role        VARCHAR(10) NOT NULL DEFAULT 'MEMBER',      -- OWNER | ADMIN | MEMBER
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    nickname    VARCHAR(80),
    PRIMARY KEY (league_id, user_id)
);
CREATE INDEX idx_memberships_user ON league_memberships(user_id);

-- ---------------------------------------------------------------------
-- Temporadas (por defecto mensuales)
-- ---------------------------------------------------------------------
CREATE TABLE seasons (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id   UUID        NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    name        VARCHAR(80) NOT NULL,                       -- p. ej. "Junio 2026"
    status      VARCHAR(12) NOT NULL DEFAULT 'SCHEDULED',   -- SCHEDULED | ACTIVE | CLOSED
    starts_at   TIMESTAMPTZ NOT NULL,
    ends_at     TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_season_dates CHECK (ends_at > starts_at)
);
CREATE INDEX idx_seasons_league ON seasons(league_id);
-- Solo una temporada ACTIVE por liga
CREATE UNIQUE INDEX uniq_active_season_per_league
    ON seasons(league_id) WHERE status = 'ACTIVE';
