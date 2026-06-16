package com.whosdrunk.repository;

import com.whosdrunk.domain.catalog.ServingFormat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServingFormatRepository extends JpaRepository<ServingFormat, Short> {
}
