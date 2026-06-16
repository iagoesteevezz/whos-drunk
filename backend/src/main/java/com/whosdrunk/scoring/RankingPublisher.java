package com.whosdrunk.scoring;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Puerto de salida para empujar puntos al ranking en vivo (p. ej. sorted set de
 * Redis). DIP: el servicio depende de esta abstracción, no de Redis.
 */
public interface RankingPublisher {

    /** Incrementa los puntos del usuario en el leaderboard de la temporada. */
    void addPoints(UUID seasonId, UUID userId, BigDecimal points);
}
