"""
Rapid Fire Orchestrator — Carbon Sentinel
Listens to `match_events.jsonl` and triggers immediate 
carbon offset transactions via the AI agent.
"""
import os
import sys
import json
import time
from datetime import datetime, timezone
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sentinel_core.agent import CarbonSentinelAgent
from sentinel_core.config import DEFAULT_MATCH

EVENT_FILE = Path(__file__).parent / "match_events.jsonl"

def main():
    print(f"\n{'='*60}")
    print(f"🚀 Carbon Sentinel Rapid Fire Orchestrator Started")
    print(f"Listening to: {EVENT_FILE.name}")
    print(f"{'='*60}\n")

    # Initialize Agent
    agent = CarbonSentinelAgent(DEFAULT_MATCH.copy(), user_id="demo_user")
    
    # Track which events we've already processed
    processed_events = set()
    
    # Pre-poll: mark existing events as processed to only react to new ones
    if EVENT_FILE.exists():
        with open(EVENT_FILE, "r") as f:
            for line in f:
                if line.strip():
                    try:
                        ev = json.loads(line)
                        processed_events.add(ev.get("timestamp"))
                    except: pass

    try:
        while True:
            if not EVENT_FILE.exists():
                time.sleep(1)
                continue

            new_events = []
            with open(EVENT_FILE, "r") as f:
                for line in f:
                    if line.strip():
                        try:
                            ev = json.loads(line)
                            ts = ev.get("timestamp")
                            if ts not in processed_events:
                                new_events.append(ev)
                                processed_events.add(ts)
                        except: pass

            for ev in new_events:
                reason = ev.get("reason", "Rapid match event")
                amount = ev.get("amount_usd", 0.5)
                print(f"🔔 NEW EVENT DETECTED: {ev.get('event')} - {reason}")
                
                try:
                    result = agent.force_buy_cycle(
                        amount_usd=amount,
                        comment=reason
                    )
                    if result and result.get("status") == "success":
                        print(f"✅ Success: {result.get('tx_hash')}")
                    else:
                        print(f"❌ Failed or skipped.")
                except Exception as e:
                    print(f"❌ Error during execution: {e}")

            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping orchestrator.")

if __name__ == "__main__":
    main()
