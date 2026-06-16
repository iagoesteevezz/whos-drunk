package com.whosdrunk.api.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record LeaderboardEntryResponse(
        int rank,
        UUID userId,
        String displayName,
        BigDecimal totalPoints,
        BigDecimal totalPureAlcoholG,
        long totalConsumptions
) {}
