package com.whosdrunk.repository;

import com.whosdrunk.domain.consumption.Consumption;
import org.springframework.data.domain.Pageable;
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

    /** Most-logged drinks in a season (use Pageable to limit). */
    @Query("""
            SELECT d.id   AS drinkId,
                   d.name AS drinkName,
                   b.name AS brandName,
                   COUNT(c.id) AS total
            FROM Consumption c
            JOIN c.drink d
            LEFT JOIN d.brand b
            WHERE c.season.id = :seasonId
            GROUP BY d.id, d.name, b.name
            ORDER BY COUNT(c.id) DESC
            """)
    List<DrinkCountRow> topDrinksInSeason(@Param("seasonId") UUID seasonId, Pageable pageable);

    /** Most-logged drinks for a single user in a season. */
    @Query("""
            SELECT d.id   AS drinkId,
                   d.name AS drinkName,
                   b.name AS brandName,
                   COUNT(c.id) AS total
            FROM Consumption c
            JOIN c.drink d
            LEFT JOIN d.brand b
            WHERE c.season.id = :seasonId AND c.user.id = :userId
            GROUP BY d.id, d.name, b.name
            ORDER BY COUNT(c.id) DESC
            """)
    List<DrinkCountRow> topDrinksForUser(@Param("seasonId") UUID seasonId,
                                         @Param("userId") UUID userId,
                                         Pageable pageable);

    /** All consumption instants in a season, for streak computation. */
    @Query("SELECT c.user.id AS userId, c.occurredAt AS occurredAt "
            + "FROM Consumption c WHERE c.season.id = :seasonId")
    List<StreakRow> consumptionInstants(@Param("seasonId") UUID seasonId);

    @Query("SELECT COUNT(c) FROM Consumption c WHERE c.season.id = :seasonId")
    long countInSeason(@Param("seasonId") UUID seasonId);
}
