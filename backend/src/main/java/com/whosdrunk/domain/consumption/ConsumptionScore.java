package com.whosdrunk.domain.consumption;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Resultado de aplicar la ScoringStrategy a un consumo (relación 1:1).
 * Separado de Consumption para aislar el motor de puntuación (SRP) y permitir
 * recálculos versionados sin tocar el hecho registrado.
 */
@Entity
@Table(name = "consumption_scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsumptionScore {

    @Id
    @Column(name = "consumption_id")
    private UUID consumptionId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "consumption_id")
    private Consumption consumption;

    @Column(name = "pure_alcohol_grams", nullable = false)
    private BigDecimal pureAlcoholGrams;

    @Column(nullable = false)
    private BigDecimal points;

    @Column(name = "scoring_mode", nullable = false)
    private String scoringMode;

    @Column(name = "scoring_version", nullable = false)
    @Builder.Default
    private int scoringVersion = 1;

    @Column(name = "computed_at", nullable = false)
    @Builder.Default
    private Instant computedAt = Instant.now();
}
