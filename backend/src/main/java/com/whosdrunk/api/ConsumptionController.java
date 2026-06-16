package com.whosdrunk.api;

import com.whosdrunk.api.dto.ConsumptionResponse;
import com.whosdrunk.api.dto.LeaderboardEntryResponse;
import com.whosdrunk.api.dto.RegisterConsumptionRequest;
import com.whosdrunk.repository.ConsumptionRepository;
import com.whosdrunk.repository.LeaderboardRow;
import com.whosdrunk.repository.SeasonRepository;
import com.whosdrunk.domain.season.SeasonStatus;
import com.whosdrunk.scoring.RegisterConsumptionCommand;
import com.whosdrunk.scoring.ScoringService;
import com.whosdrunk.security.AuthPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/v1")
public class ConsumptionController {

    private final ScoringService scoringService;
    private final ConsumptionRepository consumptions;
    private final SeasonRepository seasons;

    public ConsumptionController(ScoringService scoringService,
                                 ConsumptionRepository consumptions,
                                 SeasonRepository seasons) {
        this.scoringService = scoringService;
        this.consumptions = consumptions;
        this.seasons = seasons;
    }

    /** Registers a consumption for the authenticated user and returns its score. */
    @PostMapping("/consumptions")
    @ResponseStatus(HttpStatus.CREATED)
    public ConsumptionResponse register(@AuthenticationPrincipal AuthPrincipal me,
                                        @Valid @RequestBody RegisterConsumptionRequest req) {
        var command = new RegisterConsumptionCommand(
                me.userId(), req.leagueId(), req.drinkId(),
                req.servingFormatId(), req.quantity(), req.volumeOverrideMl(), req.occurredAt());

        var scored = scoringService.register(command);
        return new ConsumptionResponse(
                scored.consumptionId(),
                scored.result().pureAlcoholGrams(),
                scored.result().points(),
                scored.result().scoringMode());
    }

    /** Leaderboard de la temporada activa de una liga. */
    @GetMapping("/leagues/{leagueId}/leaderboard")
    public ResponseEntity<List<LeaderboardEntryResponse>> leaderboard(@PathVariable UUID leagueId) {
        var season = seasons.findByLeagueIdAndStatus(leagueId, SeasonStatus.ACTIVE)
                .orElseThrow(() -> new ScoringService.NotFoundException("La liga no tiene temporada activa"));

        List<LeaderboardRow> rows = consumptions.leaderboard(season.getId());
        AtomicInteger rank = new AtomicInteger(1);
        var body = rows.stream()
                .map(r -> new LeaderboardEntryResponse(
                        rank.getAndIncrement(),
                        r.getUserId(),
                        r.getDisplayName(),
                        r.getTotalPoints(),
                        r.getTotalPureAlcoholG(),
                        r.getTotalConsumptions()))
                .toList();
        return ResponseEntity.ok(body);
    }
}
