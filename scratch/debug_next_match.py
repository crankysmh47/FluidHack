import os
import sys
sys.path.insert(0, os.getcwd())

from sentinel_core.data_sources.sports_api import SportsAPIClient
import json

client = SportsAPIClient()
print("Live Matches:")
print(json.dumps(client.get_live_matches(), indent=2))
print("\nNext Match:")
print(json.dumps(client.get_next_psl_match(), indent=2))
