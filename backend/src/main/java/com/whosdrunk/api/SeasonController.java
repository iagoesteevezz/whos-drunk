package com.whosdrunk.api;

import com.whosdrunk.season.SeasonService;
import com.whosdrunk.season.dto.CreateSeasonRequest;
import com.whosdrunk.season.dto.SeasonResponse;
import com.whosdrunk.security.AuthPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leagues/{leagueId}/seasons")
public class SeasonController {

    private final SeasonService seasons;

    public SeasonController(SeasonService seasons) {
        this.seasons = seasons;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SeasonResponse create(@AuthenticationPrincipal AuthPrincipal me,
                                 @PathVariable UUID leagueId,
                                 @Valid @RequestBody CreateSeasonRequest req) {
        return seasons.create(me.userId(), leagueId, req);
    }

    @GetMapping
    public List<SeasonResponse> list(@AuthenticationPrincipal AuthPrincipal me,
                                     @PathVariable UUID leagueId) {
        return seasons.list(me.userId(), leagueId);
    }

    @GetMapping("/active")
    public SeasonResponse active(@AuthenticationPrincipal AuthPrincipal me,
                                 @PathVariable UUID leagueId) {
        return seasons.getActive(me.userId(), leagueId);
    }

    @PostMapping("/{seasonId}/activate")
    public SeasonResponse activate(@AuthenticationPrincipal AuthPrincipal me,
                                   @PathVariable UUID leagueId,
                                   @PathVariable UUID seasonId) {
        return seasons.activate(me.userId(), leagueId, seasonId);
    }

    @PostMapping("/{seasonId}/close")
    public SeasonResponse close(@AuthenticationPrincipal AuthPrincipal me,
                                @PathVariable UUID leagueId,
                                @PathVariable UUID seasonId) {
        return seasons.close(me.userId(), leagueId, seasonId);
    }
}
