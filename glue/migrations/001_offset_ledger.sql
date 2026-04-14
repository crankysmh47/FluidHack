-- ============================================================
-- Carbon Sentinel: offset_ledger table
-- Run this SQL in your Supabase Dashboard:
--   https://pvzsecapudvdruloblly.supabase.co/project/default/sql
-- ============================================================

-- Permanent record of every carbon offset Carbon Sentinel purchases
CREATE TABLE IF NOT EXISTS offset_ledger (
    id              BIGSERIAL PRIMARY KEY,

    -- Decision info
    match_id        TEXT        NOT NULL,
    footprint_kg    FLOAT       NOT NULL,   -- kg CO2eq attributed to the stadium
    token_symbol    TEXT        NOT NULL,   -- e.g. "BCT", "NCT", "MCO2"
    token_address   TEXT        NOT NULL,   -- ERC-20 address on dest_chain
    dest_chain      TEXT        NOT NULL,   -- chain the credit lives on

    -- Purchase amounts
    amount_usd      FLOAT       NOT NULL,   -- USD value spent
    amount_usdc_wei TEXT        NOT NULL,   -- uint256 as string (USDC 6 decimals)

    -- On-chain proof
    tx_hash         TEXT,                   -- filled after broadcast
    status          TEXT        NOT NULL DEFAULT 'pending',
                                            -- pending | success | failed
    preimage_index  INT,                    -- which preimage was consumed

    -- Timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    confirmed_at    TIMESTAMPTZ             -- set when status = 'success'
);

-- Index for fast match lookups (useful for the dashboard/UI)
CREATE INDEX IF NOT EXISTS idx_offset_ledger_match_id
    ON offset_ledger (match_id);

CREATE INDEX IF NOT EXISTS idx_offset_ledger_status
    ON offset_ledger (status);

-- ── Also add amount_usd to the decisions table if it exists ──────────────────
ALTER TABLE decisions
    ADD COLUMN IF NOT EXISTS amount_usd FLOAT;

-- ============================================================
-- Verify tables exist:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public';
-- ============================================================
