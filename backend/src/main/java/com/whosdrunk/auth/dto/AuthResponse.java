package com.whosdrunk.auth.dto;

import java.util.UUID;

/** Respuesta de autenticación con el par de tokens. */
public record AuthResponse(
        UUID userId,
        String displayName,
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresInSeconds
) {}
