package com.whosdrunk.api.dto;

import com.whosdrunk.domain.catalog.Drink;

import java.math.BigDecimal;
import java.util.UUID;

/** Catalog search result. Each entry already carries a usable {@code drinkId}. */
public record DrinkSearchResult(
        UUID drinkId,
        String name,
        String brandName,
        String drinkType,
        BigDecimal abv,
        String abvSource
) {
    public static DrinkSearchResult of(Drink d) {
        return new DrinkSearchResult(
                d.getId(),
                d.getName(),
                d.getBrand() != null ? d.getBrand().getName() : null,
                d.getDrinkType().getCode(),
                d.getAbv(),
                d.getAbvSource());
    }
}
