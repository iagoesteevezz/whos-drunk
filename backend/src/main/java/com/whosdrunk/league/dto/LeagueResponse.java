package com.whosdrunk.league.dto;

import com.whosdrunk.domain.league.League;
import com.whosdrunk.domain.league.MembershipRole;

import java.math.BigDecimal;
import java.util.UUID;

public record LeagueResponse(
        UUID id,
        String name,
        String description,
        String inviteCode,
        String scoringMode,
        BigDecimal scoreMultiplier,
        BigDecimal gramsPerUnit,
        int seasonLengthDays,
        long memberCount,
        MembershipRole myRole
) {
    public static LeagueResponse of(League l, long memberCount, MembershipRole myRole) {
        return new LeagueResponse(
                l.getId(), l.getName(), l.getDescription(), l.getInviteCode(),
                l.getScoringMode(), l.getScoreMultiplier(), l.getGramsPerUnit(),
                l.getSeasonLengthDays(), memberCount, myRole);
    }
}
