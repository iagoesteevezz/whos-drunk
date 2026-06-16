package com.whosdrunk.repository;

import com.whosdrunk.domain.season.Season;
import com.whosdrunk.domain.season.SeasonStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SeasonRepository extends JpaRepository<Season, UUID> {
    Optional<Season> findByLeagueIdAndStatus(UUID leagueId, SeasonStatus status);
    List<Season> findByLeagueIdOrderByStartsAtDesc(UUID leagueId);
}
