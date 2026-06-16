package com.whosdrunk.repository;

import com.whosdrunk.domain.consumption.Consumption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ConsumptionRepository extends JpaRepository<Consumption, UUID> {

    /**
     * Leaderboard de una temporada, ordenado por puntos. Fuente de verdad para
     * reconstruir el sorted set de Redis si se pierde la caché.
     */
    @Query("""
            SELECT u.id            AS userId,
                   u.displayName   AS displayName,
                   SUM(s.points)               AS totalPoints,
                   SUM(s.pureAlcoholGrams)     AS totalPureAlcoholG,
                   COUNT(c.id)                 AS totalConsumptions
            FROM Consumption c
            JOIN c.score s
            JOIN c.user u
            WHERE c.season.id = :seasonId
            GROUP BY u.id, u.displayName
            ORDER BY SUM(s.points) DESC
            """)
    List<LeaderboardRow> leaderboard(@Param("seasonId") UUID seasonId);
}
