-- =====================================================================
-- V5: Seed fallback / classic drinks
--
-- NOTE: serving_formats and drink_types are already seeded in V2.
-- This migration only adds catalog drinks so search always returns
-- something, even when Open Food Facts is unavailable.
-- drink_types ids:  1 = BEER, 2 = SPIRIT, 3 = WINE
-- =====================================================================

-- Classic Spanish brands (searchable by text). One brand + one drink each.
WITH new_brands AS (
    INSERT INTO drink_brands (name, drink_type_id, source)
    VALUES
        ('Mahou',             1, 'MANUAL'),
        ('Estrella Galicia',  1, 'MANUAL'),
        ('Beefeater',         2, 'MANUAL'),
        ('Marqués de Riscal', 3, 'MANUAL')
    RETURNING id, name, drink_type_id
)
INSERT INTO drinks (brand_id, drink_type_id, name, abv, abv_source, abv_confidence)
SELECT
    id,
    drink_type_id,
    CASE name
        WHEN 'Mahou'             THEN 'Mahou Cinco Estrellas'
        WHEN 'Estrella Galicia'  THEN 'Estrella Galicia Especial'
        WHEN 'Beefeater'         THEN 'Beefeater London Dry Gin'
        WHEN 'Marqués de Riscal' THEN 'Marqués de Riscal Reserva'
    END,
    CASE name
        WHEN 'Mahou'             THEN 5.5
        WHEN 'Estrella Galicia'  THEN 5.5
        WHEN 'Beefeater'         THEN 40.0
        WHEN 'Marqués de Riscal' THEN 14.0
    END,
    'MANUAL',
    'MEDIUM'
FROM new_brands;

-- Generic fallbacks (no brand). Returned when nothing else matches and used
-- as a safety net if the external API fails. Marked abv_source = 'DEFAULT'.
INSERT INTO drinks (drink_type_id, name, abv, abv_source, abv_confidence) VALUES
    (1, 'Generic beer',   5.0,  'DEFAULT', 'LOW'),
    (3, 'Generic wine',   12.5, 'DEFAULT', 'LOW'),
    (2, 'Generic spirit', 40.0, 'DEFAULT', 'LOW');
