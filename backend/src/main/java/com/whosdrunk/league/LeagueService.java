package com.whosdrunk.league;

import com.whosdrunk.common.error.AppException;
import com.whosdrunk.domain.league.League;
import com.whosdrunk.domain.league.LeagueMembership;
import com.whosdrunk.domain.league.MembershipRole;
import com.whosdrunk.domain.season.Season;
import com.whosdrunk.domain.season.SeasonStatus;
import com.whosdrunk.domain.user.User;
import com.whosdrunk.league.dto.CreateLeagueRequest;
import com.whosdrunk.league.dto.LeagueMemberResponse;
import com.whosdrunk.league.dto.LeagueResponse;
import com.whosdrunk.repository.LeagueMembershipRepository;
import com.whosdrunk.repository.LeagueRepository;
import com.whosdrunk.repository.SeasonRepository;
import com.whosdrunk.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class LeagueService {

    private final LeagueRepository leagues;
    private final LeagueMembershipRepository memberships;
    private final SeasonRepository seasons;
    private final UserRepository users;
    private final InviteCodeGenerator inviteCodeGenerator;
    private final LeagueAccess access;

    public LeagueService(LeagueRepository leagues,
                         LeagueMembershipRepository memberships,
                         SeasonRepository seasons,
                         UserRepository users,
                         InviteCodeGenerator inviteCodeGenerator,
                         LeagueAccess access) {
        this.leagues = leagues;
        this.memberships = memberships;
        this.seasons = seasons;
        this.users = users;
        this.inviteCodeGenerator = inviteCodeGenerator;
        this.access = access;
    }

    /** Crea una liga y añade al creador como OWNER. */
    @Transactional
    public LeagueResponse create(UUID ownerId, CreateLeagueRequest req) {
        User owner = users.findById(ownerId)
                .orElseThrow(() -> AppException.unauthorized("Usuario no encontrado"));

        League league = League.builder()
                .name(req.name().trim())
                .description(req.description())
                .owner(owner)
                .inviteCode(inviteCodeGenerator.generateUnique())
                .scoreMultiplier(req.scoreMultiplier() != null ? req.scoreMultiplier() : BigDecimal.ONE)
                .gramsPerUnit(req.gramsPerUnit() != null ? req.gramsPerUnit() : new BigDecimal("10.00"))
                .seasonLengthDays(req.seasonLengthDays() != null ? req.seasonLengthDays() : 30)
                .build();
        leagues.save(league);

        addMembership(league, owner, MembershipRole.OWNER);
        openInauguralSeason(league);

        return LeagueResponse.of(league, 1, MembershipRole.OWNER);
    }

    /**
     * Creates and activates an inaugural season for the current month so scoring
     * has a target immediately (no "no active season" 422 on first consumption).
     */
    private void openInauguralSeason(League league) {
        Instant now = Instant.now();
        String name = LocalDate.now(ZoneOffset.UTC)
                .format(DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ENGLISH));

        seasons.save(Season.builder()
                .league(league)
                .name(name)
                .status(SeasonStatus.ACTIVE)
                .startsAt(now)
                .endsAt(now.plus(league.getSeasonLengthDays(), ChronoUnit.DAYS))
                .build());
    }

    /**
     * Une al usuario a la liga del código indicado. Idempotente: si ya es
     * miembro, devuelve la liga sin error. Robusto ante condiciones de carrera
     * gracias a la PK compuesta de membership.
     */
    @Transactional
    public LeagueResponse joinByCode(UUID userId, String rawCode) {
        String code = InviteCodeGenerator.normalize(rawCode);
        if (code.isEmpty()) {
            throw AppException.unprocessable("Código de invitación vacío");
        }

        League league = leagues.findByInviteCode(code)
                .orElseThrow(() -> AppException.notFound("No existe ninguna liga con ese código"));
        if (!league.isActive()) {
            throw AppException.unprocessable("La liga está cerrada y no admite nuevos miembros");
        }

        User user = users.findById(userId)
                .orElseThrow(() -> AppException.unauthorized("Usuario no encontrado"));

        // Idempotencia: si ya es miembro, no duplicamos.
        var existing = memberships.find(league.getId(), userId);
        if (existing.isPresent()) {
            return LeagueResponse.of(league, memberships.countMembers(league.getId()), existing.get().getRole());
        }

        try {
            addMembership(league, user, MembershipRole.MEMBER);
        } catch (DataIntegrityViolationException raceCondition) {
            // Otro request creó la membresía a la vez: lo tratamos como éxito.
            var role = memberships.find(league.getId(), userId)
                    .map(LeagueMembership::getRole).orElse(MembershipRole.MEMBER);
            return LeagueResponse.of(league, memberships.countMembers(league.getId()), role);
        }
        return LeagueResponse.of(league, memberships.countMembers(league.getId()), MembershipRole.MEMBER);
    }

    /** Lista las ligas a las que pertenece el usuario. */
    @Transactional(readOnly = true)
    public List<LeagueResponse> listMine(UUID userId) {
        return memberships.findAllByUser(userId).stream()
                .map(m -> LeagueResponse.of(
                        m.getLeague(),
                        memberships.countMembers(m.getLeague().getId()),
                        m.getRole()))
                .toList();
    }

    /** Detalle de una liga (solo miembros). */
    @Transactional(readOnly = true)
    public LeagueResponse get(UUID userId, UUID leagueId) {
        LeagueMembership membership = access.requireMember(leagueId, userId);
        League league = membership.getLeague();
        return LeagueResponse.of(league, memberships.countMembers(leagueId), membership.getRole());
    }

    /** Miembros de una liga (solo miembros). */
    @Transactional(readOnly = true)
    public List<LeagueMemberResponse> listMembers(UUID userId, UUID leagueId) {
        access.requireMember(leagueId, userId);
        return memberships.findAllByLeague(leagueId).stream()
                .map(LeagueMemberResponse::of)
                .toList();
    }

    /** Abandona una liga. El propietario no puede abandonar (debe transferir o cerrar). */
    @Transactional
    public void leave(UUID userId, UUID leagueId) {
        LeagueMembership membership = access.requireMember(leagueId, userId);
        if (membership.getRole() == MembershipRole.OWNER) {
            throw AppException.unprocessable(
                    "El propietario no puede abandonar la liga; transfiere la propiedad o ciérrala");
        }
        memberships.delete(membership);
    }

    private void addMembership(League league, User user, MembershipRole role) {
        LeagueMembership membership = LeagueMembership.builder()
                .id(new LeagueMembership.Key(league.getId(), user.getId()))
                .league(league)
                .user(user)
                .role(role)
                .build();
        memberships.save(membership);
    }
}
