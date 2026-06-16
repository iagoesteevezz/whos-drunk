package com.whosdrunk.domain.catalog;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "drinks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Drink {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private DrinkBrand brand;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "drink_type_id")
    private DrinkType drinkType;

    @Column(nullable = false)
    private String name;

    /** Graduación alcohólica (% vol). */
    @Column(nullable = false)
    private BigDecimal abv;

    /** MANUAL | OPENFOODFACTS | COCKTAILDB | DEFAULT */
    @Column(name = "abv_source", nullable = false)
    @Builder.Default
    private String abvSource = "DEFAULT";

    /** HIGH | MEDIUM | LOW */
    @Column(name = "abv_confidence", nullable = false)
    @Builder.Default
    private String abvConfidence = "LOW";

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
