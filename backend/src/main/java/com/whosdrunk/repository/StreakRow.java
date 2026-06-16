package com.whosdrunk.repository;

import java.time.Instant;
import java.util.UUID;

/** Projection: one consumption instant for a user (for streak computation). */
public interface StreakRow {
    UUID getUserId();
    Instant getOccurredAt();
}
