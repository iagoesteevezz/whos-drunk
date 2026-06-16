package com.whosdrunk.season;

import com.whosdrunk.repository.LeagueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Fires the monthly season rollover. Default: 00:00 on the 1st of every month
 * in the configured zone (Europe/Madrid).
 *
 * <p>Resilience: each league is rolled in its own transaction; a failure on one
 * league is logged and the loop continues with the rest.
 */
@Component
public class SeasonRolloverScheduler {

    private static final Logger log = LoggerFactory.getLogger(SeasonRolloverScheduler.class);

    private final LeagueRepository leagues;
    private final SeasonRolloverService rolloverService;

    public SeasonRolloverScheduler(LeagueRepository leagues, SeasonRolloverService rolloverService) {
        this.leagues = leagues;
        this.rolloverService = rolloverService;
    }

    @Scheduled(
            cron = "${app.season.rollover-cron:0 0 0 1 * *}",
            zone = "${app.season.zone:Europe/Madrid}")
    public void rolloverAllLeagues() {
        List<UUID> leagueIds = leagues.findActiveLeagueIds();
        log.info("Season rollover starting for {} active league(s)", leagueIds.size());

        int rolled = 0, skipped = 0, failed = 0;
        for (UUID leagueId : leagueIds) {
            try {
                SeasonRolloverService.Outcome outcome = rolloverService.rolloverLeague(leagueId);
                if (outcome == SeasonRolloverService.Outcome.ROLLED) {
                    rolled++;
                } else {
                    skipped++;
                }
            } catch (Exception ex) {
                // Isolate the failure: log and keep processing the other leagues.
                failed++;
                log.error("Season rollover failed for league {}: {}", leagueId, ex.toString(), ex);
            }
        }

        log.info("Season rollover finished: {} rolled, {} skipped, {} failed (of {} total)",
                rolled, skipped, failed, leagueIds.size());
    }
}
