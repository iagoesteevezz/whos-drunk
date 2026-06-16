package com.whosdrunk.repository;

import com.whosdrunk.domain.catalog.Drink;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DrinkRepository extends JpaRepository<Drink, UUID> {

    /** Full-text-ish search over the drink name and its brand name. */
    @Query("""
            SELECT d FROM Drink d
            LEFT JOIN d.brand b
            WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(b.name) LIKE LOWER(CONCAT('%', :q, '%'))
            ORDER BY d.name ASC
            """)
    List<Drink> searchByText(@Param("q") String q, Pageable pageable);

    /** Generic fallbacks (seeded with abv_source = 'DEFAULT'). */
    List<Drink> findByAbvSourceOrderByName(String abvSource);

    /** First drink already linked to a given brand (barcode hit reuse). */
    Optional<Drink> findFirstByBrandId(UUID brandId);
}
