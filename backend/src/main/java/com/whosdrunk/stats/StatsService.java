package com.whosdrunk.stats;

import com.whosdrunk.domain.season.Season;
import com.whosdrunk.domain.season.SeasonStatus;
import com.whosdrunk.league.LeagueAccess;
import com.whosdrunk.repository.ConsumptionRepository;
import com.whosdrunk.repository.DrinkCountRow;
import com.whosdrunk.repository.LeaderboardRow;
import com.whosdrunk.repository.SeasonRepository;
import com.whosdrunk.repository.StreakRow;
import com.whosdrunk.stats.dto.LeagueStatsResponse;
import com.whosdrunk.stats.dto.LeagueStatsResponse.FireStreak;
import com.whosdrunk.stats.dto.LeagueStatsResponse.StarDrink;
import com.whosdrunk.stats.dto.LeagueStatsResponse.UserFavoriteDrink;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class StatsService {

    private final SeasonRepository seasons;
    private final ConsumptionRepository consumptions;
    private final LeagueAccess access;
    private final ZoneId zone;

    public StatsService(SeasonRepository seasons,
                        ConsumptionRepository consumptions,
                        LeagueAccess access,
                        @Value("${app.season.zone:Europe/Madrid}") String zoneId) {
        this.seasons = seasons;
        this.consumptions = consumptions;
        this.access = access;
        this.zone = ZoneId.of(zoneId);
    }

    @Transactional(readOnly = true)
    public LeagueStatsResponse getStats(UUID userId, UUID leagueId) {
        access.requireMember(leagueId, userId);

        Optional<Season> active = seasons.findByLeagueIdAndStatus(leagueId, SeasonStatus.ACTIVE);
        if (active.isEmpty()) {
            return LeagueStatsResponse.empty(null, null);
        }
        UUID seasonId = active.get().getId();
        String seasonName = active.get().getName();

        long total = consumptions.countInSeason(seasonId);
        if (total == 0) {
            return LeagueStatsResponse.empty(seasonId, seasonName);
        }

        List<LeaderboardRow> leaderboard = consumptions.leaderboard(seasonId);
        Map<UUID, String> nameById = new HashMap<>();
        leaderboard.forEach(r -> nameById.put(r.getUserId(), r.getDisplayName()));

        StarDrink starDrink = consumptions.topDrinksInSeason(seasonId, PageRequest.of(0, 1))
                .stream().findFirst()
                .map(r -> new StarDrink(r.getDrinkId(), r.getDrinkName(), r.getBrandName(), r.getTotal()))
                .orElse(null);

        List<UserFavoriteDrink> favorites = topFavorites(seasonId, leaderboard);
        FireStreak fireStreak = computeFireStreak(seasonId, nameById);

        return new LeagueStatsResponse(seasonId, seasonName, total, starDrink, favorites, fireStreak);
    }

    /** Favorite (most-logged) drink for each of the top-3 players by points. */
    private List<UserFavoriteDrink> topFavorites(UUID seasonId, List<LeaderboardRow> leaderboard) {
        List<UserFavoriteDrink> favorites = new ArrayList<>();
        int rank = 1;
        for (LeaderboardRow row : leaderboard.stream().limit(3).toList()) {
            Optional<DrinkCountRow> fav = consumptions
                    .topDrinksForUser(seasonId, row.getUserId(), PageRequest.of(0, 1))
                    .stream().findFirst();
            if (fav.isPresent()) {
                favorites.add(new UserFavoriteDrink(
                        rank, row.getUserId(), row.getDisplayName(),
                        fav.get().getDrinkName(), fav.get().getTotal()));
            }
            rank++;
        }
        return favorites;
    }

    /** Longest run of consecutive days (in the configured zone) with ≥1 drink. */
    private FireStreak computeFireStreak(UUID seasonId, Map<UUID, String> nameById) {
        Map<UUID, Set<LocalDate>> daysByUser = new HashMap<>();
        for (StreakRow row : consumptions.consumptionInstants(seasonId)) {
            LocalDate day = row.getOccurredAt().atZone(zone).toLocalDate();
            daysByUser.computeIfAbsent(row.getUserId(), k -> new HashSet<>()).add(day);
        }

        UUID bestUser = null;
        int bestDays = 0;
        for (Map.Entry<UUID, Set<LocalDate>> entry : daysByUser.entrySet()) {
            int longest = longestConsecutive(entry.getValue());
            if (longest > bestDays) {
                bestDays = longest;
                bestUser = entry.getKey();
            }
        }
        if (bestUser == null) {
            return null;
        }
        return new FireStreak(bestUser, nameById.getOrDefault(bestUser, "Unknown"), bestDays);
    }

    private int longestConsecutive(Set<LocalDate> days) {
        List<LocalDate> sorted = new ArrayList<>(days);
        Collections.sort(sorted);
        int longest = 1;
        int run = 1;
        for (int i = 1; i < sorted.size(); i++) {
            if (sorted.get(i - 1).plusDays(1).equals(sorted.get(i))) {
                run++;
            } else {
                run = 1;
            }
            longest = Math.max(longest, run);
        }
        return longest;
    }
}
