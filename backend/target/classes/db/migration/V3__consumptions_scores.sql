-- =====================================================================
-- V3: Consumos y puntuaciones
-- =====================================================================

-- ---------------------------------------------------------------------
-- Consumos (hecho inmutable con snapshots de ABV/volumen)
-- ---------------------------------------------------------------------
CREATE TABLE consumptions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id),
    season_id           UUID NOT NULL REFERENCES seasons(id),
    league_id           UUID NOT NULL REFERENCES leagues(id),
    drink_id            UUID REFERENCES drinks(id),
    serving_format_id   SMALLINT NOT NULL REFERENCES serving_formats(id),
    quantity            NUMERIC(5,2) NOT NULL DEFAULT 1.00,   -- nº de unidades (p. ej. 2 cañas)
    -- snapshots: congelan el cálculo en el momento del registro
    volume_ml_snapshot  INT          NOT NULL,
    abv_snapshot        NUMERIC(5,2) NOT NULL,
    occurred_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT chk_quantity_positive CHECK (quantity > 0)
);
CREATE INDEX idx_consumptions_user_season ON consumptions(user_id, season_id);
CREATE INDEX idx_consumptions_season      ON consumptions(season_id);
CREATE INDEX idx_consumptions_occurred    ON consumptions(occurred_at);

-- ---------------------------------------------------------------------
-- Puntuación (1:1 con consumo) — aislada del hecho (SRP)
-- ---------------------------------------------------------------------
CREATE TABLE consumption_scores (
    consumption_id      UUID PRIMARY KEY REFERENCES consumptions(id) ON DELETE CASCADE,
    pure_alcohol_grams  NUMERIC(8,3) NOT NULL,
    points              NUMERIC(8,2) NOT NULL,
    scoring_mode        VARCHAR(30)  NOT NULL,
    scoring_version     INT          NOT NULL DEFAULT 1,
    computed_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- Vista materializable opcional del leaderboard (fuente de verdad
-- para reconstruir el sorted set de Redis si se pierde la caché)
-- ---------------------------------------------------------------------
CREATE VIEW v_season_leaderboard AS
SELECT
    c.season_id,
    c.user_id,
    SUM(s.points)              AS total_points,
    SUM(s.pure_alcohol_grams)  AS total_pure_alcohol_g,
    COUNT(*)                   AS total_consumptions,
    RANK() OVER (
        PARTITION BY c.season_id
        ORDER BY SUM(s.points) DESC
    )                          AS rank
FROM consumptions c
JOIN consumption_scores s ON s.consumption_id = c.id
GROUP BY c.season_id, c.user_id;
