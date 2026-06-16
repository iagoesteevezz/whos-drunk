package com.whosdrunk.domain.season;

import com.whosdrunk.domain.league.League;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "seasons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Season {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "league_id")
    private League league;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    @Builder.Default
    private SeasonStatus status = SeasonStatus.SCHEDULED;

    @Column(name = "starts_at", nullable = false)
    private Instant startsAt;

    @Column(name = "ends_at", nullable = false)
    private Instant endsAt;

    /** Settled when the season is closed (top of the final leaderboard). */
    @Column(name = "winner_user_id")
    private UUID winnerUserId;

    @Column(name = "winner_points")
    private BigDecimal winnerPoints;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    public boolean isOpenAt(Instant moment) {
        return status == SeasonStatus.ACTIVE
                && !moment.isBefore(startsAt)
                && moment.isBefore(endsAt);
    }
}
