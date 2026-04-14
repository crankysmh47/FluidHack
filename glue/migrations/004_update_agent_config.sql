-- ============================================================
-- Carbon Sentinel: Agent Config Update
-- Migration 004 — run in Supabase Dashboard SQL editor
-- Adds missing session control columns to agent_config
-- ============================================================

ALTER TABLE agent_config
    ADD COLUMN IF NOT EXISTS authorized_tx_count INTEGER NOT NULL DEFAULT 50,
    ADD COLUMN IF NOT EXISTS tx_count INTEGER NOT NULL DEFAULT 0;

-- Optional: Update existing rows to have the defaults if they were NULL
-- (Shouldn't be needed with NOT NULL DEFAULT, but good practice if adding to existing table)
UPDATE agent_config SET authorized_tx_count = 50 WHERE authorized_tx_count IS NULL;
UPDATE agent_config SET tx_count = 0 WHERE tx_count IS NULL;
