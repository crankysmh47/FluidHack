import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

_SESSIONS_FILE = Path(os.path.dirname(os.path.abspath(__file__))) / ".." / "glue" / "agent_sessions.jsonl"

def start_session(user_id: str, budget: float, tx_limit: int):
    """Log a new agent authorization session start."""
    session = {
        "user_id": user_id,
        "session_id": f"sess_{int(time.time())}",
        "start_time": datetime.now(timezone.utc).isoformat(),
        "end_time": None,
        "authorized_budget": budget,
        "authorized_tx_count": tx_limit,
        "final_spend": 0.0,
        "final_tx_count": 0,
        "status": "ACTIVE"
    }
    _append_session(session)
    return session

def end_session(user_id: str, final_spend: float, final_tx_count: int, status: str = "EXHAUSTED"):
    """Update the most recent active session as ended."""
    sessions = _read_all_sessions()
    updated = False
    
    # Iterate backwards to find the last active session for this user
    for i in range(len(sessions) - 1, -1, -1):
        if sessions[i]["user_id"] == user_id and sessions[i]["status"] == "ACTIVE":
            sessions[i]["end_time"] = datetime.now(timezone.utc).isoformat()
            sessions[i]["final_spend"] = final_spend
            sessions[i]["final_tx_count"] = final_tx_count
            sessions[i]["status"] = status
            updated = True
            break
            
    if updated:
        _write_all_sessions(sessions)

def get_session_history(user_id: str):
    """Return all past and current sessions for a user."""
    sessions = _read_all_sessions()
    return [s for s in sessions if s["user_id"] == user_id]

def _read_all_sessions():
    if not _SESSIONS_FILE.exists():
        return []
    sessions = []
    with open(_SESSIONS_FILE, "r") as f:
        for line in f:
            if line.strip():
                sessions.append(json.loads(line))
    return sessions

def _append_session(session):
    os.makedirs(_SESSIONS_FILE.parent, exist_ok=True)
    with open(_SESSIONS_FILE, "a") as f:
        f.write(json.dumps(session) + "\n")

def _write_all_sessions(sessions):
    os.makedirs(_SESSIONS_FILE.parent, exist_ok=True)
    with open(_SESSIONS_FILE, "w") as f:
        for s in sessions:
            f.write(json.dumps(s) + "\n")
