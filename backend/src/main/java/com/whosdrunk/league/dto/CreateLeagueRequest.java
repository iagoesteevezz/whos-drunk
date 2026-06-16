package com.whosdrunk.league.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateLeagueRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 500) String description,
        @DecimalMin("0.1") BigDecimal scoreMultiplier,   // opcional; null = 1.0
        @DecimalMin("1.0") BigDecimal gramsPerUnit,       // opcional; null = 10.0 (UBE)
        @Min(1) @Max(365) Integer seasonLengthDays         // opcional; null = 30
) {}
