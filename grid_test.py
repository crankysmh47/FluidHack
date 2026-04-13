import requests
import os
from dotenv import load_dotenv
load_dotenv()
response1 = requests.get(
    "https://api.electricitymaps.com/v3/carbon-intensity/latest?lat=24.86&lon=67.01",
    headers={
        "auth-token": f"{os.getenv('ELECTRICITY_MAP_API_KEY')}"
    }
)
response2 = requests.get(
    "https://api.electricitymaps.com/v3/carbon-intensity/latest?lat=35.92&lon=74.31",
    headers={
        "auth-token": f"{os.getenv('ELECTRICITY_MAP_API_KEY')}"
    }
)
print(response1.json())
print(response2.json())