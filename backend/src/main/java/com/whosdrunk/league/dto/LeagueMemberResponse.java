package com.whosdrunk.league.dto;

import com.whosdrunk.domain.league.LeagueMembership;
import com.whosdrunk.domain.league.MembershipRole;

import java.time.Instant;
import java.util.UUID;

public record LeagueMemberResponse(
        UUID userId,
        String displayName,
        MembershipRole role,
        String nickname,
        Instant joinedAt
) {
    public static LeagueMemberResponse of(LeagueMembership m) {
        return new LeagueMemberResponse(
                m.getUser().getId(),
                m.getUser().getDisplayName(),
                m.getRole(),
                m.getNickname(),
                m.getJoinedAt());
    }
}
