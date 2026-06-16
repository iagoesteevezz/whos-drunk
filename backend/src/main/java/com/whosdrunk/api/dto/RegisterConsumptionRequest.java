package com.whosdrunk.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * The consuming user is never taken from the body: it is always resolved from
 * the authenticated principal (JWT) in the controller.
 */
public record RegisterConsumptionRequest(
        @NotNull UUID leagueId,
        @NotNull UUID drinkId,
        @NotNull Short servingFormatId,
        @NotNull @DecimalMin(value = "0.01") BigDecimal quantity,
        @Positive Integer volumeOverrideMl,
        Instant occurredAt
) {}
