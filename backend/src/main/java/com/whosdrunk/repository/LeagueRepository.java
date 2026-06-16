package com.whosdrunk.repository;

import com.whosdrunk.domain.league.League;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LeagueRepository extends JpaRepository<League, UUID> {
    Optional<League> findByInviteCode(String inviteCode);
    boolean existsByInviteCode(String inviteCode);

    @Query("SELECT l.id FROM League l WHERE l.active = true")
    List<UUID> findActiveLeagueIds();
}
