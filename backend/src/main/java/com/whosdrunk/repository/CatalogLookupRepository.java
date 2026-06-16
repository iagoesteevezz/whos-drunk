package com.whosdrunk.repository;

import com.whosdrunk.domain.catalog.CatalogLookup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CatalogLookupRepository extends JpaRepository<CatalogLookup, UUID> {
    Optional<CatalogLookup> findBySourceAndLookupKey(String source, String lookupKey);
}
