package com.whosdrunk.stats.dto;

import java.util.List;
import java.util.UUID;

/** Fun aggregations for a league's active season. */
public record LeagueStatsResponse(
        UUID seasonId,
        String seasonName,
        long totalConsumptions,
        StarDrink starDrink,
        List<UserFavoriteDrink> topFavorites,
        FireStreak fireStreak
) {
    /** The league's most-logged drink. */
    public record StarDrink(UUID drinkId, String name, String brandName, long count) {}

    /** A top-3 player's most-logged drink. */
    public record UserFavoriteDrink(int rank, UUID userId, String displayName, String drinkName, long count) {}

    /** The longest consecutive-days logging streak in the season. */
    public record FireStreak(UUID userId, String displayName, int days) {}

    public static LeagueStatsResponse empty(UUID seasonId, String seasonName) {
        return new LeagueStatsResponse(seasonId, seasonName, 0, null, List.of(), null);
    }
}
