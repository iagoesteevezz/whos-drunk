package com.whosdrunk.scoring;

import com.whosdrunk.domain.catalog.Drink;
import com.whosdrunk.domain.catalog.ServingFormat;
import com.whosdrunk.domain.consumption.Consumption;
import com.whosdrunk.domain.consumption.ConsumptionScore;
import com.whosdrunk.domain.league.League;
import com.whosdrunk.domain.season.Season;
import com.whosdrunk.domain.season.SeasonStatus;
import com.whosdrunk.domain.user.User;
import com.whosdrunk.league.LeagueAccess;
import com.whosdrunk.notification.NotificationService;
import com.whosdrunk.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Servicio de aplicación que registra un consumo y calcula su puntuación para
 * el ranking de la liga.
 *
 * <p>SOLID:
 * <ul>
 *   <li><b>SRP</b>: orquesta el caso de uso; el cálculo vive en la estrategia y
 *       la persistencia en los repositorios.</li>
 *   <li><b>OCP</b>: la fórmula se elige por {@link ScoringStrategyResolver}; añadir
 *       modos no toca esta clase.</li>
 *   <li><b>DIP</b>: depende de abstracciones (repositorios, {@link RankingPublisher},
 *       {@link ScoringStrategy}), nunca de implementaciones concretas.</li>
 * </ul>
 */
@Service
public class ScoringService {

    private final UserRepository users;
    private final LeagueRepository leagues;
    private final SeasonRepository seasons;
    private final DrinkRepository drinks;
    private final ServingFormatRepository servingFormats;
    private final ConsumptionRepository consumptions;
    private final ScoringStrategyResolver strategyResolver;
    private final RankingPublisher rankingPublisher;
    private final LeagueAccess leagueAccess;
    private final NotificationService notificationService;

    private static final Logger log = LoggerFactory.getLogger(ScoringService.class);

    public ScoringService(UserRepository users,
                          LeagueRepository leagues,
                          SeasonRepository seasons,
                          DrinkRepository drinks,
                          ServingFormatRepository servingFormats,
                          ConsumptionRepository consumptions,
                          ScoringStrategyResolver strategyResolver,
                          RankingPublisher rankingPublisher,
                          LeagueAccess leagueAccess,
                          NotificationService notificationService) {
        this.users = users;
        this.leagues = leagues;
        this.seasons = seasons;
        this.drinks = drinks;
        this.servingFormats = servingFormats;
        this.consumptions = consumptions;
        this.strategyResolver = strategyResolver;
        this.rankingPublisher = rankingPublisher;
        this.leagueAccess = leagueAccess;
        this.notificationService = notificationService;
    }

    @Transactional
    public ScoredConsumption register(RegisterConsumptionCommand cmd) {
        User user = users.findById(cmd.userId())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        if (!user.isAdult()) {
            throw new IllegalStateException("Solo usuarios mayores de edad pueden registrar consumos");
        }

        League league = leagues.findById(cmd.leagueId())
                .orElseThrow(() -> new NotFoundException("Liga no encontrada"));

        // The user can only register consumptions in leagues they belong to.
        leagueAccess.requireMember(league.getId(), user.getId());

        Season season = seasons.findByLeagueIdAndStatus(league.getId(), SeasonStatus.ACTIVE)
                .orElseThrow(() -> new IllegalStateException("La liga no tiene una temporada activa"));

        Drink drink = drinks.findById(cmd.drinkId())
                .orElseThrow(() -> new NotFoundException("Bebida no encontrada"));

        ServingFormat format = servingFormats.findById(cmd.servingFormatId())
                .orElseThrow(() -> new NotFoundException("Formato de servicio no encontrado"));

        // Snapshots inmutables del cálculo
        int volumeMl = cmd.volumeOverrideMl() != null
                ? cmd.volumeOverrideMl()
                : format.getDefaultVolumeMl();
        BigDecimal abv = drink.getAbv();
        BigDecimal quantity = cmd.quantity() != null ? cmd.quantity() : BigDecimal.ONE;

        // Cálculo puro mediante la estrategia configurada en la liga
        ScoringStrategy strategy = strategyResolver.resolve(league.getScoringMode());
        ScoringResult result = strategy.score(new ScoringInput(
                BigDecimal.valueOf(volumeMl),
                abv,
                quantity,
                league.getGramsPerUnit(),
                league.getScoreMultiplier()
        ));

        // Persistencia del hecho + su puntuación (misma transacción)
        Consumption consumption = Consumption.builder()
                .user(user)
                .season(season)
                .league(league)
                .drink(drink)
                .servingFormat(format)
                .quantity(quantity)
                .volumeMlSnapshot(volumeMl)
                .abvSnapshot(abv)
                .occurredAt(cmd.occurredAt() != null ? cmd.occurredAt() : Instant.now())
                .build();

        ConsumptionScore score = ConsumptionScore.builder()
                .consumption(consumption)
                .pureAlcoholGrams(result.pureAlcoholGrams())
                .points(result.points())
                .scoringMode(result.scoringMode())
                .scoringVersion(result.scoringVersion())
                .build();
        consumption.setScore(score);

        Consumption saved = consumptions.save(consumption);

        // Actualiza el ranking en vivo (no-op si no hay Redis)
        rankingPublisher.addPoints(season.getId(), user.getId(), result.points());

        // "Sorpasso" push notifications. Never let a notification failure break
        // the consumption itself.
        try {
            notificationService.notifyOvertakes(
                    user.getId(), user.getDisplayName(), league.getId(), season.getId(),
                    result.points(), drink.getName());
        } catch (Exception ex) {
            log.warn("Could not evaluate overtake notifications: {}", ex.toString());
        }

        return new ScoredConsumption(saved.getId(), result);
    }

    /** Resultado del caso de uso. */
    public record ScoredConsumption(UUID consumptionId, ScoringResult result) {}

    /** Excepción de dominio para recursos no encontrados (mapea a 404). */
    public static class NotFoundException extends RuntimeException {
        public NotFoundException(String message) {
            super(message);
        }
    }
}
