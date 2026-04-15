import openmeteo_requests
import requests_cache
import pandas as pd
from retry_requests import retry

# 1. Setup the Open-Meteo API client with cache and retry on error
cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

# 2. Define the 5 major cities (Including the PSL match cities)
cities = [
    {"name": "Karachi", "lat": 24.8607, "lon": 67.0011},
    {"name": "Lahore", "lat": 31.5204, "lon": 74.3587},
    {"name": "Islamabad", "lat": 33.6844, "lon": 73.0479},
    {"name": "Peshawar", "lat": 34.0151, "lon": 71.5249},
    {"name": "Multan", "lat": 30.1978, "lon": 71.4697}
]

url = "https://api.open-meteo.com/v1/forecast"

# 3. Batch the coordinates and specifically request 'current' data, not hourly arrays
params = {
    "latitude": [city["lat"] for city in cities],
    "longitude": [city["lon"] for city in cities],
    "current": ["temperature_2m", "apparent_temperature"], # Raw temp and "Feels Like"
    "timezone": "Asia/Karachi"
}

print("=" * 60)
print("CARBON SENTINEL: REGIONAL WEATHER AUDIT")
print("=" * 60)

try:
    # This single call fetches data for all 5 cities simultaneously
    responses = openmeteo.weather_api(url, params=params)

    # 4. Loop through the responses and print ONLY the relevant actionable data
    for i, response in enumerate(responses):
        city_name = cities[i]["name"]
        
        # Extract the current data block
        current = response.Current()
        current_temp = current.Variables(0).Value()
        feels_like = current.Variables(1).Value()
        
        # Track 2 Fiduciary Logic: Determine if the city is experiencing high AC load
        load_status = "High AC Load Active" if feels_like >= 32.0 else "Normal Grid Load"
        
        # Format the output clearly for the console logs
        print(f"[{city_name.upper()}]")
        print(f" -> Temp: {current_temp:.1f} degC | Feels Like: {feels_like:.1f} degC")
        print(f" -> Status: {load_status}")
        print("-" * 60)

except Exception as e:
    print(f"[!] Failed to fetch weather data: {e}")