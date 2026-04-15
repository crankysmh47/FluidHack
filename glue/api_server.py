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
import time

# Ensure project root is in sys.path for local module imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

_FEED_CACHE = {
    "crypto": None,
    "crypto_ts": 0,
    "sports": None,
    "sports_ts": 0,
}

# ── Path injection ────────────────────────────────────────────────────────────
_GLUE_DIR  = Path(os.path.dirname(os.path.abspath(__file__)))
_SRC_DIR   = _GLUE_DIR.parent / "sentinel_core"
sys.path.insert(0, str(_GLUE_DIR))
sys.path.insert(0, str(_SRC_DIR))

from dotenv import load_dotenv
load_dotenv()

try:
    from flask import Flask, jsonify, request, abort, send_from_directory
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
    get_user_ledger,
)
from agent_sessions import start_session, end_session, get_session_history
from tx_log import read_all_txs, get_total_stats, get_hashes_only

# ── App ───────────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from the frontend
# ── Serve React Frontend ─────────────────────────────────────────────────────
_FRONTEND_DIR = _GLUE_DIR.parent / "frontend" / "dist"


@app.route("/", methods=["GET"])
def serve_index():
    """Serve React's index.html at the root."""
    index = _FRONTEND_DIR / "index.html"
    if index.exists():
        return send_from_directory(str(_FRONTEND_DIR), "index.html")
    # Fallback to API status if no frontend build exists
    return status()


@app.route("/assets/<path:filename>")
def serve_assets(filename):
    """Serve Vite-built static assets (JS, CSS, images)."""
    return send_from_directory(str(_FRONTEND_DIR / "assets"), filename)


@app.errorhandler(404)
def fallback(e):
    """Serve React's index.html for unknown routes (SPA client-side routing)."""
    index = _FRONTEND_DIR / "index.html"
    if index.exists():
        return send_from_directory(str(_FRONTEND_DIR), "index.html")
    return jsonify({"error": "Not found"}), 404


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


def _ok(data: dict, code: int = 200):
    return jsonify({"ok": True, "data": data, "timestamp": _ts()}), code


def _err(message: str, code: int = 400):
    return jsonify({"ok": False, "error": message, "timestamp": _ts()}), code

# ── Auth (Local Mock) ─────────────────────────────────────────────────────────

AUTH_FILE = _GLUE_DIR / "passwords.json"

def _load_auth() -> dict:
    if AUTH_FILE.exists():
        with open(AUTH_FILE, "r") as f:
            return json.load(f)
    return {}

def _save_auth(db: dict):
    with open(AUTH_FILE, "w") as f:
        json.dump(db, f, indent=2)

@app.route("/auth/signup", methods=["POST"])
def auth_signup():
    body = request.get_json(silent=True) or {}
    username = body.get("username", "").strip()
    password = body.get("password", "")
    if not username or not password:
        return _err("Username and password are required")
    
    db = _load_auth()
    if username in db:
        return _err("Username already exists", 409)
        
    db[username] = password
    _save_auth(db)
    
    # Provision config
    create_user_config(username, display_name=username, budget_usd=0.0)
    return _ok({"message": "Signup successful", "user_id": username})

@app.route("/auth/login", methods=["POST"])
def auth_login():
    body = request.get_json(silent=True) or {}
    username = body.get("username", "").strip()
    password = body.get("password", "")
    if not username or not password:
        return _err("Username and password are required")
        
    db = _load_auth()
    if db.get(username) != password:
        return _err("Invalid credentials", 401)
        
    return _ok({"message": "Login successful", "user_id": username})



# ── Health / Status ───────────────────────────────────────────────────────────


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


# ── Live Feed ─────────────────────────────────────────────────────────────────

