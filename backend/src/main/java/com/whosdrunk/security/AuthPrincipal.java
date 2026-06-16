package com.whosdrunk.security;

import java.util.UUID;

/**
 * Principal autenticado que se inyecta en el SecurityContext y se expone a los
 * controladores vía {@code @AuthenticationPrincipal}.
 */
public record AuthPrincipal(UUID userId, String email) {
}
