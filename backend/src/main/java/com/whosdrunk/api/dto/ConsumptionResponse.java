package com.whosdrunk.api.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ConsumptionResponse(
        UUID consumptionId,
        BigDecimal pureAlcoholGrams,
        BigDecimal points,
        String scoringMode
) {}
