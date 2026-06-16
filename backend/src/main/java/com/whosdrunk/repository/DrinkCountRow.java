package com.whosdrunk.repository;

import java.util.UUID;

/** Projection: a drink and how many times it was logged. */
public interface DrinkCountRow {
    UUID getDrinkId();
    String getDrinkName();
    String getBrandName();
    long getTotal();
}
