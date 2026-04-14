"""
Electricity Maps API Connector
Fetches real-time grid carbon intensity (gCO2eq/kWh) for a given zone.
Docs: https://static.electricitymaps.com/api/docs/index.html
"""
import requests
from datetime import datetime, timezone
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import ELECTRICITY_MAPS_API_URL, ELECTRICITY_MAPS_TOKEN


class ElectricityMapsClient:
    def __init__(self, api_url: str = None, token: str = None):
        self.api_url = api_url or ELECTRICITY_MAPS_API_URL
        self.token = token or ELECTRICITY_MAPS_TOKEN
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

    def get_carbon_intensity(
        self, zone: str = "PK"
    ) -> dict:
        """
        Get current carbon intensity for a zone.
        Returns: {
            "carbonIntensity": float,  # gCO2eq/kWh
            "datetime": str,           # ISO timestamp
            "zone": str,
            "fossil_fuel_percentage": float,
        }
        """
        endpoint = f"{self.api_url}/carbon-intensity/latest"
        params = {"zone": zone}

        try:
            resp = requests.get(endpoint, headers=self.headers, params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            return {
                "carbonIntensity": data.get("carbonIntensity", 0),
                "datetime": data.get("datetime", datetime.now(timezone.utc).isoformat()),
                "zone": data.get("zone", zone),
                "fossil_fuel_percentage": data.get("fossilFuelPercentage", 0),
            }
        except requests.exceptions.RequestException as e:
            print(f"[ElectricityMaps] Error fetching carbon intensity: {e}")
            return self._fallback_intensity(zone)

    def get_carbon_intensity_history(
        self, zone: str = "PK", hours_back: int = 24
    ) -> list:
        """
        Get historical carbon intensity for baseline calculation.
        Returns list of intensity readings over the past N hours.
        """
        endpoint = f"{self.api_url}/carbon-intensity/history"
        params = {"zone": zone}

        try:
            resp = requests.get(endpoint, headers=self.headers, params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            return data.get("history", [])
        except requests.exceptions.RequestException as e:
            print(f"[ElectricityMaps] Error fetching history: {e}")
            return []

    def _fallback_intensity(self, zone: str) -> dict:
        """
        Fallback values when API is unavailable.
        Based on published grid intensity data for Pakistan/South Asia.
        """
        # Pakistan average: ~400-500 gCO2eq/kWh (heavy fossil fuel dependence)
        fallback_values = {
            "PK": {
                "carbonIntensity": 450,
                "fossil_fuel_percentage": 60,
            },
        }
        fallback = fallback_values.get(zone, {"carbonIntensity": 400, "fossil_fuel_percentage": 55})
        return {
            **fallback,
            "datetime": datetime.now(timezone.utc).isoformat(),
            "zone": zone,
        }


if __name__ == "__main__":
    client = ElectricityMapsClient()
    result = client.get_carbon_intensity("PK")
    print(f"Carbon Intensity: {result['carbonIntensity']} gCO2eq/kWh")
    print(f"Fossil Fuel %: {result['fossil_fuel_percentage']}%")
