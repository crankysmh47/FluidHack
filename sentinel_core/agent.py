"""
Carbon Sentinel - The Brain (AI Agent Orchestrator)
Main orchestrator that ties together all data sources, the attribution engine,
and the DefiLlama scraper to produce the final JSON decision payload.

Usage:
    python agent.py                          # Run once with default match
    python agent.py --match_id PSL_2026_02   # Run with specific match
    python agent.py --loop --interval 60     # Run continuously every 60s
"""
import argparse
import json
import time
from datetime import datetime, timezone
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import DEFAULT_MATCH, SUPABASE_URL, SUPABASE_KEY
from data_sources.electricity_maps import ElectricityMapsClient
from data_sources.sports_api import SportsAPIClient
from data_sources.weather_api import WeatherAPIClient
from attribution_engine import AttributionEngine
from defillama_scraper import DefiLlamaScraper


class CarbonSentinelAgent:
    """
    Autonomous AI agent that:
    1. Monitors live match status
    2. Calculates stadium-specific carbon footprint (attribution engine)
    3. Finds cheapest carbon credit (DefiLlama)
    4. Outputs the execution decision JSON for Track 4
    """

    def __init__(self, match_config: dict = None):
        self.match_config = match_config or DEFAULT_MATCH
        self.match_id = self.match_config["match_id"]

        # Initialize clients
        self.em_client = ElectricityMapsClient()
        self.weather_client = WeatherAPIClient()
        self.sports_client = SportsAPIClient()
        self.attribution_engine = AttributionEngine(
            self.em_client, self.weather_client, self.sports_client
        )
        self.defillama_scraper = DefiLlamaScraper()

    def run_audit_cycle(self) -> dict:
        """
        Execute a full audit cycle:
        1. Check match status
        2. Calculate stadium footprint
        3. Find cheapest carbon credit
        4. Produce decision payload

        Returns the decision JSON (the "contract" with Track 4).
        """
        print(f"\n{'='*60}")
        print(f"[Agent] Audit Cycle Start - {self.match_id}")
        print(f"[Agent] Timestamp: {datetime.now(timezone.utc).isoformat()}")
        print(f"{'='*60}")

        # Step 1: Check match status
        print("\n[1/4] Checking match status...")
        match_info = self._get_match_info()
        if not match_info:
            print("[Agent] No live match found. Using fallback data.")
            match_info = {
                "fixture_id": 0,
                "status": "LIVE",
                "status_long": "Simulated Live",
                "home_team": self.match_config.get("home_team", "Team A"),
                "away_team": self.match_config.get("away_team", "Team B"),
            }
        print(f"  Match: {match_info.get('home_team')} vs {match_info.get('away_team')}")
        print(f"  Status: {match_info.get('status_long', 'Unknown')}")

        # Step 2: Calculate stadium footprint
        print("\n[2/4] Calculating stadium carbon footprint...")
        stadium_key = self.match_config.get("stadium_key", "national_stadium_karachi")
        footprint_result = self.attribution_engine.calculate_stadium_footprint(
            stadium_key, match_info
        )
        print(
            self.attribution_engine.get_attribution_explanation(footprint_result)
        )

        # Step 3: Find cheapest carbon credit
        print("\n[3/4] Scraping DefiLlama for cheapest carbon credit...")
        cheapest_credit = self.defillama_scraper.get_cheapest_carbon_credit()
        print(f"  Token: {cheapest_credit['token_symbol']} on {cheapest_credit['dest_chain']}")
        print(f"  Address: {cheapest_credit['target_token']}")
        print(f"  TVL: ${cheapest_credit['tvl_usd']:,.0f}")

        # Step 4: Produce decision payload
        print("\n[4/4] Producing decision payload...")
        decision = self._build_decision(footprint_result, cheapest_credit)

        print(f"\n{'='*60}")
        print("[Agent] DECISION PAYLOAD:")
        print(json.dumps(decision, indent=2))
        print(f"  Buy {decision['amount_usd']:.4f} USD of {decision['metadata']['token_symbol']} "
              f"on {decision['dest_chain']}")
        print(f"{'='*60}")

        # Log to Supabase
        self._log_decision(decision)

        # Step 5: Execute autonomously on-chain
        if not getattr(self, '_dry_run', False):
            self._execute_on_chain(decision)
        else:
            print("[Agent] --dry-run mode: skipping on-chain execution.")

        return decision

    def _get_match_info(self) -> dict:
        """Try to get live match info from sports API."""
        home = self.match_config.get("home_team", "")
        away = self.match_config.get("away_team", "")

        if home and away:
            match_info = self.sports_client.get_match_by_teams(home, away)
            if match_info:
                return match_info

        # Fallback: check all live matches
        live_matches = self.sports_client.get_live_matches()
        if live_matches:
            return live_matches[0]

        return {}

    def _build_decision(self, footprint: dict, credit: dict) -> dict:
        """Build the final decision payload (contract with Track 4 / executor)."""
        footprint_kg = footprint["calculated_footprint_kg"]
        price_per_tonne = credit.get("price_per_tonne_usd", 1.5)

        # Carbon credits: 1 tonne = 1 token. Footprint in kg → tonnes.
        amount_usd = (footprint_kg / 1000.0) * price_per_tonne
        # USDC has 6 decimals; enforce a $0.01 minimum to avoid dust txs.
        amount_usd = max(amount_usd, 0.01)
        amount_usdc_wei = int(amount_usd * 1_000_000)

        return {
            "match_id": self.match_id,
            "calculated_footprint_kg": footprint_kg,
            "target_token": credit["target_token"],
            "source_chain": credit["source_chain"],
            "dest_chain": credit["dest_chain"],
            # --- Execution params ---
            "amount_usd": round(amount_usd, 6),
            "amount_usdc_wei": amount_usdc_wei,
            "metadata": {
                "attribution_ratio": footprint["breakdown"]["attribution_ratio"],
                "floodlights_on": footprint["breakdown"]["floodlights_on"],
                "city_ac_load_factor": footprint["breakdown"]["city_ac_load_factor"],
                "token_symbol": credit["token_symbol"],
                "price_per_tonne_usd": price_per_tonne,
                "tvl_usd": credit["tvl_usd"],
                "timestamp": footprint["timestamp"],
            },
        }

    def _log_decision(self, decision: dict):
        """Log decision to Supabase `decisions` table."""
        if not SUPABASE_URL or not SUPABASE_KEY:
            print("[Supabase] Credentials not set. Skipping log.")
            return
        try:
            from supabase import create_client
            supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            supabase.table("decisions").insert({
                "match_id": decision["match_id"],
                "footprint_kg": decision["calculated_footprint_kg"],
                "target_token": decision["target_token"],
                "source_chain": decision["source_chain"],
                "dest_chain": decision["dest_chain"],
                "amount_usd": decision.get("amount_usd"),
                "metadata": decision.get("metadata", {}),
                "created_at": datetime.now(timezone.utc).isoformat(),
            }).execute()
            print("[Supabase] ✅ Decision logged.")
        except Exception as e:
            print(f"[Supabase] ⚠️  Error logging decision: {e}")

    def _execute_on_chain(self, decision: dict):
        """Call the glue executor to trigger the HashVault.execute() transaction."""
        try:
            # Import from glue/ directory
            import importlib.util, pathlib
            glue_dir = pathlib.Path(__file__).parent.parent / "glue"
            spec = importlib.util.spec_from_file_location(
                "executor", glue_dir / "executor.py"
            )
            executor_mod = importlib.util.module_from_spec(spec)
            # Ensure glue/ is in path for executor's own imports
            import sys
            if str(glue_dir) not in sys.path:
                sys.path.insert(0, str(glue_dir))
            spec.loader.exec_module(executor_mod)
            result = executor_mod.run_execution(decision)
            return result
        except Exception as e:
            print(f"[Agent] ❌ On-chain execution failed: {e}")
            print("[Agent]    Decision is in Supabase — retry with executor.py manually.")
            return None


def main():
    parser = argparse.ArgumentParser(description="Carbon Sentinel - The Brain")
    parser.add_argument("--match_id", type=str, default=None, help="Match ID to monitor")
    parser.add_argument("--loop", action="store_true", help="Run in continuous loop")
    parser.add_argument("--interval", type=int, default=60, help="Loop interval in seconds")
    parser.add_argument("--dry-run", action="store_true", help="Analyze only — skip on-chain execution")
    args = parser.parse_args()

    # Build match config
    match_config = DEFAULT_MATCH.copy()
    if args.match_id:
        match_config["match_id"] = args.match_id

    agent = CarbonSentinelAgent(match_config)
    agent._dry_run = args.dry_run

    if args.loop:
        print(f"[Agent] Running in loop mode (interval={args.interval}s)")
        print("[Agent] Press Ctrl+C to stop.")
        try:
            while True:
                decision = agent.run_audit_cycle()
                print(f"\n[Agent] Next cycle in {args.interval}s...")
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\n[Agent] Stopping loop.")
    else:
        agent.run_audit_cycle()


if __name__ == "__main__":
    main()
