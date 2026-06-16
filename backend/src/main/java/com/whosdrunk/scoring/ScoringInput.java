package com.whosdrunk.scoring;

import java.math.BigDecimal;

/**
 * Value object inmutable con todo lo necesario para puntuar un consumo.
 * No tiene dependencias de JPA: el motor es puro y testeable de forma aislada.
 *
 * @param volumeMl       volumen de UNA unidad del formato (ml)
 * @param abv            graduación alcohólica (% vol)
 * @param quantity       número de unidades consumidas
 * @param gramsPerUnit   gramos de alcohol puro por punto base (UBE = 10 g)
 * @param multiplier     multiplicador configurable de la liga
 */
public record ScoringInput(
        BigDecimal volumeMl,
        BigDecimal abv,
        BigDecimal quantity,
        BigDecimal gramsPerUnit,
        BigDecimal multiplier
) {
    public ScoringInput {
        require(volumeMl, "volumeMl");
        require(abv, "abv");
        require(quantity, "quantity");
        require(gramsPerUnit, "gramsPerUnit");
        require(multiplier, "multiplier");
        if (gramsPerUnit.signum() <= 0) {
            throw new IllegalArgumentException("gramsPerUnit debe ser > 0");
        }
    }

    private static void require(BigDecimal v, String name) {
        if (v == null || v.signum() < 0) {
            throw new IllegalArgumentException(name + " no puede ser nulo ni negativo");
        }
    }
}