@app.route("/live-feed", methods=["GET"])
def live_feed():
    """Returns real-time crypto prices and live sports match status with respectful rate-limit caching."""
    now = time.time()
    
    # 1. Crypto Prices (cached 10s)
    if not _FEED_CACHE["crypto"] or now - _FEED_CACHE["crypto_ts"] > 10:
        try:
            from defillama_scraper import DefiLlamaScraper
            scraper = DefiLlamaScraper()
            pools = scraper.filter_refi_pools()
            
            # Extract multiple tokens
            tokens = ["BCT", "MCO2", "NCT", "UBO"]
            crypto_data = {}
            
            # Fetch real prices first
            real_prices = scraper.get_real_prices(tokens)
            
            for t_sym in tokens:
                t_lower = t_sym.lower()
                found_pool = next((p for p in pools if t_sym in p.get("symbol", "").upper() and p.get("tvlUsd", 0) > 2000), None)
                
                # Fetch fallback if needed
                fallback_vals = {
                    "bct": {"price": 18.42, "change": 2.4, "tvl": 500000, "chain": "Polygon"},
                    "mco2": {"price": 12.15, "change": -0.8, "tvl": 120000, "chain": "Polygon"},
                    "nct": {"price": 22.10, "change": 1.2, "tvl": 85000, "chain": "Polygon"},
                    "ubo": {"price": 4.50, "change": 5.4, "tvl": 32000, "chain": "Polygon"}
                }
                
                # Use real price if available, otherwise pool price, otherwise fallback
                r_price = real_prices.get(t_lower, {}).get("price", 0)
                p_price = float(found_pool.get("price", 0)) if found_pool else 0
                
                # Determine final price (with floor from fallback)
                final_price = r_price or p_price or fallback_vals[t_lower]["price"]
                
                crypto_data[t_lower] = {
                    "price": float(final_price),
                    "change": float(found_pool.get("apy", 0)) if found_pool else fallback_vals[t_lower]["change"],
                    "tvl": float(found_pool.get("tvlUsd", 0)) if found_pool else fallback_vals[t_lower]["tvl"],
                    "chain": found_pool.get("chain", "Polygon") if found_pool else fallback_vals[t_lower]["chain"]
                }

            _FEED_CACHE["crypto"] = crypto_data
            _FEED_CACHE["crypto_ts"] = now
        except Exception as e:
            print(f"[LiveFeed] Crypto error: {e}")
            if not _FEED_CACHE["crypto"]:
                _FEED_CACHE["crypto"] = {
                    "bct": {"price": 18.42, "change": 2.4}, 
                    "mco2": {"price": 12.15, "change": -0.8},
                    "nct": {"price": 22.10, "change": 1.2},
                    "ubo": {"price": 4.50, "change": 5.4}
                }

    # 2. Sports Data (Refresh every 3min if live, every 1hour if not)
    # We use a long initial cache check, and then override sports_ts carefully.
    if not _FEED_CACHE["sports"] or now - _FEED_CACHE["sports_ts"] > 0:
        try:
            from data_sources.sports_api import SportsAPIClient
            from config import DEFAULT_MATCH
            sports = SportsAPIClient()
            match_info = sports.get_match_by_teams(DEFAULT_MATCH["home_team"], DEFAULT_MATCH["away_team"])
            is_live = sports.is_match_live(match_info)
            if not is_live:
                if not match_info:
                    match_info = sports.get_next_psl_match()
                is_live = False

            _FEED_CACHE["sports"] = {
                "is_live": is_live,
                "match": match_info
            }
            # Cache duration: 180s (3m) if live, 3600s (1h) if not live
            cache_duration = 180 if is_live else 3600
            _FEED_CACHE["sports_ts"] = now + cache_duration
        except Exception as e:
            print(f"[LiveFeed] Sports error: {e}")
            if not _FEED_CACHE["sports"]:
                _FEED_CACHE["sports"] = {"is_live": False, "match": None}
            # If error, try again in 5 mins
            _FEED_CACHE["sports_ts"] = now + 300

    return _ok({
        "crypto": _FEED_CACHE["crypto"],
        "sports": _FEED_CACHE["sports"]
    })

@app.route("/offsets", methods=["GET"])
def offsets():
    """Platform-wide carbon offset totals (all users combined)."""
    stats = get_total_offset_stats()
    # Fallback to local stats if Supabase is empty or unconfigured
    if not stats or stats.get("total_footprint_kg_offset", 0) == 0:
        local = get_total_stats()
        return _ok({
            "total_transactions": local.get("total_txs", 0),
            "total_footprint_kg_offset": local.get("total_footprint_kg_offset", 0.0),
            "total_spent_usd": local.get("total_spent_usd", 0.0),
            "last_purchase_at": None
        })
    return _ok(stats)


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


OVERRIDE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "surge_override.json")

def set_surge_override(event):
    with open(OVERRIDE_FILE, "w") as f:
        json.dump({"event": event, "timestamp": time.time()}, f)

def clear_surge_override():
    if os.path.exists(OVERRIDE_FILE):
        os.remove(OVERRIDE_FILE)

