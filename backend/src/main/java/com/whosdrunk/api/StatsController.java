package com.whosdrunk.api;

import com.whosdrunk.security.AuthPrincipal;
import com.whosdrunk.stats.StatsService;
import com.whosdrunk.stats.dto.LeagueStatsResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leagues/{leagueId}/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    /** Fun aggregations for the league's active season. */
    @GetMapping
    public LeagueStatsResponse stats(@AuthenticationPrincipal AuthPrincipal me,
                                     @PathVariable UUID leagueId) {
        return statsService.getStats(me.userId(), leagueId);
    }
}
