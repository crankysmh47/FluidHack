"""
TX Log — Local Transaction Hash Ledger
Every on-chain transaction hash is appended to `tx_hashes.jsonl` (local disk)
and optionally mirrored to Supabase `tx_log` table.

This ensures you always have a local record of every tx hash for submission,
even when Supabase is temporarily unavailable.
"""
from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────
# Stored in the project root (or wherever this script lives)
_GLUE_DIR = Path(os.path.dirname(os.path.abspath(__file__)))
_PROJECT_ROOT = _GLUE_DIR.parent
TX_LOG_PATH = _PROJECT_ROOT / "tx_hashes.jsonl"


# ── Core helpers ──────────────────────────────────────────────────────────────

def append_tx(
    tx_hash: str,
    match_id: str = None,
    user_id: str = None,
    footprint_kg: float = None,
    amount_usd: float = None,
    token_symbol: str = None,
    dest_chain: str = None,
    status: str = "success",
    source: str = "agent",
    preimage_index: int = None,
    explorer_url: str = None,
    extra: dict = None,
) -> dict:
    """
    Append a transaction record to tx_hashes.jsonl (JSONL format — one JSON per line).
    Also mirrors the record to Supabase `tx_log` table.

    Args:
        tx_hash:        0x-prefixed EVM tx hash
        match_id:       Carbon Sentinel match identifier
        user_id:        User wallet address or auth UID
        footprint_kg:   CO2 footprint offset (kg)
        amount_usd:     USD spent on carbon credits
        token_symbol:   e.g. "BCT", "NCT"
        dest_chain:     e.g. "Polygon"
        status:         "success" | "failed" | "pending"
        source:         "agent" | "force_buy"
        preimage_index: Index in hash_chain.json
        explorer_url:   Full block explorer URL
        extra:          Any extra metadata

    Returns:
        The record dict that was written.
    """
    record = {
        "tx_hash": tx_hash,
        "match_id": match_id,
        "user_id": user_id,
        "footprint_kg": footprint_kg,
        "amount_usd": amount_usd,
        "token_symbol": token_symbol,
        "dest_chain": dest_chain,
        "status": status,
        "source": source,
        "preimage_index": preimage_index,
        "explorer_url": explorer_url or (f"https://wirefluidscan.com/tx/{tx_hash}" if tx_hash else None),
        "logged_at": datetime.now(timezone.utc).isoformat(),
    }
    if extra:
        record["extra"] = extra

    # ── Write to local JSONL ─────────────────────────────────────────────────
    try:
        with open(TX_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")
        print(f"[TXLog] 📁 Appended to {TX_LOG_PATH.name}: {tx_hash}")
    except OSError as e:
        print(f"[TXLog] ⚠️  Could not write to {TX_LOG_PATH}: {e}")

    # ── Mirror to Supabase tx_log ─────────────────────────────────────────────
    _mirror_to_supabase(record)

    return record


def _mirror_to_supabase(record: dict):
    """Best-effort mirror to Supabase tx_log. Never raises."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
    if not url or not key:
        return
    try:
        from supabase import create_client
        sb = create_client(url, key)
        # Remove None values so Supabase doesn't complain
        row = {k: v for k, v in record.items() if v is not None and k != "extra"}
        sb.table("tx_log").upsert(row, on_conflict="tx_hash").execute()
        print(f"[TXLog] ☁️  Mirrored to Supabase tx_log")
    except Exception as e:
        print(f"[TXLog] ⚠️  Supabase mirror failed (local record safe): {e}")


# ── Read helpers ──────────────────────────────────────────────────────────────

def read_all_txs() -> list[dict]:
    """Read all records from the local tx_hashes.jsonl file."""
    if not TX_LOG_PATH.exists():
        return []
    records = []
    with open(TX_LOG_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    return records


def get_total_stats() -> dict:
    """Compute aggregate stats from the local JSONL log."""
    records = read_all_txs()
    successful = [r for r in records if r.get("status") == "success"]
    return {
        "total_txs": len(records),
        "successful_txs": len(successful),
        "total_footprint_kg_offset": round(
            sum(r.get("footprint_kg") or 0 for r in successful), 2
        ),
        "total_spent_usd": round(
            sum(r.get("amount_usd") or 0 for r in successful), 6
        ),
        "tx_hashes": [r["tx_hash"] for r in records if r.get("tx_hash")],
    }


def get_hashes_only() -> list[str]:
    """Quick access to just the list of tx hashes (for submission)."""
    return [r["tx_hash"] for r in read_all_txs() if r.get("tx_hash")]


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="TX Log CLI")
    parser.add_argument("--list", action="store_true", help="Print all tx hashes")
    parser.add_argument("--stats", action="store_true", help="Print aggregate stats")
    args = parser.parse_args()

    if args.list:
        hashes = get_hashes_only()
        print(f"Total tx hashes: {len(hashes)}")
        for h in hashes:
            print(f"  {h}")
    elif args.stats:
        import pprint
        pprint.pprint(get_total_stats())
    else:
        parser.print_help()
