package com.whosdrunk.catalog;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * Resultado de resolver el ABV de un producto desde una fuente externa.
 *
 * @param brandName nombre normalizado de la marca/producto, si se obtuvo
 * @param abv       graduación (% vol), si se obtuvo
 * @param source    fuente del dato (OPENFOODFACTS, COCKTAILDB...)
 */
public record AbvLookupResult(
        Optional<String> brandName,
        Optional<BigDecimal> abv,
        String source
) {
    public static AbvLookupResult notFound(String source) {
        return new AbvLookupResult(Optional.empty(), Optional.empty(), source);
    }

    public boolean hasAbv() {
        return abv.isPresent();
    }
}
