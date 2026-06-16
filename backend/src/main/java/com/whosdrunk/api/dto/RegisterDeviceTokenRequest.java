package com.whosdrunk.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Registers an Expo push token for the authenticated user.
 */
public record RegisterDeviceTokenRequest(
        @NotBlank String token,
        @Pattern(regexp = "ios|android|unknown", message = "platform must be ios, android or unknown")
        String platform
) {
    public String platformOrDefault() {
        return platform == null || platform.isBlank() ? "unknown" : platform;
    }
}
