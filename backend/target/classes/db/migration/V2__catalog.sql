-- =====================================================================
-- V2: Catálogo dinámico de bebidas (tipos, marcas, bebidas, formatos)
--     y caché de llamadas a APIs externas
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tipos de bebida
-- ---------------------------------------------------------------------
CREATE TABLE drink_types (
    id          SMALLINT PRIMARY KEY,
    code        VARCHAR(20) NOT NULL UNIQUE,   -- BEER, SPIRIT, WINE, CIDER, COCKTAIL, OTHER
    label       VARCHAR(40) NOT NULL,
    default_abv NUMERIC(5,2) NOT NULL          -- fallback de graduación por tipo
);

INSERT INTO drink_types (id, code, label, default_abv) VALUES
    (1, 'BEER',     'Cerveza',  5.00),
    (2, 'SPIRIT',   'Destilado', 40.00),
    (3, 'WINE',     'Vino',     12.50),
    (4, 'CIDER',    'Sidra',     5.00),
    (5, 'COCKTAIL', 'Cóctel',   12.00),
    (6, 'OTHER',    'Otro',      8.00);

-- ---------------------------------------------------------------------
-- Marcas / productos
-- ---------------------------------------------------------------------
CREATE TABLE drink_brands (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(160) NOT NULL,
    drink_type_id SMALLINT  NOT NULL REFERENCES drink_types(id),
    source      VARCHAR(20)  NOT NULL DEFAULT 'MANUAL',  -- MANUAL | OPENFOODFACTS | COCKTAILDB
    source_ref  VARCHAR(120),                            -- id en la fuente externa
    barcode     VARCHAR(32),                             -- EAN/UPC (escaneo)
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (source, source_ref)
);
CREATE INDEX idx_brands_name ON drink_brands USING gin (to_tsvector('simple', name));
CREATE UNIQUE INDEX uniq_brand_barcode ON drink_brands(barcode) WHERE barcode IS NOT NULL;

-- ---------------------------------------------------------------------
-- Bebidas concretas (con ABV resuelto)
-- ---------------------------------------------------------------------
CREATE TABLE drinks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id        UUID REFERENCES drink_brands(id),
    drink_type_id   SMALLINT NOT NULL REFERENCES drink_types(id),
    name            VARCHAR(160) NOT NULL,
    abv             NUMERIC(5,2) NOT NULL,               -- % vol
    abv_source      VARCHAR(20)  NOT NULL DEFAULT 'DEFAULT', -- MANUAL|OPENFOODFACTS|COCKTAILDB|DEFAULT
    abv_confidence  VARCHAR(10)  NOT NULL DEFAULT 'LOW',  -- HIGH | MEDIUM | LOW
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT chk_abv_range CHECK (abv >= 0 AND abv <= 100)
);
CREATE INDEX idx_drinks_brand ON drinks(brand_id);
CREATE INDEX idx_drinks_type  ON drinks(drink_type_id);

-- ---------------------------------------------------------------------
-- Formatos de servicio (volúmenes)
-- ---------------------------------------------------------------------
CREATE TABLE serving_formats (
    id                  SMALLINT PRIMARY KEY,
    code                VARCHAR(20)  NOT NULL UNIQUE,
    label               VARCHAR(40)  NOT NULL,
    default_volume_ml   INT          NOT NULL,
    typical_drink_type_id SMALLINT   REFERENCES drink_types(id),
    CONSTRAINT chk_volume_positive CHECK (default_volume_ml > 0)
);

INSERT INTO serving_formats (id, code, label, default_volume_ml, typical_drink_type_id) VALUES
    (1, 'CANA',    'Caña',          200, 1),
    (2, 'JARRA',   'Jarra',         500, 1),
    (3, 'TERCIO',  'Tercio',        330, 1),
    (4, 'BOTELLIN','Botellín/Quinto',200, 1),
    (5, 'COPA_VINO','Copa de vino',  150, 3),
    (6, 'CHUPITO', 'Chupito',         40, 2),
    (7, 'COMBINADO','Combinado/Cubata',50, 2),  -- 50 ml de destilado dentro del combinado
    (8, 'COPA_CAVA','Copa de cava',  120, 3);

-- ---------------------------------------------------------------------
-- Caché de llamadas a APIs externas (anti-saturación)
-- ---------------------------------------------------------------------
CREATE TABLE catalog_lookups (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source      VARCHAR(20)  NOT NULL,                 -- OPENFOODFACTS | COCKTAILDB
    lookup_key  VARCHAR(255) NOT NULL,                 -- barcode o "nombre|marca" normalizado
    payload     JSONB,                                 -- respuesta cruda relevante
    found       BOOLEAN      NOT NULL DEFAULT FALSE,
    fetched_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    expires_at  TIMESTAMPTZ  NOT NULL,
    UNIQUE (source, lookup_key)
);
CREATE INDEX idx_lookups_expiry ON catalog_lookups(expires_at);
