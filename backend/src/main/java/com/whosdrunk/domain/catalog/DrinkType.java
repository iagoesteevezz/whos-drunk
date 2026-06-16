package com.whosdrunk.domain.catalog;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "drink_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DrinkType {

    @Id
    private Short id;

    @Column(nullable = false, unique = true)
    private String code;   // BEER, SPIRIT, WINE, CIDER, COCKTAIL, OTHER

    @Column(nullable = false)
    private String label;

    /** Graduación por defecto usada como último fallback. */
    @Column(name = "default_abv", nullable = false)
    private BigDecimal defaultAbv;
}
