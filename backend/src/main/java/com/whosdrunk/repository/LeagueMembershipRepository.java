package com.whosdrunk.repository;

import com.whosdrunk.domain.league.LeagueMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LeagueMembershipRepository
        extends JpaRepository<LeagueMembership, LeagueMembership.Key> {

    @Query("SELECT m FROM LeagueMembership m WHERE m.league.id = :leagueId AND m.user.id = :userId")
    Optional<LeagueMembership> find(@Param("leagueId") UUID leagueId, @Param("userId") UUID userId);

    @Query("""
            SELECT m FROM LeagueMembership m
            JOIN FETCH m.league
            WHERE m.user.id = :userId
            ORDER BY m.joinedAt DESC
            """)
    List<LeagueMembership> findAllByUser(@Param("userId") UUID userId);

    @Query("""
            SELECT m FROM LeagueMembership m
            JOIN FETCH m.user
            WHERE m.league.id = :leagueId
            ORDER BY m.joinedAt ASC
            """)
    List<LeagueMembership> findAllByLeague(@Param("leagueId") UUID leagueId);

    @Query("SELECT COUNT(m) FROM LeagueMembership m WHERE m.league.id = :leagueId")
    long countMembers(@Param("leagueId") UUID leagueId);
}
