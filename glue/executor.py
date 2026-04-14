"""
Executor — End-to-End Carbon Offset Execution Orchestrator

Called by the Brain (agent.py) after a decision is finalized.
Performs the full autonomous execution loop:

  1. Pull next preimage from hash_chain.json (validated on-chain)
  2. Encode the WireFluid payload
  3. Call HashVault.execute() on WireFluid Testnet
  4. Log the result to the Supabase `offset_ledger` table

Usage (standalone test):
  python executor.py
"""

import os
import sys
import json
from datetime import datetime, timezone

from dotenv import load_dotenv

# Allow running from project root or glue/ directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv(override=True)


def run_execution(decision: dict, user_id: str = "system") -> dict:
    """
    Execute a carbon offset decision autonomously.

    Args:
        decision: Full decision dict from CarbonSentinelAgent._build_decision()
                  Must include: match_id, calculated_footprint_kg, target_token,
                                source_chain, dest_chain, amount_usdc_wei, amount_usd
        user_id:  User wallet address / auth UID (for local TX log)

    Returns:
        Execution result dict with tx_hash, status, etc.
    """
    from preimage_manager import get_next_preimage
    from wirefluid_encoder import encode_wirefluid_payload
    from contract_caller import call_hash_vault
    from tx_log import append_tx  # local JSONL log

    match_id = decision.get("match_id", "UNKNOWN")
    print(f"\n{'='*60}")
    print(f"[Executor] Starting autonomous execution for: {match_id}")
    print(f"[Executor] Token    : {decision.get('metadata', {}).get('token_symbol', '?')} "
          f"@ {decision.get('dest_chain', '?')}")
    print(f"[Executor] Footprint: {decision.get('calculated_footprint_kg', 0):.2f} kg CO2")
    print(f"[Executor] Spend    : ${decision.get('amount_usd', 0):.4f} "
          f"({decision.get('amount_usdc_wei', 0)} USDC wei)")

    # ── Step 1: Get next preimage ─────────────────────────────────────────────
    print(f"\n[Executor] Step 1/3 — Fetching next preimage from chain...")
    idx, preimage_hex = get_next_preimage()

    # ── Step 2: Encode WireFluid payload ──────────────────────────────────────
    print(f"[Executor] Step 2/3 — Encoding WireFluid intent payload...")
    payload = encode_wirefluid_payload(decision)
    print(f"[Executor]   Payload: {len(payload)} bytes | 0x{payload.hex()[:32]}...")

    # ── Step 3: Call the contract ─────────────────────────────────────────────
    print(f"[Executor] Step 3/3 — Calling HashVault.execute() on WireFluid Testnet...")
    from preimage_manager import mark_used
    
    try:
        result = call_hash_vault(
            preimage_hex=preimage_hex,
            token_address=decision["target_token"],
            amount_usdc_wei=int(decision.get("amount_usdc_wei", 0)),
            wirefluid_payload=payload,
        )

        if result["status"] == "success":
            mark_used(idx)
            print(f"[Executor] Local cache updated: Preimage #{idx} marked USED")
            
    except Exception as e:
        print(f"[Executor] 🚨 Critical failure during contract call: {e}")
        # Log the failed attempt too so we have a forensic trail
        append_tx(
            tx_hash="",
            match_id=match_id,
            user_id=user_id,
            footprint_kg=decision.get("calculated_footprint_kg"),
            amount_usd=decision.get("amount_usd"),
            token_symbol=decision.get("metadata", {}).get("token_symbol"),
            dest_chain=decision.get("dest_chain"),
            status="failed",
            source=decision.get("metadata", {}).get("source", "agent"),
            preimage_index=idx,
            extra={"error": str(e)},
        )
        raise

    # Enrich result
    result["preimage_index"] = idx
    result["match_id"] = match_id
    result["footprint_kg"] = decision.get("calculated_footprint_kg", 0)
    result["amount_usd"] = decision.get("amount_usd", 0)
    result["token_symbol"] = decision.get("metadata", {}).get("token_symbol", "")
    result["user_id"] = user_id

    # ── Step 4: Write TX hash to local log (always, before Supabase) ──────────
    append_tx(
        tx_hash=result.get("tx_hash", ""),
        match_id=match_id,
        user_id=user_id,
        footprint_kg=result["footprint_kg"],
        amount_usd=result["amount_usd"],
        token_symbol=result["token_symbol"],
        dest_chain=decision.get("dest_chain"),
        status=result["status"],
        source=decision.get("metadata", {}).get("source", "agent"),
        preimage_index=idx,
        explorer_url=result.get("explorer_url"),
    )

    # ── Step 5: Log to Supabase offset_ledger ────────────────────────────────
    _log_to_ledger(decision, result)

    # ── Summary ───────────────────────────────────────────────────────────────
    print(f"\n{'='*60}")
    if result["status"] == "success":
        print(f"[Executor] ✅ EXECUTION SUCCESSFUL")
        print(f"[Executor] TX Hash  : {result['tx_hash']}")
        print(f"[Executor] Explorer : {result.get('explorer_url', '')}")
        print(f"[Executor] Offset   : {result['footprint_kg']:.2f} kg CO2 "
              f"(${result['amount_usd']:.4f} spent)")
    else:
        print(f"[Executor] ❌ EXECUTION FAILED — check tx on explorer")
        print(f"[Executor] TX Hash  : {result['tx_hash']}")
    print(f"{'='*60}\n")

    return result


