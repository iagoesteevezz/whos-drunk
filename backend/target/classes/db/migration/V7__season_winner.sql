-- =====================================================================
-- V7: Settle the winner when a season closes
-- =====================================================================

ALTER TABLE seasons ADD COLUMN winner_user_id UUID REFERENCES users(id);
ALTER TABLE seasons ADD COLUMN winner_points  NUMERIC(8,2);
