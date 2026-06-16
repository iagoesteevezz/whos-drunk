package com.whosdrunk.catalog;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.whosdrunk.domain.catalog.CatalogLookup;
import com.whosdrunk.domain.catalog.DrinkType;
import com.whosdrunk.repository.CatalogLookupRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

/**
 * Resuelve el ABV de un producto con una cascada cache-aware para no saturar
 * las APIs externas:
 *
 * <pre>
 *   1. caché local (catalog_lookups) vigente
 *   2. Open Food Facts (por código de barras)
 *   3. fallback: ABV por defecto del tipo de bebida (confianza LOW)
 * </pre>
 */
@Service
public class AbvResolver {

    private final CatalogLookupRepository lookups;
    private final OpenFoodFactsClient openFoodFacts;
    private final ObjectMapper objectMapper;
    private final Duration ttl;

    public AbvResolver(CatalogLookupRepository lookups,
                       OpenFoodFactsClient openFoodFacts,
                       ObjectMapper objectMapper,
                       @Value("${catalog.cache-ttl-days}") long ttlDays) {
        this.lookups = lookups;
        this.openFoodFacts = openFoodFacts;
        this.objectMapper = objectMapper;
        this.ttl = Duration.ofDays(ttlDays);
    }

    /**
     * @param barcode   EAN/UPC del producto (puede ser null)
     * @param drinkType tipo, usado para el fallback por defecto
     * @return ABV resuelto con su fuente
     */
    @Transactional
    public ResolvedAbv resolveByBarcode(String barcode, DrinkType drinkType) {
        if (barcode == null || barcode.isBlank()) {
            return fallback(drinkType);
        }

        // 1. caché vigente
        Optional<CatalogLookup> cached =
                lookups.findBySourceAndLookupKey(OpenFoodFactsClient.SOURCE, barcode);
        if (cached.isPresent() && cached.get().isFresh(Instant.now())) {
            return cached.get().isFound()
                    ? cachedAbv(cached.get())
                            .map(abv -> new ResolvedAbv(abv, OpenFoodFactsClient.SOURCE, "HIGH", null))
                            .orElseGet(() -> fallback(drinkType))
                    : fallback(drinkType);
        }

        // 2. API externa + persistencia de la caché
        AbvLookupResult external = openFoodFacts.findByBarcode(barcode);
        persistLookup(barcode, external);
        if (external.hasAbv()) {
            return new ResolvedAbv(external.abv().orElseThrow(),
                    external.source(), "HIGH", external.brandName().orElse(null));
        }

        // 3. fallback por tipo
        return fallback(drinkType);
    }

    private ResolvedAbv fallback(DrinkType drinkType) {
        return new ResolvedAbv(drinkType.getDefaultAbv(), "DEFAULT", "LOW", null);
    }

    private Optional<BigDecimal> cachedAbv(CatalogLookup lookup) {
        try {
            JsonNode node = objectMapper.readTree(
                    lookup.getPayload() == null ? "{}" : lookup.getPayload());
            JsonNode abv = node.path("abv");
            return abv.isNumber() ? Optional.of(abv.decimalValue()) : Optional.empty();
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private void persistLookup(String barcode, AbvLookupResult result) {
        CatalogLookup entry = lookups
                .findBySourceAndLookupKey(OpenFoodFactsClient.SOURCE, barcode)
                .orElseGet(CatalogLookup::new);
        entry.setSource(OpenFoodFactsClient.SOURCE);
        entry.setLookupKey(barcode);
        entry.setFound(result.hasAbv());
        entry.setPayload(result.abv().map(a -> "{\"abv\":" + a + "}").orElse("{}"));
        entry.setFetchedAt(Instant.now());
        entry.setExpiresAt(Instant.now().plus(ttl));
        lookups.save(entry);
    }

    /** Resultado de la resolución de ABV. */
    public record ResolvedAbv(BigDecimal abv, String source, String confidence, String brandName) {}
}