def _log_to_ledger(decision: dict, result: dict):
    """
    Write the execution result to Supabase's `offset_ledger` table.
    Silently skips if Supabase is not configured.
    """
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        print("[Executor] Supabase not configured — skipping ledger log.")
        return

    try:
        from supabase import create_client

        client = create_client(supabase_url, supabase_key)
        row = {
            "match_id": decision.get("match_id"),
            "footprint_kg": decision.get("calculated_footprint_kg"),
            "token_symbol": decision.get("metadata", {}).get("token_symbol", ""),
            "token_address": decision.get("target_token"),
            "dest_chain": decision.get("dest_chain"),
            "amount_usd": decision.get("amount_usd", 0),
            "amount_usdc_wei": str(decision.get("amount_usdc_wei", 0)),
            "tx_hash": result.get("tx_hash"),
            "status": result.get("status", "unknown"),
            "preimage_index": result.get("preimage_index"),
            "confirmed_at": datetime.now(timezone.utc).isoformat()
            if result.get("status") == "success"
            else None,
        }

        client.table("offset_ledger").insert(row).execute()
        print(f"[Executor] ✅ Logged to Supabase offset_ledger (match: {row['match_id']})")

    except Exception as e:
        print(f"[Executor] ⚠️  Supabase logging failed: {e}")


if __name__ == "__main__":
    # ── Standalone test with a synthetic decision ─────────────────────────────
    print("=== Executor Dry-Run Test ===")
    print("This test WILL broadcast a real transaction to WireFluid Testnet.")
    print("Make sure DEPLOYER_PRIVATE_KEY is set and the wallet has WIRE tokens.\n")

    confirm = input("Continue? (yes/no): ").strip().lower()
    if confirm != "yes":
        print("Aborted.")
        sys.exit(0)

    test_decision = {
        "match_id": "PSL_2026_TEST_01",
        "calculated_footprint_kg": 150.0,
        "target_token": "0x2F800Db0fdb5223b3C3f354886d907A671414A7F",  # BCT on Polygon
        "source_chain": "WireFluid",
        "dest_chain": "Polygon",
        "amount_usd": 0.225,
        "amount_usdc_wei": 225_000,  # $0.225 USDC
        "metadata": {
            "token_symbol": "BCT",
            "attribution_ratio": 0.08,
            "floodlights_on": True,
        },
    }

    result = run_execution(test_decision)
    print(json.dumps(result, indent=2))
