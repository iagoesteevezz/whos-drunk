package com.whosdrunk.scoring;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Comando de aplicación para registrar un consumo en una liga.
 *
 * @param volumeOverrideMl volumen explícito en ml; si es null se usa el del formato
 */
public record RegisterConsumptionCommand(
        UUID userId,
        UUID leagueId,
        UUID drinkId,
        short servingFormatId,
        BigDecimal quantity,
        Integer volumeOverrideMl,
        Instant occurredAt
) {}
