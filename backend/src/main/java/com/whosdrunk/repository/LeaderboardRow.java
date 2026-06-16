package com.whosdrunk.repository;

import java.math.BigDecimal;
import java.util.UUID;

/** Proyección de una fila del ranking de temporada. */
public interface LeaderboardRow {
    UUID getUserId();
    String getDisplayName();
    BigDecimal getTotalPoints();
    BigDecimal getTotalPureAlcoholG();
    Long getTotalConsumptions();
}
