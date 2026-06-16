package com.whosdrunk.league.dto;

import jakarta.validation.constraints.NotBlank;

public record JoinLeagueRequest(
        @NotBlank String inviteCode
) {}
