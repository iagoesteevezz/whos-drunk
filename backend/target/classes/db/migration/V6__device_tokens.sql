-- =====================================================================
-- V6: Push notification device tokens (Expo)
-- =====================================================================

CREATE TABLE user_device_tokens (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token         VARCHAR(255) NOT NULL UNIQUE,           -- ExpoPushToken[...]
    platform      VARCHAR(10)  NOT NULL DEFAULT 'unknown', -- ios | android | unknown
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    last_seen_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_device_tokens_user ON user_device_tokens(user_id);
