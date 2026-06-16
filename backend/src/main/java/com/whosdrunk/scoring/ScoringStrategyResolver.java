package com.whosdrunk.scoring;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Selecciona la {@link ScoringStrategy} adecuada a partir del modo de la liga.
 *
 * <p>DIP: Spring inyecta TODAS las implementaciones disponibles; añadir una
 * estrategia nueva no requiere tocar esta clase ni el servicio.
 */
@Component
public class ScoringStrategyResolver {

    private final Map<String, ScoringStrategy> strategiesByMode;

    public ScoringStrategyResolver(List<ScoringStrategy> strategies) {
        this.strategiesByMode = strategies.stream()
                .collect(Collectors.toMap(ScoringStrategy::mode, Function.identity()));
    }

    public ScoringStrategy resolve(String mode) {
        ScoringStrategy strategy = strategiesByMode.get(mode);
        if (strategy == null) {
            throw new IllegalArgumentException("Modo de puntuación no soportado: " + mode);
        }
        return strategy;
    }
}
