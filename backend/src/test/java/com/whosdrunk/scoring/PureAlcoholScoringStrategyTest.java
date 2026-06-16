package com.whosdrunk.scoring;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PureAlcoholScoringStrategyTest {

    private final PureAlcoholScoringStrategy strategy = new PureAlcoholScoringStrategy();

    private ScoringInput input(String volumeMl, String abv, String qty) {
        return new ScoringInput(
                new BigDecimal(volumeMl),
                new BigDecimal(abv),
                new BigDecimal(qty),
                new BigDecimal("10.00"),  // UBE = 10 g
                BigDecimal.ONE);          // multiplicador 1.0
    }

    @Test
    @DisplayName("Caña (200 ml, 5%) = 7.890 g de alcohol puro y 0.79 puntos")
    void cana() {
        ScoringResult r = strategy.score(input("200", "5", "1"));
        assertEquals(new BigDecimal("7.890"), r.pureAlcoholGrams());
        assertEquals(new BigDecimal("0.79"), r.points());
    }

    @Test
    @DisplayName("Tercio (330 ml, 5%) = 13.019 g y 1.30 puntos")
    void tercio() {
        ScoringResult r = strategy.score(input("330", "5", "1"));
        assertEquals(new BigDecimal("13.019"), r.pureAlcoholGrams());
        assertEquals(new BigDecimal("1.30"), r.points());
    }

    @Test
    @DisplayName("Chupito (40 ml, 40%) = 12.624 g y 1.26 puntos")
    void chupito() {
        ScoringResult r = strategy.score(input("40", "40", "1"));
        assertEquals(new BigDecimal("12.624"), r.pureAlcoholGrams());
        assertEquals(new BigDecimal("1.26"), r.points());
    }

    @Test
    @DisplayName("La cantidad multiplica linealmente (2 copas de vino 150 ml, 12.5%)")
    void cantidad() {
        ScoringResult r = strategy.score(input("150", "12.5", "2"));
        // 150*0.125*0.789 = 14.79375 -> 14.794 g por copa; x2 = 29.588 g
        assertEquals(new BigDecimal("29.588"), r.pureAlcoholGrams());
        assertEquals(new BigDecimal("2.96"), r.points());
    }
}
