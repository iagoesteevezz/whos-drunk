package com.whosdrunk.notification;

import java.util.Map;

/**
 * A single message for the Expo push API. Field names map directly to the
 * Expo payload (`to`, `title`, `body`, `data`, `sound`).
 */
public record ExpoPushMessage(
        String to,
        String title,
        String body,
        Map<String, Object> data,
        String sound
) {
    public static ExpoPushMessage of(String to, String title, String body, Map<String, Object> data) {
        return new ExpoPushMessage(to, title, body, data, "default");
    }
}
