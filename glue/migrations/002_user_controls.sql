-- ============================================================
-- Carbon Sentinel: User Control Tables
-- Migration 002 — run in Supabase Dashboard SQL editor
-- ============================================================

-- User/agent configuration table
-- One row per user. Controls the AI agent's autonomy level.
CREATE TABLE IF NOT EXISTS agent_config (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             TEXT        NOT NULL UNIQUE,   -- wallet address or auth UID

    -- Budget / spend controls
    budget_usd          FLOAT       NOT NULL DEFAULT 50.0,   -- total spend cap (USD)
    max_tx_usd          FLOAT       NOT NULL DEFAULT 5.0,    -- max spend per transaction
    spent_usd           FLOAT       NOT NULL DEFAULT 0.0,    -- cumulative amount spent

    -- Agent state
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,   -- master kill-switch
    auto_execute        BOOLEAN     NOT NULL DEFAULT TRUE,   -- allow autonomous txs
    spectatorless_mode  BOOLEAN     NOT NULL DEFAULT FALSE,  -- skip fan-travel Scope 3

    -- Notes / display
    display_name        TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_agent_config_user_id
    ON agent_config (user_id);

-- ── Force Buy table ───────────────────────────────────────────────────────────
-- Records manual/forced purchases triggered by the user from the dashboard.
CREATE TABLE IF NOT EXISTS force_buys (
    id              BIGSERIAL PRIMARY KEY,
    user_id         TEXT        NOT NULL,
    amount_usd      FLOAT       NOT NULL,              -- requested spend
    match_id        TEXT,                              -- optional context
    status          TEXT        NOT NULL DEFAULT 'pending',
                                                       -- pending | executed | failed
    tx_hash         TEXT,                              -- filled after execution
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    executed_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_force_buys_user_id
    ON force_buys (user_id);

CREATE INDEX IF NOT EXISTS idx_force_buys_status
    ON force_buys (status);

-- ── Also add user_id column to offset_ledger if it's missing ─────────────────
ALTER TABLE offset_ledger
    ADD COLUMN IF NOT EXISTS user_id TEXT;

ALTER TABLE offset_ledger
    ADD COLUMN IF NOT EXISTS force_buy_id BIGINT REFERENCES force_buys(id);

-- ── Helper view: total carbon offset purchased per user ───────────────────────
CREATE OR REPLACE VIEW total_offsets_view AS
SELECT
    COALESCE(user_id, 'system') AS user_id,
    COUNT(*)                    AS total_transactions,
    SUM(footprint_kg)           AS total_footprint_kg_offset,
    SUM(amount_usd)             AS total_spent_usd,
    MAX(confirmed_at)           AS last_purchase_at
FROM offset_ledger
WHERE status = 'success'
GROUP BY user_id;

-- ── Aggregate view: global platform stats ────────────────────────────────────
CREATE OR REPLACE VIEW platform_stats_view AS
SELECT
    COUNT(*)                    AS total_transactions,
    SUM(footprint_kg)           AS total_kg_offset,
    SUM(amount_usd)             AS total_spent_usd,
    COUNT(DISTINCT user_id)     AS active_users,
    MAX(confirmed_at)           AS last_purchase_at
FROM offset_ledger
WHERE status = 'success';

-- ============================================================
-- Verify:
-- SELECT * FROM total_offsets_view;
-- SELECT * FROM platform_stats_view;
-- ============================================================
