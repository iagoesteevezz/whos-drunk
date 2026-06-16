package com.whosdrunk.season;

import com.whosdrunk.common.error.AppException;
import com.whosdrunk.domain.league.League;
import com.whosdrunk.domain.season.Season;
import com.whosdrunk.domain.season.SeasonStatus;
import com.whosdrunk.domain.user.User;
import com.whosdrunk.league.LeagueAccess;
import com.whosdrunk.repository.LeagueRepository;
import com.whosdrunk.repository.SeasonRepository;
import com.whosdrunk.repository.UserRepository;
import com.whosdrunk.season.dto.CreateSeasonRequest;
import com.whosdrunk.season.dto.SeasonResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SeasonService {

    private final SeasonRepository seasons;
    private final LeagueRepository leagues;
    private final UserRepository users;
    private final LeagueAccess access;

    public SeasonService(SeasonRepository seasons, LeagueRepository leagues,
                         UserRepository users, LeagueAccess access) {
        this.seasons = seasons;
        this.leagues = leagues;
        this.users = users;
        this.access = access;
    }

    /** Crea una temporada en estado SCHEDULED. Reservado a OWNER/ADMIN. */
    @Transactional
    public SeasonResponse create(UUID userId, UUID leagueId, CreateSeasonRequest req) {
        access.requireManager(leagueId, userId);
        League league = leagues.findById(leagueId)
                .orElseThrow(() -> AppException.notFound("Liga no encontrada"));

        Instant startsAt = req.startsAt() != null ? req.startsAt() : Instant.now();
        Instant endsAt = req.endsAt() != null
                ? req.endsAt()
                : startsAt.plus(league.getSeasonLengthDays(), ChronoUnit.DAYS);
        if (!endsAt.isAfter(startsAt)) {
            throw AppException.unprocessable("La fecha de fin debe ser posterior a la de inicio");
        }

        Season season = Season.builder()
                .league(league)
                .name(req.name().trim())
                .status(SeasonStatus.SCHEDULED)
                .startsAt(startsAt)
                .endsAt(endsAt)
                .build();
        seasons.save(season);
        return SeasonResponse.of(season);
    }

    /**
     * Activa una temporada. Cierra la temporada activa anterior (si la hay) para
     * respetar la invariante de "una sola activa por liga".
     */
    @Transactional
    public SeasonResponse activate(UUID userId, UUID leagueId, UUID seasonId) {
        access.requireManager(leagueId, userId);
        Season season = loadInLeague(leagueId, seasonId);

        if (season.getStatus() == SeasonStatus.CLOSED) {
            throw AppException.unprocessable("No se puede reactivar una temporada cerrada");
        }

        seasons.findByLeagueIdAndStatus(leagueId, SeasonStatus.ACTIVE)
                .filter(active -> !active.getId().equals(seasonId))
                .ifPresent(active -> active.setStatus(SeasonStatus.CLOSED));

        season.setStatus(SeasonStatus.ACTIVE);
        return SeasonResponse.of(season);
    }

    /** Cierra una temporada. Reservado a OWNER/ADMIN. */
    @Transactional
    public SeasonResponse close(UUID userId, UUID leagueId, UUID seasonId) {
        access.requireManager(leagueId, userId);
        Season season = loadInLeague(leagueId, seasonId);
        season.setStatus(SeasonStatus.CLOSED);
        return SeasonResponse.of(season);
    }

    /**
     * Season history (most recent first), enriched with the winner's display
     * name for closed seasons. Any member can read it.
     */
    @Transactional(readOnly = true)
    public List<SeasonResponse> list(UUID userId, UUID leagueId) {
        access.requireMember(leagueId, userId);
        List<Season> all = seasons.findByLeagueIdOrderByStartsAtDesc(leagueId);

        // Batch-resolve winner names in a single query.
        List<UUID> winnerIds = all.stream()
                .map(Season::getWinnerUserId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        Map<UUID, String> namesById = winnerIds.isEmpty()
                ? Map.of()
                : users.findAllById(winnerIds).stream()
                        .collect(Collectors.toMap(User::getId, User::getDisplayName));

        return all.stream()
                .map(s -> SeasonResponse.of(s, namesById.get(s.getWinnerUserId())))
                .toList();
    }

    /** Temporada activa de la liga (cualquier miembro). */
    @Transactional(readOnly = true)
    public SeasonResponse getActive(UUID userId, UUID leagueId) {
        access.requireMember(leagueId, userId);
        return seasons.findByLeagueIdAndStatus(leagueId, SeasonStatus.ACTIVE)
                .map(SeasonResponse::of)
                .orElseThrow(() -> AppException.notFound("La liga no tiene temporada activa"));
    }

    private Season loadInLeague(UUID leagueId, UUID seasonId) {
        Season season = seasons.findById(seasonId)
                .orElseThrow(() -> AppException.notFound("Temporada no encontrada"));
        if (!season.getLeague().getId().equals(leagueId)) {
            throw AppException.notFound("La temporada no pertenece a esta liga");
        }
        return season;
    }
}
