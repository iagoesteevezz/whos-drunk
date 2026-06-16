package com.whosdrunk.api;

import com.whosdrunk.api.dto.DrinkSearchResult;
import com.whosdrunk.catalog.DrinkCatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/drinks")
public class DrinkController {

    private final DrinkCatalogService catalog;

    public DrinkController(DrinkCatalogService catalog) {
        this.catalog = catalog;
    }

    /**
     * Searches the catalog by free text or barcode. Unknown barcodes are
     * resolved against Open Food Facts, persisted, and returned with a usable
     * {@code drinkId}.
     */
    @GetMapping("/search")
    public List<DrinkSearchResult> search(@RequestParam("q") String query) {
        return catalog.search(query);
    }
}
