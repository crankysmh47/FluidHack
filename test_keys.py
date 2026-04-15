import os
import requests
from dotenv import load_dotenv

def test_api_keys():
    load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
    
    results = {}
    print("Beginning API Key Tests...")
    
    # 1. Supabase
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY")
    if supabase_url and supabase_key:
        try:
            res = requests.get(f"{supabase_url}/rest/v1/", headers={"apikey": supabase_key, "Authorization": f"Bearer {supabase_key}"})
            results["Supabase"] = "OK" if res.status_code in [200, 400, 404] else f"Error {res.status_code}"
        except Exception as e:
            results["Supabase"] = f"Failed: {e}"
    else:
        results["Supabase"] = "Missing in .env"

    # 2. Electricity Maps
    em_key = os.environ.get("ELECTRICITY_MAPS_TOKEN") or os.environ.get("ELECTRICITY_MAP_API_KEY")
    if em_key:
        try:
            res = requests.get("https://api-access.electricitymaps.com/2w/power-breakdown/latest?zone=IN", headers={"auth-token": em_key})
            results["Electricity Maps"] = "OK" if res.status_code == 200 else f"Error {res.status_code}: {res.text[:50]}"
        except Exception as e:
            results["Electricity Maps"] = f"Failed: {e}"
    else:
        results["Electricity Maps"] = "Missing in .env"

    # 3. Cric API
    cric_key = os.environ.get("CRIC_API_KEY")
    if cric_key:
        try:
            res = requests.get(f"https://api.cricapi.com/v1/currentMatches?apikey={cric_key}&offset=0")
            results["Cric API"] = "OK" if res.status_code == 200 else f"Error {res.status_code}"
        except Exception as e:
            results["Cric API"] = f"Failed: {e}"
    else:
        results["Cric API"] = "Missing in .env"

    # 4. Weather API
    weather_key = os.environ.get("WEATHER_API_KEY")
    if weather_key:
        try:
            res = requests.get(f"http://api.weatherapi.com/v1/current.json?key={weather_key}&q=London")
            results["Weather API"] = "OK" if res.status_code == 200 else f"Error {res.status_code}"
        except Exception as e:
            results["Weather API"] = f"Failed: {e}"
    else:
        results["Weather API"] = "Missing in .env"

    # 5. Groq API
    groq_key = os.environ.get("GROQ_API_KEY")
    if groq_key:
        try:
            res = requests.get("https://api.groq.com/openai/v1/models", headers={"Authorization": f"Bearer {groq_key}"})
            results["Groq API"] = "OK" if res.status_code == 200 else f"Error {res.status_code}"
        except Exception as e:
            results["Groq API"] = f"Failed: {e}"
    else:
        results["Groq API"] = "Missing in .env"

    # Summary
    print("\n--- API Key Diagnostics ---")
    for key, status in results.items():
        if status == "OK":
            print(f"✅ {key}: {status}")
        else:
            print(f"❌ {key}: {status}")

if __name__ == "__main__":
    test_api_keys()
