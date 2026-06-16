package com.whosdrunk.repository;

import com.whosdrunk.domain.catalog.DrinkBrand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DrinkBrandRepository extends JpaRepository<DrinkBrand, UUID> {
    Optional<DrinkBrand> findByBarcode(String barcode);
}
