package com.whosdrunk.catalog;

import com.whosdrunk.api.dto.DrinkSearchResult;
import com.whosdrunk.common.error.AppException;
import com.whosdrunk.domain.catalog.Drink;
import com.whosdrunk.domain.catalog.DrinkBrand;
import com.whosdrunk.domain.catalog.DrinkType;
import com.whosdrunk.repository.DrinkBrandRepository;
import com.whosdrunk.repository.DrinkRepository;
import com.whosdrunk.repository.DrinkTypeRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Orchestrates drink search across the local catalog and Open Food Facts.
 *
 * <ul>
 *   <li>Text query → searches local drinks by name/brand; falls back to the
 *       seeded generics when there are no matches.</li>
 *   <li>Barcode query → reuses a previously stored product, otherwise resolves
 *       the ABV via {@link AbvResolver}/{@link OpenFoodFactsClient}, persists a
 *       new {@link Drink} (+ brand) and returns it.</li>
 * </ul>
 */
@Service
public class DrinkCatalogService {

    private static final int MAX_TEXT_RESULTS = 10;
    private static final String UNKNOWN_TYPE_CODE = "OTHER";

    private final DrinkRepository drinks;
    private final DrinkBrandRepository drinkBrands;
    private final DrinkTypeRepository drinkTypes;
    private final AbvResolver abvResolver;

    public DrinkCatalogService(DrinkRepository drinks,
                               DrinkBrandRepository drinkBrands,
                               DrinkTypeRepository drinkTypes,
                               AbvResolver abvResolver) {
        this.drinks = drinks;
        this.drinkBrands = drinkBrands;
        this.drinkTypes = drinkTypes;
        this.abvResolver = abvResolver;
    }

    @Transactional
    public List<DrinkSearchResult> search(String rawQuery) {
        String query = rawQuery == null ? "" : rawQuery.trim();
        if (query.length() < 2) {
            return List.of();
        }

        // De-dup by drink id while preserving insertion order.
        Map<UUID, Drink> ordered = new LinkedHashMap<>();

        if (isBarcode(query)) {
            resolveByBarcode(query).ifPresent(d -> ordered.put(d.getId(), d));
        }

        drinks.searchByText(query, PageRequest.of(0, MAX_TEXT_RESULTS))
                .forEach(d -> ordered.put(d.getId(), d));

        // Nothing matched a real product → offer the generic fallbacks.
        if (ordered.isEmpty()) {
            drinks.findByAbvSourceOrderByName("DEFAULT")
                    .forEach(d -> ordered.put(d.getId(), d));
        }

        return ordered.values().stream().map(DrinkSearchResult::of).toList();
    }

    /** Detects EAN/UPC-style barcodes (8–14 digits). */
    private boolean isBarcode(String query) {
        return query.matches("\\d{8,14}");
    }

    private Optional<Drink> resolveByBarcode(String barcode) {
        // 1) Already stored under this barcode? Reuse it.
        Optional<DrinkBrand> existingBrand = drinkBrands.findByBarcode(barcode);
        if (existingBrand.isPresent()) {
            Optional<Drink> existingDrink = drinks.findFirstByBrandId(existingBrand.get().getId());
            if (existingDrink.isPresent()) {
                return existingDrink;
            }
        }

        // 2) Resolve via Open Food Facts (or default fallback) and persist.
        DrinkType type = drinkTypes.findByCode(UNKNOWN_TYPE_CODE)
                .orElseThrow(() -> AppException.unprocessable("Missing base drink type: " + UNKNOWN_TYPE_CODE));
        AbvResolver.ResolvedAbv resolved = abvResolver.resolveByBarcode(barcode, type);

        String displayName = resolved.brandName() != null && !resolved.brandName().isBlank()
                ? resolved.brandName()
                : "Product " + barcode;

        DrinkBrand brand = existingBrand.orElseGet(() -> drinkBrands.save(
                DrinkBrand.builder()
                        .name(displayName)
                        .drinkType(type)
                        .source(resolved.source())
                        .barcode(barcode)
                        .build()));

        Drink drink = drinks.save(Drink.builder()
                .brand(brand)
                .drinkType(type)
                .name(displayName)
                .abv(resolved.abv())
                .abvSource(resolved.source())
                .abvConfidence(resolved.confidence())
                .build());

        return Optional.of(drink);
    }
}
