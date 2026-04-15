"""
Sports API Connector (CricAPI Edition)
Fetches live match status, teams, and scores for PSL matches using CricAPI.
"""
import requests
from datetime import datetime, timezone
import sys
import os
import re

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import CRIC_API_KEY, PSL_MATCHES_ID


class SportsAPIClient:
    def __init__(self, api_key: str = None, series_id: str = None):
        self.api_key = api_key or CRIC_API_KEY
        self.series_id = series_id or PSL_MATCHES_ID
        self.base_url = "https://api.cricapi.com/v1"

    def _fetch_series_matches(self) -> list:
        """Helper to fetch all matches in the configured series."""
        url = f"{self.base_url}/series_info?apikey={self.api_key}&id={self.series_id}"
        try:
            resp = requests.get(url, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            if data.get("status") != "success":
                print(f"[SportsAPI] API Error: {data.get('reason', 'Unknown error')}")
                return []
            return data.get("data", {}).get("matchList", [])
        except Exception as e:
            print(f"[SportsAPI] request failed: {e}")
            return []

    def get_live_matches(self) -> list:
        """
        Get all currently live matches in the PSL series.
        """
        matches = self._fetch_series_matches()
        live = []
        for m in matches:
            if m.get("matchStarted") and not m.get("matchEnded"):
                live.append(self._map_match_data(m))
        return live

    def get_match_by_teams(self, home: str, away: str) -> dict:
        """Find a match by team names in the PSL series."""
        matches = self._fetch_series_matches()
        if not matches:
            # If API is down or quota hit, return a mock 'Scheduled' match from DEFAULT_MATCH
            from config import DEFAULT_MATCH
            if home.lower() == DEFAULT_MATCH["home_team"].lower() and away.lower() == DEFAULT_MATCH["away_team"].lower():
                return {
                    "fixture_id": DEFAULT_MATCH["match_id"],
                    "status": "NS",
                    "status_long": "Scheduled",
                    "home_team": DEFAULT_MATCH["home_team"],
                    "away_team": DEFAULT_MATCH["away_team"],
                    "home_score": 0,
                    "away_score": 0,
                    "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                    "matchStarted": False,
                    "matchEnded": False
                }
            return {}

        for m in matches:
            teams = [t.lower() for t in m.get("teams", [])]
            if home.lower() in teams and away.lower() in teams:
                # Try to fetch exact scores with match_info endpoint
                fid = m.get("id")
                if fid:
                    try:
                        url = f"{self.base_url}/match_info?apikey={self.api_key}&id={fid}"
                        resp = requests.get(url, timeout=5)
                        if resp.ok:
                            r_data = resp.json()
                            if r_data.get("status") == "success":
                                return self._map_match_data(r_data.get("data", {}))
                    except Exception:
                        pass
                return self._map_match_data(m)
        return {}

    def get_next_psl_match(self) -> dict:
        """Find the next upcoming PSL match."""
        matches = self._fetch_series_matches()
        
        # If API is down, use config.DEFAULT_MATCH as the next match
        if not matches:
            from config import DEFAULT_MATCH
            return {
                "fixture_id": DEFAULT_MATCH["match_id"],
                "status": "NS",
                "status_long": "Scheduled",
                "home_team": DEFAULT_MATCH["home_team"],
                "away_team": DEFAULT_MATCH["away_team"],
                "home_score": 0,
                "away_score": 0,
                "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                "matchStarted": False,
                "matchEnded": False
            }

        # Sort by date
        sorted_matches = sorted(matches, key=lambda x: x.get("date", ""))
        
        now = datetime.now(timezone.utc)
        now_str = now.strftime("%Y-%m-%d")
        
        for m in sorted_matches:
            # If it hasn't ended and is today or in the future
            if not m.get("matchEnded") and m.get("date") >= now_str:
                return self._map_match_data(m)
        
        # Absolute fallback if none found
        return {
            "home_team": "TBD",
            "away_team": "TBD",
            "date": now.isoformat(),
            "status": "NS",
            "status_long": "Scheduled"
        }

    def is_match_live(self, match_info: dict) -> bool:
        """Check if a match is currently in progress."""
        if not match_info:
            return False
        # If we have the matchStarted/matchEnded flags in the raw or mapped data
        started = match_info.get("matchStarted", False)
        ended = match_info.get("matchEnded", False)
        
        # Also check status string heuristics
        status = match_info.get("status", "").lower()
        live_keywords = ["opt to bowl", "opt to bat", "trails by", "leads by", "needs", "overs"]
        is_live_status = any(kw in status for kw in live_keywords)
        
        return (started and not ended) or is_live_status

    def get_floodlight_status(self, match_info: dict) -> bool:
        """Infer if stadium floodlights are ON."""
        if not match_info:
            return False

        # If live, floodlights are likely ON for evening/night games
        if self.is_match_live(match_info):
            # In PSL, most matches are evening/night
            return True

        # Check hour (local time Karachi is UTC+5)
        dt_str = match_info.get("dateTimeGMT")
        if dt_str:
            try:
                dt = datetime.fromisoformat(dt_str)
                if dt.hour >= 13 or dt.hour < 5:
                    return True
            except:
                pass

        return False

    def _extract_match_number(self, name: str) -> int:
        """Extract match number from name (e.g., '23rd Match' -> 23)."""
        match = re.search(r'(\d+)(?:st|nd|rd|th)\s+Match', name, re.I)
        if match:
            return int(match.group(1))
        return 0

    def _parse_scores(self, status: str) -> tuple[int, int]:
        """Heuristic to parse scores from status string (e.g. 'PES 142/4 (14.2)')."""
        # Look for patterns like '142/4'
        scores = re.findall(r'(\d+)/\d+', status)
        if len(scores) >= 1:
            # For simplicity, returning first score found as home_score if only one
            # If two scores found, return both
            s1 = int(scores[0])
            s2 = int(scores[1]) if len(scores) > 1 else 0
            return s1, s2
        
        # Check for 'needs X runs in Y balls'
        needs_runs = re.search(r'need (\d+) runs', status, re.I)
        if needs_runs:
            # Not a real score, but we can extract the number for UI displaying something
            # Frontend handles this via 'status_long' mostly but providing a non-zero gives a hint
            # it's active. Let's return 0, 0 and let the detail parsing handle it.
            pass

        # Check for 'won by X runs' or 'won by X wkts'
        # Just return 0 if no live score
        return 0, 0

    def _map_match_data(self, m: dict) -> dict:
        """Map CricAPI match object to internal standard format."""
        # Teams
        teams = m.get("teams", ["Team A", "Team B"])
        home = teams[0] if len(teams) > 0 else "Team A"
        away = teams[1] if len(teams) > 1 else "Team B"
        
        # Status
        raw_status = m.get("status", "")
        status_short = "LIVE" if m.get("matchStarted") and not m.get("matchEnded") else "NS"
        if m.get("matchEnded"):
            status_short = "FT"

        # Scores
        h_score, a_score = self._parse_scores(raw_status)
        
        # Handle the case where score is in a 'score' field (currentMatches API or match_info)
        if "score" in m and isinstance(m["score"], list) and len(m["score"]) > 0:
            h_val, a_val = h_score, a_score
            for s in m["score"]:
                inn = s.get("inning", "").lower()
                r, w, o = s.get("r", 0), s.get("w", 0), s.get("o", 0)
                # Format exactly e.g. "154/4 (20)" or "154 (20)" if all out
                val_str = f"{r}/{w} ({o})" if w < 10 else f"{r} ({o})"
                if home.lower() in inn:
                    h_val = val_str
                elif away.lower() in inn:
                    a_val = val_str
            h_score, a_score = h_val, a_val

        match_num = self._extract_match_number(m.get("name", ""))

        return {
            "fixture_id": m.get("id"),
            "status": status_short,
            "status_long": raw_status,
            "home_team": home,
            "away_team": away,
            "home_score": h_score,
            "away_score": a_score,
            "date": m.get("date"),
            "dateTimeGMT": m.get("dateTimeGMT"),
            "matchStarted": m.get("matchStarted"),
            "matchEnded": m.get("matchEnded"),
            "match_number": match_num,
            "series_name": m.get("name")
        }


if __name__ == "__main__":
    client = SportsAPIClient()
    live = client.get_live_matches()
    print(f"Live matches: {len(live)}")
    for match in live:
        print(f"  {match['home_team']} vs {match['away_team']} - {match['status_long']}")
        print(f"  Score: {match['home_score']} - {match['away_score']} | Match #{match['match_number']}")
    
    if not live:
        next_m = client.get_next_psl_match()
        print(f"Next match: {next_m['home_team']} vs {next_m['away_team']} on {next_m['date']} | Match #{next_m['match_number']}")
