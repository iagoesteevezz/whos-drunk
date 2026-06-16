package com.whosdrunk.scoring;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Implementación por defecto (sin Redis): no hace nada. Permite arrancar y
 * testear el motor sin infraestructura de tiempo real. En producción se declara
 * una RedisRankingPublisher anotada con {@code @Primary} para sustituirla.
 */
@Component
class NoopRankingPublisher implements RankingPublisher {

    @Override
    public void addPoints(UUID seasonId, UUID userId, BigDecimal points) {
        // no-op: la fuente de verdad sigue siendo Postgres
    }
}
