package com.whosdrunk.domain.catalog;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "serving_formats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServingFormat {

    @Id
    private Short id;

    @Column(nullable = false, unique = true)
    private String code;   // CANA, JARRA, TERCIO, COPA_VINO, CHUPITO...

    @Column(nullable = false)
    private String label;

    /** Volumen de referencia en mililitros para este formato. */
    @Column(name = "default_volume_ml", nullable = false)
    private Integer defaultVolumeMl;

    @Column(name = "typical_drink_type_id")
    private Short typicalDrinkTypeId;
}
