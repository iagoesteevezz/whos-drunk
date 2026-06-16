package com.whosdrunk.api;

import com.whosdrunk.league.LeagueService;
import com.whosdrunk.league.dto.CreateLeagueRequest;
import com.whosdrunk.league.dto.JoinLeagueRequest;
import com.whosdrunk.league.dto.LeagueMemberResponse;
import com.whosdrunk.league.dto.LeagueResponse;
import com.whosdrunk.security.AuthPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leagues")
public class LeagueController {

    private final LeagueService leagues;

    public LeagueController(LeagueService leagues) {
        this.leagues = leagues;
    }

    /** Crea una liga; el creador queda como OWNER. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LeagueResponse create(@AuthenticationPrincipal AuthPrincipal me,
                                 @Valid @RequestBody CreateLeagueRequest req) {
        return leagues.create(me.userId(), req);
    }

    /** Une al usuario autenticado a una liga mediante código de invitación. */
    @PostMapping("/join")
    public LeagueResponse join(@AuthenticationPrincipal AuthPrincipal me,
                               @Valid @RequestBody JoinLeagueRequest req) {
        return leagues.joinByCode(me.userId(), req.inviteCode());
    }

    /** Ligas del usuario autenticado. */
    @GetMapping
    public List<LeagueResponse> myLeagues(@AuthenticationPrincipal AuthPrincipal me) {
        return leagues.listMine(me.userId());
    }

    @GetMapping("/{leagueId}")
    public LeagueResponse get(@AuthenticationPrincipal AuthPrincipal me,
                              @PathVariable UUID leagueId) {
        return leagues.get(me.userId(), leagueId);
    }

    @GetMapping("/{leagueId}/members")
    public List<LeagueMemberResponse> members(@AuthenticationPrincipal AuthPrincipal me,
                                              @PathVariable UUID leagueId) {
        return leagues.listMembers(me.userId(), leagueId);
    }

    @DeleteMapping("/{leagueId}/membership")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leave(@AuthenticationPrincipal AuthPrincipal me,
                      @PathVariable UUID leagueId) {
        leagues.leave(me.userId(), leagueId);
    }
}
