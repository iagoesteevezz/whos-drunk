package com.whosdrunk.domain.league;

import com.whosdrunk.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "leagues")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class League {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    /** Código de invitación único para unirse a la liga. */
    @Column(name = "invite_code", nullable = false, unique = true, length = 12)
    private String inviteCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id")
    private User owner;

    /** Selecciona la ScoringStrategy (OCP): PURE_ALCOHOL, etc. */
    @Column(name = "scoring_mode", nullable = false)
    @Builder.Default
    private String scoringMode = "PURE_ALCOHOL";

    @Column(name = "score_multiplier", nullable = false)
    @Builder.Default
    private BigDecimal scoreMultiplier = BigDecimal.ONE;

    /** Gramos de alcohol puro por "unidad" de puntuación (UBE España = 10 g). */
    @Column(name = "grams_per_unit", nullable = false)
    @Builder.Default
    private BigDecimal gramsPerUnit = new BigDecimal("10.00");

    @Column(name = "season_length_days", nullable = false)
    @Builder.Default
    private int seasonLengthDays = 30;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
