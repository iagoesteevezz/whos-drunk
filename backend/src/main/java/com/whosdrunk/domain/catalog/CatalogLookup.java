package com.whosdrunk.domain.catalog;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

/** Caché persistente de una llamada a una API externa (anti-saturación). */
@Entity
@Table(name = "catalog_lookups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatalogLookup {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String source;          // OPENFOODFACTS | COCKTAILDB

    @Column(name = "lookup_key", nullable = false)
    private String lookupKey;       // barcode o "nombre|marca" normalizado

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String payload;

    @Column(nullable = false)
    private boolean found;

    @Column(name = "fetched_at", nullable = false)
    @Builder.Default
    private Instant fetchedAt = Instant.now();

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    public boolean isFresh(Instant now) {
        return now.isBefore(expiresAt);
    }
}
