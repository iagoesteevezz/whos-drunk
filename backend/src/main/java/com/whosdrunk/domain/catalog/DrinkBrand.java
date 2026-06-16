package com.whosdrunk.domain.catalog;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "drink_brands")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DrinkBrand {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "drink_type_id")
    private DrinkType drinkType;

    /** Origen del dato: MANUAL | OPENFOODFACTS | COCKTAILDB. */
    @Column(nullable = false)
    @Builder.Default
    private String source = "MANUAL";

    @Column(name = "source_ref")
    private String sourceRef;

    /** EAN/UPC para escaneo de código de barras. */
    private String barcode;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
