import requests
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

CRIC_API_KEY = os.getenv("CRIC_API_KEY")
PSL_MATCHES_ID = os.getenv("PSL_MATCHES_ID")

url = f"https://api.cricapi.com/v1/series_info?apikey={CRIC_API_KEY}&id={PSL_MATCHES_ID}"

response = requests.get(url)
data = response.json()

# Check if API worked
if data.get("status") != "success":
    print("Error:", data)
    exit()

matches = data.get("data", {}).get("matchList", [])

print("Total Matches:", len(matches))

for match in matches:
    venue = match.get("venue", "")

    # Extract city from venue
    city = venue.split(",")[-1].strip() if "," in venue else "Unknown"

    # Filtered data
    match_id = match.get("id")
    name = match.get("name")
    teams = match.get("teams")
    date = match.get("date")
    status = match.get("status")
    started = match.get("matchStarted")
    ended = match.get("matchEnded")

    print("=" * 50)
    print("Match ID:", match_id)
    print("Match:", name)
    print("Teams:", teams)
    print("City:", city)
    print("Venue:", venue)
    print("Date:", date)
    print("Status:", status)
    print("Started:", started, "| Ended:", ended)