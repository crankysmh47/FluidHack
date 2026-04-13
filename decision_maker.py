import os
import json
import subprocess
import requests
from dotenv import load_dotenv

def run_script(script_name):
    print(f"Running {script_name}...")
    try:
        # Run the script and capture output
        result = subprocess.run(
            ["python", script_name],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error running {script_name}: {e.stderr}")
        return getattr(e, 'output', '')

def main():
    load_dotenv()
    
    # 1. Load carbon_emissions.json
    print("Loading carbon emissions data...")
    with open("carbon_emissions.json", "r") as f:
        emissions_data = json.load(f)

    # 2. Call weather_fetching.py
    weather_output = run_script("weather_fetching.py")

    # 3. Call cric_api_tester.py
    cric_output = run_script("cric_api_tester.py")

    # 4. Call defillama_refi.py
    refi_output = run_script("defillama_refi.py")

    print("\nSynthesizing context and calling Groq API for decision...")
    # Prepare the prompt
    system_prompt = (
        "You are an AI orchestrated agent responsible for determining if, where, and how to purchase carbon offsets based on incoming data streams. "
        "You need to analyze the provided contexts and produce a human-readable recommendation report."
    )
    
    user_prompt = f"""
Based on the following data sources, determine:
1. Which city currently has the highest carbon emission spike and why (connect grid intensity, weather/AC load, and major events like cricket matches).
2. Whether purchasing carbon offsets is recommended based on the data.
3. If yes — which currency/token is best to use for the purchase, and why.

### DATA SOURCE 1: Baseline Carbon Emissions Data (JSON)
{json.dumps(emissions_data, indent=2)}

### DATA SOURCE 2: Real-time Weather Data (AC Load Estimator)
{weather_output}

### DATA SOURCE 3: Crowd/Event Data (Cricket Matches active)
{cric_output}

### DATA SOURCE 4: DeFiLlama ReFi / Carbon Token Markets
{refi_output}

Provide your final decision report clearly and concisely.
"""

    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        print("Error: GROQ_API_KEY not found in .env")
        return

    headers = {
        "Authorization": f"Bearer {groq_api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.5,
        "max_tokens": 1024
    }

    try:
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        report = data["choices"][0]["message"]["content"]
        
        print("\n" + "="*60)
        print("CARBON OFFSET DECISION REPORT")
        print("="*60)
        print(report)
        print("="*60 + "\n")
    except Exception as e:
        print(f"Failed to communicate with Groq API: {e}")
        if 'response' in locals() and hasattr(response, 'text'):
            print(f"Response text: {response.text}")

if __name__ == "__main__":
    main()
