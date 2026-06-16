package com.whosdrunk.season;

import com.whosdrunk.common.error.AppException;
import com.whosdrunk.domain.league.League;
import com.whosdrunk.domain.season.Season;
import com.whosdrunk.domain.season.SeasonStatus;
import com.whosdrunk.repository.ConsumptionRepository;
import com.whosdrunk.repository.LeagueRepository;
import com.whosdrunk.repository.SeasonRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

/**
 * Rolls a single league over to the new calendar month: settles + closes the
 * current season and opens the new one. Each call runs in its OWN transaction
 * so one league's failure cannot roll back another's (the scheduler handles the
 * loop and per-league error isolation).
 */
@Service
public class SeasonRolloverService {

    public enum Outcome { ROLLED, SKIPPED }

    private final LeagueRepository leagues;
    private final SeasonRepository seasons;
    private final ConsumptionRepository consumptions;
    private final ZoneId zone;

    public SeasonRolloverService(LeagueRepository leagues,
                                 SeasonRepository seasons,
                                 ConsumptionRepository consumptions,
                                 @Value("${app.season.zone:Europe/Madrid}") String zoneId) {
        this.leagues = leagues;
        this.seasons = seasons;
        this.consumptions = consumptions;
        this.zone = ZoneId.of(zoneId);
    }

    @Transactional
    public Outcome rolloverLeague(UUID leagueId) {
        League league = leagues.findById(leagueId)
                .orElseThrow(() -> AppException.notFound("League not found: " + leagueId));

        // Current calendar month boundaries in the configured zone. Using
        // atStartOfDay(zone) keeps the boundaries DST-correct.
        YearMonth month = YearMonth.now(zone);
        Instant monthStart = month.atDay(1).atStartOfDay(zone).toInstant();
        Instant monthEnd = month.plusMonths(1).atDay(1).atStartOfDay(zone).toInstant();
        String name = month.format(DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ENGLISH));

        Optional<Season> active = seasons.findByLeagueIdAndStatus(leagueId, SeasonStatus.ACTIVE);

        // Idempotency: if the active season already belongs to this month, the
        // rollover already happened (e.g. job retried) — do nothing.
        if (active.isPresent() && !active.get().getStartsAt().isBefore(monthStart)) {
            return Outcome.SKIPPED;
        }

        active.ifPresent(this::settleAndClose);

        seasons.save(Season.builder()
                .league(league)
                .name(name)
                .status(SeasonStatus.ACTIVE)
                .startsAt(monthStart)
                .endsAt(monthEnd)
                .build());

        return Outcome.ROLLED;
    }

    /** Records the winner (top of the final leaderboard) and closes the season. */
    private void settleAndClose(Season season) {
        consumptions.leaderboard(season.getId()).stream().findFirst().ifPresent(top -> {
            season.setWinnerUserId(top.getUserId());
            season.setWinnerPoints(top.getTotalPoints());
        });
        season.setStatus(SeasonStatus.CLOSED);
    }
}
