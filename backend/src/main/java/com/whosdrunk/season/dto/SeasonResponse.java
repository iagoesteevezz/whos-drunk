package com.whosdrunk.season.dto;

import com.whosdrunk.domain.season.Season;
import com.whosdrunk.domain.season.SeasonStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record SeasonResponse(
        UUID id,
        UUID leagueId,
        String name,
        SeasonStatus status,
        Instant startsAt,
        Instant endsAt,
        UUID winnerUserId,
        String winnerDisplayName,
        BigDecimal winnerPoints
) {
    /** Without a resolved winner name (active/scheduled seasons). */
    public static SeasonResponse of(Season s) {
        return of(s, null);
    }

    /** With the winner's display name resolved (history listing). */
    public static SeasonResponse of(Season s, String winnerDisplayName) {
        return new SeasonResponse(
                s.getId(),
                s.getLeague().getId(),
                s.getName(),
                s.getStatus(),
                s.getStartsAt(),
                s.getEndsAt(),
                s.getWinnerUserId(),
                winnerDisplayName,
                s.getWinnerPoints());
    }
}
