package com.whosdrunk.scoring;

import java.math.BigDecimal;

/**
 * Resultado inmutable del cálculo de puntuación.
 *
 * @param pureAlcoholGrams gramos de alcohol puro consumidos
 * @param points           puntos otorgados para el ranking
 * @param scoringMode      modo aplicado (identifica la estrategia)
 * @param scoringVersion   versión del algoritmo, para auditoría/recálculo
 */
public record ScoringResult(
        BigDecimal pureAlcoholGrams,
        BigDecimal points,
        String scoringMode,
        int scoringVersion
) {}