def get_surge_override():
    if os.path.exists(OVERRIDE_FILE):
        try:
            with open(OVERRIDE_FILE, "r") as f:
                return json.load(f)
        except:
            return None
    return None

@app.route("/demo/trigger-event", methods=["POST"])
def trigger_demo_event():
    """
    Manually trigger a grid surcharge or stadium event.
    Body: {"event": "surge" | "peak" | "clear"}
    """
    body = request.get_json(silent=True) or {}
    event = body.get("event", "clear")
    
    if event == "clear":
        clear_surge_override()
        return _ok({"message": "Overrides cleared. System back to real-time grid data."})
    
    set_surge_override(event)
    return _ok({"message": f"Simulated {event} triggered. Agent will detect spike in next cycle."})


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
      - authorized_tx_count: int
      - auto_execute: bool
      - spectatorless_mode: bool
      - display_name: str
    """
    body = request.get_json(silent=True) or {}
    allowed = {"budget_usd", "max_tx_usd", "authorized_tx_count", "auto_execute", "spectatorless_mode", "display_name", "is_active"}
    fields = {k: v for k, v in body.items() if k in allowed}

    if not fields:
        return _err("No valid fields provided. Allowed: " + ", ".join(allowed))

    # If a new authorization is being set (budget or tx_count provided)
    if "budget_usd" in fields or "authorized_tx_count" in fields:
        # Reset spent statistics for the new session
        fields["spent_usd"] = 0.0
        fields["tx_count"] = 0
        
    updated = update_user_config(user_id, **fields)
    
    # Session Management
    if "budget_usd" in fields or "authorized_tx_count" in fields:
        try:
            # Ensure updated is a dict
            config = updated if isinstance(updated, dict) else {}
            
            # End any current active session first
            end_session(user_id, config.get("spent_usd", 0.0), config.get("tx_count", 0), status="OVERWRITTEN")
            
            # Start the new session - use updated config if field not in request
            new_budget = fields.get("budget_usd", config.get("budget_usd", 50.0))
            new_tx_limit = fields.get("authorized_tx_count", config.get("authorized_tx_count", 50))
            
            start_session(user_id, new_budget, new_tx_limit)
        except Exception as e:
            print(f"[API] [!] Session tracking failed: {e}")
            
    return _ok(updated)


@app.route("/user/<user_id>/ledger/supabase", methods=["GET"])
def user_ledger_supabase(user_id: str):
    """Return full transaction history for a specific user from Supabase."""
    limit = int(request.args.get("limit", 50))
    return _ok(get_user_ledger(user_id, limit=limit))


@app.route("/user/<user_id>/offsets", methods=["GET"])
def user_offsets(user_id: str):
    """Return carbon offset stats for a specific user."""
    return _ok(get_total_offset_stats(user_id))


@app.route("/user/<user_id>/agent-history", methods=["GET"])
def user_agent_history(user_id: str):
    """Return the professional history of all agents deployed for this user."""
    return _ok(get_session_history(user_id))


# ── Agent Control ─────────────────────────────────────────────────────────────

@app.route("/user/<user_id>/revoke", methods=["POST"])
def revoke(user_id: str):
    """Immediately revoke (halt) the AI agent for this user."""
    updated = revoke_agent(user_id)
    # End the session as REVOKED
    end_session(user_id, updated.get("spent_usd", 0.0), updated.get("tx_count", 0), status="REVOKED")
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
        # Force-buy cycle is specifically for manual overrides
        result = agent.force_buy_cycle(
            amount_usd=float(amount),
            match_id=body.get("match_id"),
        )
        if result is None:
            return _err("Force-buy blocked (agent revoked or execution failed).", 403)
        
        status_code = 200 if result.get("status") == "success" else 500
        return _ok({"message": "Force-buy execution attempt complete.", "result": result}, status_code)
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
    budget = cfg.get("budget_usd", 0)
    spent = cfg.get("spent_usd", 0)
    remaining = budget - spent
    
    return _ok({
        "allowed": allowed,
        "reason": reason,
        "is_active": cfg.get("is_active", True),
        "budget_usd": budget,
        "spent_usd": spent,
        "remaining_usd": max(0.0, float(round(remaining, 4))),
        "max_tx_usd": cfg.get("max_tx_usd"),
        "tx_count": cfg.get("tx_count", 0),
        "authorized_tx_count": cfg.get("authorized_tx_count", 50)
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
