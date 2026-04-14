"""
Carbon Sentinel — REST API Server
Provides a clean HTTP API for the frontend to:
  - Read agent status, total offsets, and ledger history
  - Get/set user agent configuration (budget, limits, on/off)
  - Revoke or restore the AI agent
  - Trigger a manual force-buy

Usage:
    pip install flask flask-cors
    python glue/api_server.py          # port 5000
    python glue/api_server.py --port 8080
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# ── Path injection ────────────────────────────────────────────────────────────
_GLUE_DIR  = Path(os.path.dirname(os.path.abspath(__file__)))
_SRC_DIR   = _GLUE_DIR.parent / "sentinel_core"
sys.path.insert(0, str(_GLUE_DIR))
sys.path.insert(0, str(_SRC_DIR))

from dotenv import load_dotenv
load_dotenv()

try:
    from flask import Flask, jsonify, request, abort
    from flask_cors import CORS
except ImportError:
    print("ERROR: Flask not installed. Run:  pip install flask flask-cors")
    sys.exit(1)

from user_control import (
    get_user_config,
    create_user_config,
    update_user_config,
    revoke_agent,
    restore_agent,
    request_force_buy,
    get_total_offset_stats,
    check_budget_gate,
)
from tx_log import read_all_txs, get_total_stats, get_hashes_only

# ── App ───────────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from the frontend


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


def _ok(data: dict, code: int = 200):
    return jsonify({"ok": True, "data": data, "timestamp": _ts()}), code


def _err(message: str, code: int = 400):
    return jsonify({"ok": False, "error": message, "timestamp": _ts()}), code


# ── Health / Status ───────────────────────────────────────────────────────────

@app.route("/", methods=["GET"])
@app.route("/status", methods=["GET"])
def status():
    """Agent health check + platform-wide carbon offset summary."""
    local_stats = get_total_stats()
    supabase_stats = get_total_offset_stats()  # platform_stats_view

    return _ok({
        "service": "Carbon Sentinel API",
        "version": "1.0.0",
        "status": "online",
        "local_tx_count": local_stats.get("total_txs", 0),
        "local_successful_txs": local_stats.get("successful_txs", 0),
        "local_total_kg_offset": local_stats.get("total_footprint_kg_offset", 0),
        "local_total_spent_usd": local_stats.get("total_spent_usd", 0),
        "supabase_stats": supabase_stats,
    })


# ── Total Offsets ─────────────────────────────────────────────────────────────

@app.route("/offsets", methods=["GET"])
def offsets():
    """Platform-wide carbon offset totals (all users combined)."""
    return _ok(get_total_offset_stats())


@app.route("/offsets/local", methods=["GET"])
def offsets_local():
    """Local tx_hashes.jsonl stats — works even without Supabase."""
    return _ok(get_total_stats())


@app.route("/offsets/hashes", methods=["GET"])
def offset_hashes():
    """Return all TX hashes (for hackathon submission evidence)."""
    return _ok({"tx_hashes": get_hashes_only()})


# ── Ledger ────────────────────────────────────────────────────────────────────

@app.route("/ledger", methods=["GET"])
def ledger():
    """
    Paginated offset ledger from local JSONL.
    Query params: page (1-indexed), per_page
    """
    page = max(1, int(request.args.get("page", 1)))
    per_page = min(100, int(request.args.get("per_page", 20)))

    all_records = list(reversed(read_all_txs()))  # newest first
    total = len(all_records)
    start = (page - 1) * per_page
    records = all_records[start:start + per_page]

    return _ok({
        "total": total,
        "page": page,
        "per_page": per_page,
        "records": records,
    })


# ── User Config ───────────────────────────────────────────────────────────────

@app.route("/user/<user_id>/config", methods=["GET"])
def get_config(user_id: str):
    """Return the agent config for a user."""
    return _ok(get_user_config(user_id))


@app.route("/user/<user_id>/config", methods=["POST", "PUT"])
def set_config(user_id: str):
    """
    Update a user's agent config.
    Body JSON fields (all optional):
      - budget_usd: float
      - max_tx_usd: float
      - auto_execute: bool
      - spectatorless_mode: bool
      - display_name: str
    """
    body = request.get_json(silent=True) or {}
    allowed = {"budget_usd", "max_tx_usd", "auto_execute", "spectatorless_mode", "display_name"}
    fields = {k: v for k, v in body.items() if k in allowed}

    if not fields:
        return _err("No valid fields provided. Allowed: " + ", ".join(allowed))

    updated = update_user_config(user_id, **fields)
    return _ok(updated)


@app.route("/user/<user_id>/offsets", methods=["GET"])
def user_offsets(user_id: str):
    """Return carbon offset stats for a specific user."""
    return _ok(get_total_offset_stats(user_id))


# ── Agent Control ─────────────────────────────────────────────────────────────

@app.route("/user/<user_id>/revoke", methods=["POST"])
def revoke(user_id: str):
    """Immediately revoke (halt) the AI agent for this user."""
    updated = revoke_agent(user_id)
    return _ok({"message": f"Agent revoked for {user_id}", "config": updated})


@app.route("/user/<user_id>/restore", methods=["POST"])
def restore(user_id: str):
    """Re-enable the AI agent for this user."""
    updated = restore_agent(user_id)
    return _ok({"message": f"Agent restored for {user_id}", "config": updated})


# ── Force Buy ─────────────────────────────────────────────────────────────────

@app.route("/user/<user_id>/force-buy", methods=["POST"])
def force_buy(user_id: str):
    """
    Queue a manual carbon credit purchase.
    Body JSON:
      - amount_usd: float (required) — USD to spend
      - match_id: str (optional) — match context
    The agent will execute this on its next cycle (or immediately if running).
    """
    body = request.get_json(silent=True) or {}
    amount = body.get("amount_usd")

    if amount is None:
        return _err("amount_usd is required.")
    if not isinstance(amount, (int, float)) or amount <= 0:
        return _err("amount_usd must be a positive number.")

    # Check that the agent is not revoked before queuing
    cfg = get_user_config(user_id)
    if not cfg.get("is_active", True):
        return _err("Agent is revoked. Restore the agent before triggering a force-buy.", 403)

    row = request_force_buy(
        user_id=user_id,
        amount_usd=float(amount),
        match_id=body.get("match_id"),
    )
    return _ok({"message": "Force-buy queued.", "request": row}, 201)


@app.route("/user/<user_id>/force-buy/immediate", methods=["POST"])
def force_buy_immediate(user_id: str):
    """
    Execute a force-buy RIGHT NOW (synchronous, not queued).
    This will attempt an actual on-chain transaction if the private key is set.
    Body JSON: amount_usd (required), match_id (optional)
    """
    body = request.get_json(silent=True) or {}
    amount = body.get("amount_usd")

    if amount is None:
        return _err("amount_usd is required.")
    if not isinstance(amount, (int, float)) or amount <= 0:
        return _err("amount_usd must be a positive number.")

    try:
        from agent import CarbonSentinelAgent
        from config import DEFAULT_MATCH

        agent = CarbonSentinelAgent(DEFAULT_MATCH.copy(), user_id=user_id)
        result = agent.force_buy_cycle(
            amount_usd=float(amount),
            match_id=body.get("match_id"),
        )
        if result is None:
            return _err("Force-buy blocked (agent revoked or execution failed).", 403)
        return _ok({"message": "Force-buy executed.", "result": result})
    except Exception as e:
        return _err(f"Force-buy failed: {e}", 500)


# ── Budget Check ──────────────────────────────────────────────────────────────

@app.route("/user/<user_id>/budget-check", methods=["GET"])
def budget_check(user_id: str):
    """
    Check whether a proposed spend is within user limits.
    Query param: amount_usd
    """
    amount_str = request.args.get("amount_usd", "")
    try:
        amount = float(amount_str)
    except (ValueError, TypeError):
        return _err("amount_usd query param is required and must be a number.")

    allowed, reason = check_budget_gate(user_id, amount)
    cfg = get_user_config(user_id)
    return _ok({
        "allowed": allowed,
        "reason": reason,
        "budget_usd": cfg.get("budget_usd"),
        "spent_usd": cfg.get("spent_usd"),
        "max_tx_usd": cfg.get("max_tx_usd"),
        "remaining_usd": round(cfg.get("budget_usd", 50) - cfg.get("spent_usd", 0), 4),
    })


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Carbon Sentinel API Server")
    parser.add_argument("--port", type=int, default=5000)
    parser.add_argument("--host", type=str, default="0.0.0.0")
    parser.add_argument("--debug", action="store_true")
    args = parser.parse_args()

    print(f"[API] Carbon Sentinel REST API starting on {args.host}:{args.port}")
    print(f"[API] Endpoints:")
    print(f"  GET  /status")
    print(f"  GET  /offsets, /offsets/local, /offsets/hashes")
    print(f"  GET  /ledger?page=1&per_page=20")
    print(f"  GET  /user/<id>/config")
    print(f"  POST /user/<id>/config          body: {{budget_usd, max_tx_usd, ...}}")
    print(f"  POST /user/<id>/revoke")
    print(f"  POST /user/<id>/restore")
    print(f"  POST /user/<id>/force-buy       body: {{amount_usd, match_id}}")
    print(f"  POST /user/<id>/force-buy/immediate")
    print(f"  GET  /user/<id>/budget-check?amount_usd=5.0")
    app.run(host=args.host, port=args.port, debug=args.debug)
