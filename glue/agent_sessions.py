import json
import os
from datetime import datetime, timezone
import uuid

SESSIONS_FILE = os.path.join(os.path.dirname(__file__), "sessions.json")

def _load_sessions():
    if not os.path.exists(SESSIONS_FILE):
        return {}
    try:
        with open(SESSIONS_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {}

def _save_sessions(data):
    with open(SESSIONS_FILE, "w") as f:
        json.dump(data, f, indent=2)

def start_session(user_id, authorized_budget=50.0, authorized_tx_count=50):
    """Start a new agent session for a user."""
    sessions = _load_sessions()
    if user_id not in sessions:
        sessions[user_id] = []
    
    # Handle None values from partial updates
    budget = float(authorized_budget) if authorized_budget is not None else 50.0
    tx_count = int(authorized_tx_count) if authorized_tx_count is not None else 50
    
    session_id = f"sentinel-{uuid.uuid4().hex[:8]}"
    new_session = {
        "session_id": session_id,
        "start_time": datetime.now(timezone.utc).isoformat(),
        "authorized_budget": budget,
        "authorized_tx_count": tx_count,
        "final_spend": 0.0,
        "final_tx_count": 0,
        "status": "ACTIVE"
    }
    
    sessions[user_id].append(new_session)
    _save_sessions(sessions)
    return new_session

def end_session(user_id, final_spend, final_tx_count, status="EXHAUSTED"):
    """End any existing active sessions for a user."""
    sessions = _load_sessions()
    if user_id not in sessions:
        return
    
    updated = False
    for sess in sessions[user_id]:
        if sess["status"] == "ACTIVE":
            sess["status"] = status
            sess["final_spend"] = float(final_spend)
            sess["final_tx_count"] = int(final_tx_count)
            sess["end_time"] = datetime.now(timezone.utc).isoformat()
            updated = True
            
    if updated:
        _save_sessions(sessions)

def get_session_history(user_id):
    """Get all sessions for a user, sorted by most recent."""
    sessions = _load_sessions()
    user_sessions = sessions.get(user_id, [])
    # Sort by start_time descending
    return sorted(user_sessions, key=lambda x: x["start_time"], reverse=True)
