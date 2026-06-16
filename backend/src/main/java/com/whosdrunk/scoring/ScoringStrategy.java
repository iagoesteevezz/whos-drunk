package com.whosdrunk.scoring;

/**
 * Abstracción del algoritmo de puntuación (patrón Strategy).
 *
 * <p>OCP: nuevas reglas de puntuación (modos de fiesta, hándicaps, bonus) se
 * añaden creando nuevas implementaciones sin modificar {@link ScoringService}.
 * La estrategia adecuada se resuelve por {@link #mode()} a partir del
 * {@code scoring_mode} de la liga.
 */
public interface ScoringStrategy {

    /** Identificador del modo, casa con League.scoringMode. */
    String mode();

    /** Versión del algoritmo, para auditoría y recálculos reproducibles. */
    int version();

    /** Calcula gramos de alcohol puro y puntos de forma pura (sin efectos). */
    ScoringResult score(ScoringInput input);
}
