"""
Sports API Connector
Fetches live match status (kickoff, halftime, fulltime, etc.) for PSL matches.
Supports API-Football or any custom sports data feed.
"""
import requests
from datetime import datetime, timezone
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import SPORTS_API_URL, SPORTS_API_KEY


class SportsAPIClient:
    def __init__(self, api_url: str = None, api_key: str = None):
        self.api_url = api_url or SPORTS_API_URL
        self.api_key = api_key or SPORTS_API_KEY
        self.headers = {
            "x-apisports-key": self.api_key,
            "Content-Type": "application/json",
        }

    def get_live_matches(self) -> list:
        """
        Get all currently live matches.
        Returns list of match objects with status, teams, time, etc.
        """
        endpoint = f"{self.api_url}/fixtures/live"

        try:
            resp = requests.get(endpoint, headers=self.headers, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            return data.get("response", [])
        except requests.exceptions.RequestException as e:
            print(f"[SportsAPI] Error fetching live matches: {e}")
            return []

    def get_match_status(self, fixture_id: int) -> dict:
        """
        Get detailed status for a specific match.
        Returns: {
            "fixture_id": int,
            "status": str,           # "NS", "1H", "HT", "2H", "ET", "P", "FT", "AET", "PEN"
            "status_long": str,      # "Not Started", "First Half", etc.
            "elapsed": int,          # minutes elapsed
            "home_team": str,
            "away_team": str,
            "home_score": int,
            "away_score": int,
        }
        """
        endpoint = f"{self.api_url}/fixtures"
        params = {"id": fixture_id}

        try:
            resp = requests.get(endpoint, headers=self.headers, params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            if not data.get("response"):
                return {}

            fixture = data["response"][0]
            return {
                "fixture_id": fixture["fixture"]["id"],
                "status": fixture["fixture"]["status"]["short"],
                "status_long": fixture["fixture"]["status"]["long"],
                "elapsed": fixture["fixture"]["status"].get("elapsed", 0),
                "home_team": fixture["teams"]["home"]["name"],
                "away_team": fixture["teams"]["away"]["name"],
                "home_score": fixture["goals"].get("home"),
                "away_score": fixture["goals"].get("away"),
                "date": fixture["fixture"]["date"],
            }
        except requests.exceptions.RequestException as e:
            print(f"[SportsAPI] Error fetching match status: {e}")
            return {}

    def get_match_by_teams(self, home: str, away: str) -> dict:
        """
        Find a match by team names (useful when fixture_id is unknown).
        """
        endpoint = f"{self.api_url}/fixtures"
        params = {"date": datetime.now(timezone.utc).strftime("%Y-%m-%d")}

        try:
            resp = requests.get(endpoint, headers=self.headers, params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()

            for fixture in data.get("response", []):
                home_team = fixture["teams"]["home"]["name"]
                away_team = fixture["teams"]["away"]["name"]
                if home.lower() in home_team.lower() and away.lower() in away_team.lower():
                    return {
                        "fixture_id": fixture["fixture"]["id"],
                        "status": fixture["fixture"]["status"]["short"],
                        "status_long": fixture["fixture"]["status"]["long"],
                        "home_team": home_team,
                        "away_team": away_team,
                        "date": fixture["fixture"]["date"],
                    }
            return {}
        except requests.exceptions.RequestException as e:
            print(f"[SportsAPI] Error searching for match: {e}")
            return {}

    def is_match_live(self, match_info: dict) -> bool:
        """Check if a match is currently in progress."""
        live_statuses = {"1H", "HT", "2H", "ET", "P", "LIVE"}
        return match_info.get("status", "") in live_statuses

    def get_next_psl_match(self) -> dict:
        """Fallback mock for next scheduled PSL match if nothing is live, to avoid excessive API scanning."""
        return {
            "home_team": "Lahore Qalandars",
            "away_team": "Karachi Kings",
            "date": "2026-04-20T14:00:00Z", 
            "status": "NS",
            "status_long": "Not Started"
        }

    def get_floodlight_status(self, match_info: dict) -> bool:
        """
        Infer if stadium floodlights are ON based on match status and time.
        Floodlights are typically ON for evening/night matches and during HT.
        """
        if not match_info:
            return False

        status = match_info.get("status", "")
        # Floodlights are ON if match is live (especially evening matches)
        if status in {"1H", "HT", "2H", "LIVE"}:
            return True

        # Also check if it's after sunset (fallback heuristic)
        match_date = match_info.get("date", "")
        if match_date:
            try:
                match_time = datetime.fromisoformat(match_date)
                if match_time.hour >= 18 or match_time.hour < 6:
                    return True
            except ValueError:
                pass

        return False


if __name__ == "__main__":
    client = SportsAPIClient()
    live = client.get_live_matches()
    print(f"Live matches: {len(live)}")
    for match in live:
        print(f"  {match.get('teams', {})}")
