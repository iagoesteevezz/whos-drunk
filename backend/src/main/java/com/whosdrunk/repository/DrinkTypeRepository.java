package com.whosdrunk.repository;

import com.whosdrunk.domain.catalog.DrinkType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DrinkTypeRepository extends JpaRepository<DrinkType, Short> {
    Optional<DrinkType> findByCode(String code);
}
