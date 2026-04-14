"""
User Control Layer — Carbon Sentinel
Gives users complete authority over the AI agent's behavior:
  - Budget and per-transaction limits
  - Enable/disable the agent (kill-switch / revocation)
  - Force-buy carbon credits on-demand
  - Read cumulative offset statistics
"""
from __future__ import annotations

import os
import sys
from datetime import datetime, timezone
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

# Allow importing from sibling/parent directories
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


# ── Supabase helper ───────────────────────────────────────────────────────────

def _get_supabase():
    """Return a Supabase client, or None if not configured."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
    if not url or not key:
        return None
    try:
        from supabase import create_client
        return create_client(url, key)
    except Exception as e:
        print(f"[UserControl] ⚠️  Supabase init failed: {e}")
        return None


# ── Data model defaults ───────────────────────────────────────────────────────

DEFAULT_CONFIG = {
    "budget_usd": 50.0,
    "max_tx_usd": 5.0,
    "spent_usd": 0.0,
    "is_active": True,
    "auto_execute": True,
    "spectatorless_mode": False,
    "display_name": "",
}


# ── Public API ────────────────────────────────────────────────────────────────

def get_user_config(user_id: str) -> dict:
    """
    Fetch a user's agent configuration from Supabase.
    Returns DEFAULT_CONFIG if Supabase is not available or user doesn't exist yet.
    """
    sb = _get_supabase()
    if not sb:
        return {**DEFAULT_CONFIG, "user_id": user_id}

    try:
        resp = sb.table("agent_config").select("*").eq("user_id", user_id).execute()
        rows = resp.data
        if rows:
            return rows[0]
        # Auto-provision defaults for new user
        return create_user_config(user_id)
    except Exception as e:
        print(f"[UserControl] ⚠️  get_user_config failed: {e}")
        return {**DEFAULT_CONFIG, "user_id": user_id}


def create_user_config(user_id: str, **overrides) -> dict:
    """
    Create a new user config row in Supabase with sane defaults.
    Idempotent — safe to call multiple times.
    """
    config = {**DEFAULT_CONFIG, "user_id": user_id, **overrides}
    sb = _get_supabase()
    if not sb:
        return config
    try:
        sb.table("agent_config").upsert(config, on_conflict="user_id").execute()
        print(f"[UserControl] ✅ Config provisioned for {user_id}")
    except Exception as e:
        print(f"[UserControl] ⚠️  create_user_config failed: {e}")
    return config


def update_user_config(user_id: str, **fields) -> dict:
    """
    Update specific fields of a user's agent config.
    Valid fields: budget_usd, max_tx_usd, is_active, auto_execute,
                  spectatorless_mode, display_name

    Examples:
        update_user_config("0xABC", budget_usd=100.0, max_tx_usd=10.0)
        update_user_config("0xABC", is_active=False)   # soft revoke
    """
    # Always update the timestamp
    fields["updated_at"] = datetime.now(timezone.utc).isoformat()

    sb = _get_supabase()
    if not sb:
        print("[UserControl] Supabase not configured — config update skipped.")
        return get_user_config(user_id)

    try:
        sb.table("agent_config").upsert(
            {"user_id": user_id, **fields}, on_conflict="user_id"
        ).execute()
        print(f"[UserControl] ✅ Config updated for {user_id}: {list(fields.keys())}")
    except Exception as e:
        print(f"[UserControl] ⚠️  update_user_config failed: {e}")

    return get_user_config(user_id)


def revoke_agent(user_id: str) -> dict:
    """
    Immediately halt the AI agent for this user.
    Sets is_active=False and auto_execute=False.
    The agent checks this flag before every cycle and will stop.
    """
    print(f"[UserControl] 🛑 Revoking agent for user: {user_id}")
    return update_user_config(user_id, is_active=False, auto_execute=False)


def restore_agent(user_id: str) -> dict:
    """Re-enable the agent after a revoke."""
    print(f"[UserControl] ✅ Restoring agent for user: {user_id}")
    return update_user_config(user_id, is_active=True, auto_execute=True)


def record_spend(user_id: str, amount_usd: float) -> dict:
    """
    Increment the cumulative spend counter for a user.
    Called automatically after each successful transaction.
    """
    sb = _get_supabase()
    if not sb:
        return get_user_config(user_id)
    try:
        # Use RPC or do read-modify-write
        config = get_user_config(user_id)
        new_spent = round(config.get("spent_usd", 0.0) + amount_usd, 6)
        return update_user_config(user_id, spent_usd=new_spent)
    except Exception as e:
        print(f"[UserControl] ⚠️  record_spend failed: {e}")
        return get_user_config(user_id)


# ── Budget gate ───────────────────────────────────────────────────────────────

def check_budget_gate(user_id: str, proposed_spend_usd: float) -> tuple[bool, str]:
    """
    Check whether a proposed spend is within the user's configured limits.

    Returns:
        (allowed: bool, reason: str)
    """
    config = get_user_config(user_id)

    if not config.get("is_active", True):
        return False, "Agent is revoked by user."

    if not config.get("auto_execute", True):
        return False, "Autonomous execution is disabled by user."

    max_tx = config.get("max_tx_usd", 5.0)
    if proposed_spend_usd > max_tx:
        return False, f"Proposed spend ${proposed_spend_usd:.4f} exceeds per-tx limit ${max_tx:.2f}."

    budget = config.get("budget_usd", 50.0)
    spent = config.get("spent_usd", 0.0)
    if spent + proposed_spend_usd > budget:
        remaining = budget - spent
        return False, (
            f"Budget exhausted. Budget=${budget:.2f}, Spent=${spent:.4f}, "
            f"Remaining=${remaining:.4f}. Proposed=${proposed_spend_usd:.4f}."
        )

    return True, "OK"


# ── Force Buy ─────────────────────────────────────────────────────────────────

def request_force_buy(user_id: str, amount_usd: float, match_id: str = None) -> dict:
    """
    Create a force-buy request record.
    Returns the request row dict (including its id).
    The actual execution is handled by the agent when it polls for pending force-buys.
    """
    if amount_usd <= 0:
        raise ValueError("amount_usd must be positive.")

    row = {
        "user_id": user_id,
        "amount_usd": amount_usd,
        "match_id": match_id,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    sb = _get_supabase()
    if sb:
        try:
            resp = sb.table("force_buys").insert(row).execute()
            row = resp.data[0] if resp.data else row
            print(f"[UserControl] ✅ Force-buy requested: ${amount_usd:.2f} for {user_id}")
        except Exception as e:
            print(f"[UserControl] ⚠️  request_force_buy DB write failed: {e}")
    else:
        print(f"[UserControl] Force-buy queued locally (no Supabase): ${amount_usd:.2f}")

    return row


def get_pending_force_buys(user_id: str = None) -> list[dict]:
    """Fetch all pending force-buy requests (optionally filtered by user)."""
    sb = _get_supabase()
    if not sb:
        return []
    try:
        q = sb.table("force_buys").select("*").eq("status", "pending")
        if user_id:
            q = q.eq("user_id", user_id)
        resp = q.order("created_at", desc=False).execute()
        return resp.data or []
    except Exception as e:
        print(f"[UserControl] ⚠️  get_pending_force_buys failed: {e}")
        return []


def mark_force_buy_executed(force_buy_id: int, tx_hash: str):
    """Mark a force-buy as executed after the on-chain tx lands."""
    sb = _get_supabase()
    if not sb:
        return
    try:
        sb.table("force_buys").update({
            "status": "executed",
            "tx_hash": tx_hash,
            "executed_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", force_buy_id).execute()
    except Exception as e:
        print(f"[UserControl] ⚠️  mark_force_buy_executed failed: {e}")


def mark_force_buy_failed(force_buy_id: int, error: str):
    """Mark a force-buy as failed."""
    sb = _get_supabase()
    if not sb:
        return
    try:
        sb.table("force_buys").update({
            "status": "failed",
            "error_message": str(error),
        }).eq("id", force_buy_id).execute()
    except Exception as e:
        print(f"[UserControl] ⚠️  mark_force_buy_failed: {e}")


# ── Offset Stats ──────────────────────────────────────────────────────────────

def get_total_offset_stats(user_id: str = None) -> dict:
    """
    Return cumulative carbon offset statistics.
    If user_id is provided, returns stats for that user only.
    Otherwise, returns platform-wide stats.
    """
    sb = _get_supabase()
    if not sb:
        return {
            "total_transactions": 0,
            "total_footprint_kg_offset": 0.0,
            "total_spent_usd": 0.0,
            "last_purchase_at": None,
        }
    try:
        if user_id:
            resp = sb.table("total_offsets_view").select("*").eq("user_id", user_id).execute()
        else:
            resp = sb.table("platform_stats_view").select("*").execute()

        rows = resp.data
        if rows:
            return rows[0]
        return {
            "total_transactions": 0,
            "total_footprint_kg_offset": 0.0,
            "total_spent_usd": 0.0,
            "last_purchase_at": None,
        }
    except Exception as e:
        print(f"[UserControl] ⚠️  get_total_offset_stats failed: {e}")
        return {}


# ── CLI test ──────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    test_user = "0xTestUser001"
    print("=== UserControl Self-Test ===")
    cfg = get_user_config(test_user)
    print(f"Config: {cfg}")

    allowed, reason = check_budget_gate(test_user, 3.50)
    print(f"Budget gate (3.50): {allowed} — {reason}")

    rb = request_force_buy(test_user, 2.0, match_id="PSL_2026_DEMO")
    print(f"Force-buy request: {rb}")

    stats = get_total_offset_stats()
    print(f"Platform stats: {stats}")
