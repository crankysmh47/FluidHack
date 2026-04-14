"""
Configuration module for Carbon Sentinel - The Brain.
Load API keys and environment variables from .env file.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Electricity Maps API
ELECTRICITY_MAPS_API_URL = os.getenv(
    "ELECTRICITY_MAPS_API_URL", "https://api-access.electricitymaps.com/2.0"
)
ELECTRICITY_MAPS_TOKEN = os.getenv("ELECTRICITY_MAPS_TOKEN", "")

# Weather API (OpenWeatherMap)
WEATHER_API_URL = "https://api.openweathermap.org/data/2.5"
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")

# Sports API (API-Football / custom sports feed)
SPORTS_API_URL = os.getenv("SPORTS_API_URL", "https://v3.football.api-sports.io")
SPORTS_API_KEY = os.getenv("SPORTS_API_KEY", "")

# DefiLlama
DEFILLAMA_API_URL = "https://yields.llama.fi"

# Supabase (provided by Track 4)
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# OpenAI (for LLM-based attribution reasoning)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# Stadium configurations
STADIUMS = {
    "national_stadium_karachi": {
        "name": "National Stadium, Karachi",
        "lat": 24.8959,
        "lon": 67.0936,
        "zone": "PK",  # Pakistan zone for Electricity Maps
        "capacity_kw": 500,  # Estimated floodlight + operations power draw in kW
        "max_capacity": 34228,
    },
    "gaddafi_stadium_lahore": {
        "name": "Gaddafi Stadium, Lahore",
        "lat": 31.5152,
        "lon": 74.3425,
        "zone": "PK",
        "capacity_kw": 450,
        "max_capacity": 27000,
    },
    "rawalpindi_cricket_stadium": {
        "name": "Rawalpindi Cricket Stadium",
        "lat": 33.6007,
        "lon": 73.0679,
        "zone": "PK",
        "capacity_kw": 400,
        "max_capacity": 15000,
    },
}

# Default match config
DEFAULT_MATCH = {
    "match_id": "PSL_2026_01",
    "stadium_key": "national_stadium_karachi",
    "home_team": "Peshawar Zalmi",
    "away_team": "Multan Sultans",
}
