package com.whosdrunk.domain.consumption;

import com.whosdrunk.domain.catalog.Drink;
import com.whosdrunk.domain.catalog.ServingFormat;
import com.whosdrunk.domain.league.League;
import com.whosdrunk.domain.season.Season;
import com.whosdrunk.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Hecho inmutable de un consumo. Guarda snapshots de volumen y ABV para que
 * correcciones posteriores del catálogo no alteren el histórico de puntos.
 */
@Entity
@Table(name = "consumptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consumption {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "season_id")
    private Season season;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "league_id")
    private League league;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drink_id")
    private Drink drink;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "serving_format_id")
    private ServingFormat servingFormat;

    /** Número de unidades registradas (p. ej. 2 cañas). */
    @Column(nullable = false)
    @Builder.Default
    private BigDecimal quantity = BigDecimal.ONE;

    @Column(name = "volume_ml_snapshot", nullable = false)
    private Integer volumeMlSnapshot;

    @Column(name = "abv_snapshot", nullable = false)
    private BigDecimal abvSnapshot;

    @Column(name = "occurred_at", nullable = false)
    @Builder.Default
    private Instant occurredAt = Instant.now();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @OneToOne(mappedBy = "consumption", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ConsumptionScore score;
}
