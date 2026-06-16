package com.whosdrunk.season.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

/**
 * Si no se indican fechas, la temporada se crea desde "ahora" con la duración
 * por defecto de la liga (season_length_days).
 */
public record CreateSeasonRequest(
        @NotBlank @Size(max = 80) String name,
        Instant startsAt,
        Instant endsAt
) {}
