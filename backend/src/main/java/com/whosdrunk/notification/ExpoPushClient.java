package com.whosdrunk.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;

/**
 * Sends messages to the Expo Push API (https://exp.host/--/api/v2/push/send).
 *
 * <p>Runs asynchronously so the consumption request never waits on Expo, and
 * swallows failures: a push problem must never break drink logging.
 */
@Component
public class ExpoPushClient {

    private static final Logger log = LoggerFactory.getLogger(ExpoPushClient.class);
    private static final String PUSH_URL = "https://exp.host/--/api/v2/push/send";

    private final WebClient webClient;

    public ExpoPushClient() {
        this.webClient = WebClient.builder()
                .baseUrl(PUSH_URL)
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Accept", "application/json")
                .build();
    }

    @Async
    public void send(List<ExpoPushMessage> messages) {
        if (messages == null || messages.isEmpty()) {
            return;
        }
        try {
            // Expo accepts a JSON array of messages in a single request.
            webClient.post()
                    .bodyValue(messages)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(5));
            log.debug("Sent {} push message(s) to Expo", messages.size());
        } catch (Exception ex) {
            log.warn("Failed to deliver push notifications to Expo: {}", ex.toString());
        }
    }
}
