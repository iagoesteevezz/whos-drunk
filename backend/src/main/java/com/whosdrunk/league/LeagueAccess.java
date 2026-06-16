package com.whosdrunk.league;

import com.whosdrunk.common.error.AppException;
import com.whosdrunk.domain.league.LeagueMembership;
import com.whosdrunk.domain.league.MembershipRole;
import com.whosdrunk.repository.LeagueMembershipRepository;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;

/**
 * Punto único de autorización por liga, reutilizable por los servicios de liga
 * y temporada. Evita duplicar comprobaciones de pertenencia y rol.
 */
@Component
public class LeagueAccess {

    private static final Set<MembershipRole> MANAGERS =
            EnumSet.of(MembershipRole.OWNER, MembershipRole.ADMIN);

    private final LeagueMembershipRepository memberships;

    public LeagueAccess(LeagueMembershipRepository memberships) {
        this.memberships = memberships;
    }

    /** Exige que el usuario sea miembro de la liga; devuelve su membresía. */
    public LeagueMembership requireMember(UUID leagueId, UUID userId) {
        return memberships.find(leagueId, userId)
                .orElseThrow(() -> AppException.forbidden("No perteneces a esta liga"));
    }

    /** Exige rol de gestor (OWNER o ADMIN). */
    public LeagueMembership requireManager(UUID leagueId, UUID userId) {
        LeagueMembership membership = requireMember(leagueId, userId);
        if (!MANAGERS.contains(membership.getRole())) {
            throw AppException.forbidden("Acción reservada al propietario o administradores de la liga");
        }
        return membership;
    }
}
