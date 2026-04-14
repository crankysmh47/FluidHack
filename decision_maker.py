"""
Carbon Sentinel: Layer 1 Brain - Decision Maker
Entry point for the autonomous AI agent.
Calculates footprint (including Scope 3 Logistics) and finds cheapest offsets.
"""
import sys
import os
import json
from datetime import datetime, timezone

# Add sentinel_core to path
sys.path.append(os.path.join(os.getcwd(), "sentinel_core"))

try:
    from sentinel_core.agent import CarbonSentinelAgent
    from sentinel_core.config import DEFAULT_MATCH
except ImportError:
    print("Error: Could not find sentinel_core. Ensure you are running from the project root.")
    sys.exit(1)

def main():
    print(f"--- Carbon Sentinel Decision Maker Started at {datetime.now(timezone.utc).isoformat()} ---")
    
    # Initialize Agent with default match
    agent = CarbonSentinelAgent(DEFAULT_MATCH)
    
    # Set dry-run by default unless we want to trigger on-chain execution immediately
    # For hackathon demo, we usually want to see the JSON payload.
    agent._dry_run = True 
    
    try:
        # Run one full audit cycle
        decision = agent.run_audit_cycle()
        
        # Explicitly output ONLY the JSON for Track 4 consumption if needed
        # but the agent already prints it nicely.
        
    except Exception as e:
        print(f"Critical Error in Decision Maker: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
