package com.whosdrunk.scoring;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Estrategia por defecto: puntúa según los gramos de alcohol puro consumidos.
 *
 * <pre>
 *   gramos_alcohol_puro = volumen_ml * (abv / 100) * 0.789 * cantidad
 *   puntos              = (gramos / gramos_por_unidad) * multiplicador
 * </pre>
 *
 * 0.789 g/ml = densidad del etanol a 20 °C (base de la "unidad de bebida estándar").
 */
@Component
public class PureAlcoholScoringStrategy implements ScoringStrategy {

    public static final String MODE = "PURE_ALCOHOL";
    private static final int VERSION = 1;

    /** Densidad del etanol (g/ml). */
    private static final BigDecimal ETHANOL_DENSITY = new BigDecimal("0.789");
    private static final BigDecimal HUNDRED = new BigDecimal("100");

    @Override
    public String mode() {
        return MODE;
    }

    @Override
    public int version() {
        return VERSION;
    }

    @Override
    public ScoringResult score(ScoringInput in) {
        // gramos de alcohol puro
        BigDecimal pureAlcoholGrams = in.volumeMl()
                .multiply(in.abv()).divide(HUNDRED, 10, RoundingMode.HALF_UP)
                .multiply(ETHANOL_DENSITY)
                .multiply(in.quantity())
                .setScale(3, RoundingMode.HALF_UP);

        // puntos
        BigDecimal points = pureAlcoholGrams
                .divide(in.gramsPerUnit(), 10, RoundingMode.HALF_UP)
                .multiply(in.multiplier())
                .setScale(2, RoundingMode.HALF_UP);

        return new ScoringResult(pureAlcoholGrams, points, MODE, VERSION);
    }
}
