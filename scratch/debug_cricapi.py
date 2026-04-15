import os
import sys
sys.path.insert(0, os.getcwd())

from sentinel_core.data_sources.sports_api import SportsAPIClient
from sentinel_core.config import DEFAULT_MATCH, CRIC_API_KEY
import json

client = SportsAPIClient()
matches = client._fetch_series_matches()
print(f"Found {len(matches)} matches in series.")

for m in matches:
    teams = [t.lower() for t in m.get("teams", [])]
    if DEFAULT_MATCH["home_team"].lower() in teams and DEFAULT_MATCH["away_team"].lower() in teams:
        print(f"Found target match: {m.get('id')}")
        print("Raw match data:")
        print(json.dumps(m, indent=2))
        
        # Now fetch match_info
        import requests
        url = f"https://api.cricapi.com/v1/match_info?apikey={CRIC_API_KEY}&id={m.get('id')}"
        resp = requests.get(url)
        if resp.ok:
            print("\nDetailed match_info:")
            print(json.dumps(resp.json(), indent=2))
        break
