package com.whosdrunk.notification;

import com.whosdrunk.repository.ConsumptionRepository;
import com.whosdrunk.repository.LeaderboardRow;
import com.whosdrunk.repository.UserDeviceTokenRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Detects "sorpasso" events: when a freshly logged consumption pushes a user
 * above one or more rivals in the season ranking, the overtaken users get a
 * push notification.
 */
@Service
public class NotificationService {

    private final ConsumptionRepository consumptions;
    private final UserDeviceTokenRepository deviceTokens;
    private final ExpoPushClient expoPushClient;

    public NotificationService(ConsumptionRepository consumptions,
                               UserDeviceTokenRepository deviceTokens,
                               ExpoPushClient expoPushClient) {
        this.consumptions = consumptions;
        this.deviceTokens = deviceTokens;
        this.expoPushClient = expoPushClient;
    }

    /**
     * @param actorUserId who just logged a drink
     * @param actorName   their display name (for the copy)
     * @param seasonId    season being scored
     * @param pointsAdded points the new consumption added
     * @param drinkName   the drink logged (for the copy)
     */
    public void notifyOvertakes(UUID actorUserId,
                                String actorName,
                                UUID seasonId,
                                BigDecimal pointsAdded,
                                String drinkName) {
        if (pointsAdded == null || pointsAdded.signum() <= 0) {
            return; // a 0-point drink can't overtake anyone
        }

        List<LeaderboardRow> rows = consumptions.leaderboard(seasonId);

        BigDecimal newTotal = rows.stream()
                .filter(r -> r.getUserId().equals(actorUserId))
                .map(LeaderboardRow::getTotalPoints)
                .findFirst()
                .orElse(null);
        if (newTotal == null) {
            return;
        }
        BigDecimal oldTotal = newTotal.subtract(pointsAdded);

        // Overtaken: rivals whose total is in [oldTotal, newTotal) — i.e. the
        // actor was at or below them before and is now strictly above.
        List<LeaderboardRow> overtaken = rows.stream()
                .filter(r -> !r.getUserId().equals(actorUserId))
                .filter(r -> r.getTotalPoints().compareTo(oldTotal) >= 0
                        && r.getTotalPoints().compareTo(newTotal) < 0)
                .toList();
        if (overtaken.isEmpty()) {
            return;
        }

        String title = "Sorpasso! 🏎️";
        String body = String.format("%s just stole your spot with a %s! 🍻", actorName, drinkName);
        Map<String, Object> data = Map.of(
                "type", "OVERTAKE",
                "seasonId", seasonId.toString(),
                "byUserId", actorUserId.toString());

        List<ExpoPushMessage> messages = new ArrayList<>();
        for (LeaderboardRow rival : overtaken) {
            for (String token : deviceTokens.findTokensByUserId(rival.getUserId())) {
                messages.add(ExpoPushMessage.of(token, title, body, data));
            }
        }

        expoPushClient.send(messages);
    }
}
