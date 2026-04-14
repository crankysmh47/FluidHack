-- ============================================================
-- Carbon Sentinel: Local TX Log Mirror Table
-- Migration 003 — run in Supabase Dashboard SQL editor
-- ============================================================

-- Mirror of the local tx_hashes.jsonl file in Supabase.
-- Every transaction hash is stored here for submission evidence.
CREATE TABLE IF NOT EXISTS tx_log (
    id              BIGSERIAL PRIMARY KEY,
    tx_hash         TEXT        NOT NULL UNIQUE,
    match_id        TEXT,
    user_id         TEXT,
    footprint_kg    FLOAT,
    amount_usd      FLOAT,
    token_symbol    TEXT,
    dest_chain      TEXT,
    status          TEXT        DEFAULT 'success',
    source          TEXT        DEFAULT 'agent',       -- 'agent' | 'force_buy'
    preimage_index  INT,
    explorer_url    TEXT,
    logged_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tx_log_tx_hash
    ON tx_log (tx_hash);

CREATE INDEX IF NOT EXISTS idx_tx_log_user_id
    ON tx_log (user_id);

-- ============================================================
