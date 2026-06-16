package com.whosdrunk.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Background processing: {@code @Async} (off-request push delivery) and
 * {@code @Scheduled} (monthly season rollover).
 */
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {
}
