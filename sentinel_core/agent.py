"""
Carbon Sentinel - The Brain (AI Agent Orchestrator)
Main orchestrator — fully integrated with user control layer:
  - Budget gate enforced before every autonomous tx
  - Per-tx spend limit respected
  - Revocation check every cycle
  - Force-buy polling: executes pending user-triggered purchases
  - TX hashes logged locally to tx_hashes.jsonl on every execution
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
from agent_sessions import end_session
try:
    from supabase import create_client, Client
except ImportError:
    Client = None
    create_client = None
from user_control import (
    get_user_config,
    check_budget_gate,
    record_spend,
    get_pending_force_buys,
    mark_force_buy_executed,
    mark_force_buy_failed,
)


class CarbonSentinelAgent:
    """
    Autonomous carbon offset agent with full user control integration.

    User controls respected every cycle:
      - is_active / auto_execute flags (revocation)
      - budget_usd / max_tx_usd limits
      - spectatorless_mode for Scope 3 logistics toggle
      - force_buy requests are polled and executed before autonomous cycle
    """

    def __init__(self, match_config: dict = None, user_id: str = "system"):
        self.match_config = match_config or DEFAULT_MATCH
        self.match_id = self.match_config["match_id"]
        self.user_id = user_id

        # Initialize clients
        self.em_client = ElectricityMapsClient()
        self.weather_client = WeatherAPIClient()
        self.sports_client = SportsAPIClient()
        self.attribution_engine = AttributionEngine(
            self.em_client, self.weather_client, self.sports_client
        )
        self.defillama_scraper = DefiLlamaScraper()
        
        # Supabase Init
        self.supabase = None
        if create_client and SUPABASE_URL and SUPABASE_KEY:
            try:
                self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            except Exception as e:
                print(f"[Agent] [!] Supabase Init Failed: {e}")

    # ── Public entry points ───────────────────────────────────────────────────

    def run_audit_cycle(self) -> dict | None:
        """
        Execute a full autonomous audit cycle.
        Returns the decision dict, or None if blocked by user controls / budget gate.
        """
        # ── Pre-check: Is the agent even active? ─────────────────────────────
        user_cfg = get_user_config(self.user_id)
        if not user_cfg.get("is_active", True):
            print(f"\n[Agent] [!] Audit Cycle skipped: Agent is currently REVOKED for user {self.user_id}")
            return None

        print(f"\n{'='*60}")
        print(f"[Agent] Audit Cycle Start - {self.match_id}")
        print(f"[Agent] Timestamp: {datetime.now(timezone.utc).isoformat()}")
        print(f"{'='*60}")

        # ── Pre-cycle: process any pending force-buys ─────────────────────────
        self._process_force_buys()

        # ── Step 1: Check match status ────────────────────────────────────────
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

        # ── Step 2: Calculate stadium footprint ───────────────────────────────
        print("\n[2/4] Calculating stadium carbon footprint...")
        stadium_key = self.match_config.get("stadium_key", "national_stadium_karachi")

        # Check for demo surge override
        override_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "glue", "surge_override.json")
        is_surge = False
        override_event = None
        if os.path.exists(override_file):
            try:
                with open(override_file, "r") as f:
                    ov_data = json.load(f)
                    if ov_data.get("event") in ["surge", "peak"]:
                        is_surge = True
                        override_event = ov_data.get("event")
                        print(f"  [DEMO] ⚡ Grid Surge Override Detected: {override_event}")
            except:
                pass

        if is_surge:
            # Differential Logic for Demo
            cur_i = 315.0 if override_event == "surge" else 450.0
            diff_res = self.attribution_engine.calculate_differential_footprint(
                stadium_key, 
                current_intensity=cur_i, 
                baseline_intensity=200.0,
                is_peak_load=(override_event == "peak")
            )
            footprint_result = {
                "calculated_footprint_kg": diff_res["excess_footprint_kg"],
                "breakdown": {
                    "grid_intensity_gco2_kwh": diff_res["current_intensity"],
                    "stadium_consumption_kwh": (diff_res["active_load_kw"] / 1000.0) * (15/60.0),
                    "is_surge": True,
                    "event_type": override_event,
                    "floodlights_on": (override_event == "peak"),
                    "weather": {"temperature_c": 28, "humidity_pct": 65} # Mock
                }
            }
            print(f"  [Agent] Calculated Excess Carbon: {footprint_result['calculated_footprint_kg']} kg (Surge Mode)")
        else:
            # Sync spectatorless_mode from user config
            user_cfg = get_user_config(self.user_id)
            if user_cfg.get("spectatorless_mode", False):
                os.environ["SPECTATORLESS_MODE"] = "True"
            else:
                os.environ.pop("SPECTATORLESS_MODE", None)

            # Dynamically calculate match duration from matchStarted timestamp
            calculated_hours = 3.0
            if match_info and "matchStarted" in match_info and match_info["matchStarted"]:
                try:
                    start_time_str = match_info["matchStarted"].replace("Z", "+00:00")
                    start_time = datetime.fromisoformat(start_time_str)
                    elapsed = datetime.now(timezone.utc) - start_time
                    calculated_hours = max(0.1, elapsed.total_seconds() / 3600)
                    print(f"  Dynamic Match Duration: {calculated_hours:.2f} hours")
                except Exception as e:
                    print(f"  [Warning] Failed to parse start time, defaulting to 3.0 hours. Error: {e}")

            footprint_result = self.attribution_engine.calculate_stadium_footprint(
                stadium_key, match_info, calculated_hours
            )
            print(self.attribution_engine.get_attribution_explanation(footprint_result))

        # ── Step 3: Find cheapest carbon credit ───────────────────────────────
        print("\n[3/4] Scraping DefiLlama for cheapest carbon credit...")
        cheapest_credit = self.defillama_scraper.get_cheapest_carbon_credit()
        print(f"  Token: {cheapest_credit['token_symbol']} on {cheapest_credit['dest_chain']}")
        print(f"  Address: {cheapest_credit['target_token']}")
        print(f"  TVL: ${cheapest_credit['tvl_usd']:,.0f}")

        # ── Step 4: Produce decision payload ──────────────────────────────────
        print("\n[4/4] Producing decision payload...")
        decision = self._build_decision(footprint_result, cheapest_credit)

        print(f"\n{'='*60}")
        print("[Agent] DECISION PAYLOAD:")
        print(json.dumps(decision, indent=2))
        print(f"  Buy {decision['amount_usd']:.4f} USD of {decision['metadata']['token_symbol']} "
              f"on {decision['dest_chain']}")
        print(f"{'='*60}")

        # ── Budget gate ───────────────────────────────────────────────────────
        allowed, reason = check_budget_gate(self.user_id, decision["amount_usd"])
        if not allowed:
            print(f"\n[Agent] 🚫 Autonomous execution BLOCKED: {reason}")
            self._log_decision(decision)
            
            # If blocked due to budget/count, signal end of session
            cfg = get_user_config(self.user_id)
            end_session(
                self.user_id, 
                final_spend=cfg.get("spent_usd", 0.0), 
                final_tx_count=cfg.get("tx_count", 0),
                status="EXHAUSTED"
            )
            return decision  # Return decision for visibility but don't execute

        # ── Log decision and execute ──────────────────────────────────────────
        self._log_decision(decision)

        if getattr(self, '_dry_run', False):
            print("[Agent] --dry-run mode: skipping on-chain execution.")
        else:
            result = self._execute_on_chain(decision)
            if result and result.get("status") == "success":
                record_spend(self.user_id, decision["amount_usd"])

        return decision

    def force_buy_cycle(self, amount_usd: float, match_id: str = None) -> dict | None:
        """
        Execute a forced carbon credit purchase at a user-specified dollar amount.
        Bypasses the autonomous budget gate but still requires the agent to be active.

        Args:
            amount_usd:  USD to spend on carbon credits
            match_id:    Optional match context string

        Returns:
            Execution result dict, or None on failure.
        """
        user_cfg = get_user_config(self.user_id)
        if not user_cfg.get("is_active", True):
            print(f"[Agent] [X] Force-buy blocked: Agent is revoked for user {self.user_id}")
            return None

        print(f"\n[Agent] [FORCE_BUY] ${amount_usd:.4f} for {self.user_id}")

        # Build a synthetic decision with the specified amount
        cheapest_credit = self.defillama_scraper.get_cheapest_carbon_credit()
        price_per_tonne = cheapest_credit.get("price_per_tonne_usd", 1.5)
        footprint_kg_equivalent = (amount_usd / price_per_tonne) * 1000

        decision = {
            "match_id": match_id or self.match_id,
            "calculated_footprint_kg": round(footprint_kg_equivalent, 2),
            "target_token": cheapest_credit["target_token"],
            "source_chain": cheapest_credit["source_chain"],
            "dest_chain": cheapest_credit["dest_chain"],
            "amount_usd": round(amount_usd, 6),
            "amount_usdc_wei": int(amount_usd * 1_000_000),
            "metadata": {
                "attribution_ratio": 0.0,
                "floodlights_on": False,
                "city_ac_load_factor": 1.0,
                "logistics_footprint_kg": 0.0,
                "token_symbol": cheapest_credit["token_symbol"],
                "price_per_tonne_usd": price_per_tonne,
                "tvl_usd": cheapest_credit["tvl_usd"],
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "source": "force_buy",
            },
        }

        self._log_decision(decision)
        result = self._execute_on_chain(decision)
        if result and result.get("status") == "success":
            record_spend(self.user_id, amount_usd)

        return result

    def _process_force_buys(self):
        """Poll Supabase for pending force-buy requests and execute them."""
        pending = get_pending_force_buys(self.user_id)
        if not pending:
            return

        print(f"\n[Agent] 🔔 {len(pending)} pending force-buy(s) found — processing first...")
        fb = pending[0]  # Process one per cycle to avoid timeouts
        fb_id = fb.get("id")
        try:
            result = self.force_buy_cycle(
                amount_usd=fb["amount_usd"],
                match_id=fb.get("match_id"),
            )
            if result and result.get("tx_hash"):
                mark_force_buy_executed(fb_id, result["tx_hash"])
            else:
                mark_force_buy_failed(fb_id, "No tx_hash returned")
        except Exception as e:
            mark_force_buy_failed(fb_id, str(e))
            print(f"[Agent] ⚠️  Force-buy {fb_id} failed: {e}")

    # ── Private helpers ───────────────────────────────────────────────────────

    def _get_match_info(self) -> dict:
        """Try to get live match info from sports API."""
        home = self.match_config.get("home_team", "")
        away = self.match_config.get("away_team", "")

        if home and away:
            match_info = self.sports_client.get_match_by_teams(home, away)
            if match_info:
                return match_info

        live_matches = self.sports_client.get_live_matches()
        if live_matches:
            return live_matches[0]

        return {}

    def _build_decision(self, footprint: dict, credit: dict) -> dict:
        """Build the final decision payload (contract with Track 4 / executor)."""
        footprint_kg = footprint["calculated_footprint_kg"]
        price_per_tonne = credit.get("price_per_tonne_usd", 1.5)

        amount_usd = (footprint_kg / 1000.0) * price_per_tonne
        amount_usd = max(amount_usd, 0.01)
        amount_usdc_wei = int(amount_usd * 1_000_000)

        return {
            "match_id": self.match_id,
            "calculated_footprint_kg": footprint_kg,
            "target_token": credit["target_token"],
            "source_chain": credit["source_chain"],
            "dest_chain": credit["dest_chain"],
            "amount_usd": round(amount_usd, 6),
            "amount_usdc_wei": amount_usdc_wei,
            "metadata": {
                "attribution_ratio": footprint["breakdown"]["attribution_ratio"],
                "floodlights_on": footprint["breakdown"]["floodlights_on"],
                "city_ac_load_factor": footprint["breakdown"]["city_ac_load_factor"],
                "logistics_footprint_kg": footprint["breakdown"]["logistics_footprint_kg"],
                "token_symbol": credit["token_symbol"],
                "price_per_tonne_usd": price_per_tonne,
                "tvl_usd": credit["tvl_usd"],
                "timestamp": footprint["timestamp"],
            },
        }

    def _log_decision(self, decision: dict):
        """Log decision to Supabase `decisions` table."""
        if not SUPABASE_URL or not SUPABASE_KEY:
            return
        
        try:
            from supabase import create_client
            supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            
            # Preparation: try to be robust about column names
            row = {
                "match_id": decision["match_id"],
                "target_token": decision["target_token"],
                "source_chain": decision["source_chain"],
                "dest_chain": decision["dest_chain"],
                "amount_usd": decision.get("amount_usd"),
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            
            # Try footprint_kg first
            try:
                row["footprint_kg"] = decision["calculated_footprint_kg"]
                supabase.table("decisions").insert(row).execute()
            except Exception:
                # Fallback to calculated_footprint_kg
                if "footprint_kg" in row: del row["footprint_kg"]
                row["calculated_footprint_kg"] = decision["calculated_footprint_kg"]
                supabase.table("decisions").insert(row).execute()
                
            print("[Supabase] [OK] Decision logged.")
        except Exception as e:
            print(f"[Supabase] [!] Warning: Could not log decision to 'decisions' table: {e}")
            print("           (Continuing execution as decision is preserved in local logs and offset_ledger)")

    def _execute_on_chain(self, decision: dict) -> dict | None:
        """Call the glue executor to trigger the HashVault.execute() transaction."""
        try:
            import importlib.util, pathlib
            glue_dir = pathlib.Path(__file__).parent.parent / "glue"
            spec = importlib.util.spec_from_file_location(
                "executor", glue_dir / "executor.py"
            )
            executor_mod = importlib.util.module_from_spec(spec)
            if str(glue_dir) not in sys.path:
                sys.path.insert(0, str(glue_dir))
            spec.loader.exec_module(executor_mod)
            result = executor_mod.run_execution(decision, user_id=self.user_id)
            return result
        except Exception as e:
            print(f"[Agent] ❌ On-chain execution failed: {e}")
            print("[Agent]    Decision is in Supabase — retry with executor.py manually.")
            return None


def main():
    parser = argparse.ArgumentParser(description="Carbon Sentinel - The Brain")
    parser.add_argument("--match_id", type=str, default=None)
    parser.add_argument("--user_id", type=str, default="system",
                        help="User wallet address / ID (for budget control)")
    parser.add_argument("--loop", action="store_true")
    parser.add_argument("--interval", type=int, default=60)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--force-buy", type=float, default=None,
                        help="Immediately trigger a forced purchase of N USD")
    args = parser.parse_args()

    match_config = DEFAULT_MATCH.copy()
    if args.match_id:
        match_config["match_id"] = args.match_id

    agent = CarbonSentinelAgent(match_config, user_id=args.user_id)
    agent._dry_run = args.dry_run

    if args.force_buy is not None:
        print(f"[CLI] Force-buy mode: ${args.force_buy:.4f}")
        agent.force_buy_cycle(args.force_buy)
        return

    if args.loop:
        print(f"[Agent] Running in loop mode (interval={args.interval}s, user={args.user_id})")
        print("[Agent] Press Ctrl+C to stop.")
        try:
            while True:
                agent.run_audit_cycle()
                print(f"\n[Agent] Next cycle in {args.interval}s...")
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\n[Agent] Stopping loop.")
    else:
        agent.run_audit_cycle()


if __name__ == "__main__":
    main()
