package com.whosdrunk.catalog;

import com.fasterxml.jackson.databind.JsonNode;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Optional;

/**
 * Cliente de Open Food Facts. Busca un producto por código de barras y extrae
 * marca y ABV (% vol) del campo {@code nutriments.alcohol_value}.
 *
 * <p>Resiliencia: protegido por circuit breaker; si OFF cae, devuelve
 * {@code notFound} y el AbvResolver hace fallback a defaults.
 */
@Component
public class OpenFoodFactsClient {

    private static final Logger log = LoggerFactory.getLogger(OpenFoodFactsClient.class);
    public static final String SOURCE = "OPENFOODFACTS";

    private final WebClient webClient;
    private final long timeoutMs;

    public OpenFoodFactsClient(
            @Value("${catalog.openfoodfacts.base-url}") String baseUrl,
            @Value("${catalog.openfoodfacts.user-agent}") String userAgent,
            @Value("${catalog.openfoodfacts.timeout-ms}") long timeoutMs) {
        this.timeoutMs = timeoutMs;
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("User-Agent", userAgent) // requerido por OFF
                .build();
    }

    @CircuitBreaker(name = "openfoodfacts", fallbackMethod = "fallback")
    public AbvLookupResult findByBarcode(String barcode) {
        JsonNode root = webClient.get()
                .uri("/api/v2/product/{code}.json?fields=product_name,brands,nutriments", barcode)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block(Duration.ofMillis(timeoutMs));

        if (root == null || root.path("status").asInt(0) != 1) {
            return AbvLookupResult.notFound(SOURCE);
        }

        JsonNode product = root.path("product");
        Optional<String> brand = text(product, "brands").or(() -> text(product, "product_name"));

        // OFF expone el grado en nutriments.alcohol_value (unidad "% vol")
        JsonNode nutriments = product.path("nutriments");
        Optional<BigDecimal> abv = number(nutriments, "alcohol_value")
                .or(() -> number(nutriments, "alcohol_100g"));

        return new AbvLookupResult(brand, abv, SOURCE);
    }

    @SuppressWarnings("unused")
    private AbvLookupResult fallback(String barcode, Throwable ex) {
        log.warn("OpenFoodFacts no disponible para {}: {}", barcode, ex.toString());
        return AbvLookupResult.notFound(SOURCE);
    }

    private static Optional<String> text(JsonNode node, String field) {
        JsonNode v = node.path(field);
        return v.isTextual() && !v.asText().isBlank() ? Optional.of(v.asText()) : Optional.empty();
    }

    private static Optional<BigDecimal> number(JsonNode node, String field) {
        JsonNode v = node.path(field);
        if (v.isNumber()) return Optional.of(v.decimalValue());
        if (v.isTextual()) {
            try {
                return Optional.of(new BigDecimal(v.asText().trim()));
            } catch (NumberFormatException ignored) {
                return Optional.empty();
            }
        }
        return Optional.empty();
    }
}
