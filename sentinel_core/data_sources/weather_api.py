"""
Weather API Connector (OpenWeatherMap)
Fetches real-time weather data for stadium load disaggregation.
Temperature, humidity, and wind affect city-wide AC/heating load.
"""
import requests
from datetime import datetime, timezone
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import WEATHER_API_URL, WEATHER_API_KEY


class WeatherAPIClient:
    def __init__(self, api_url: str = None, api_key: str = None):
        self.api_url = api_url or WEATHER_API_URL
        self.api_key = api_key or WEATHER_API_KEY

    def get_current_weather(self, lat: float, lon: float) -> dict:
        """
        Get current weather for stadium coordinates.
        Returns: {
            "temperature_c": float,
            "feels_like_c": float,
            "humidity_pct": float,
            "wind_speed_ms": float,
            "weather_main": str,       # "Clear", "Clouds", "Rain", etc.
            "weather_description": str,
            "timestamp": str,
        }
        """
        endpoint = f"{self.api_url}/weather"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key,
            "units": "metric",
        }

        try:
            resp = requests.get(endpoint, params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            return {
                "temperature_c": data["main"]["temp"],
                "feels_like_c": data["main"]["feels_like"],
                "humidity_pct": data["main"]["humidity"],
                "wind_speed_ms": data.get("wind", {}).get("speed", 0),
                "weather_main": data["weather"][0]["main"],
                "weather_description": data["weather"][0]["description"],
                "timestamp": datetime.fromtimestamp(
                    data["dt"], tz=timezone.utc
                ).isoformat(),
            }
        except requests.exceptions.RequestException as e:
            print(f"[WeatherAPI] Error fetching weather: {e}")
            return self._fallback_weather(lat, lon)

    def get_forecast(self, lat: float, lon: float, hours: int = 6) -> list:
        """
        Get weather forecast for the next N hours (3-hour intervals).
        """
        endpoint = f"{self.api_url}/forecast"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key,
            "units": "metric",
        }

        try:
            resp = requests.get(endpoint, params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            return data.get("list", [])[: hours // 3]
        except requests.exceptions.RequestException as e:
            print(f"[WeatherAPI] Error fetching forecast: {e}")
            return []

    def calculate_ac_load_factor(self, weather: dict) -> float:
        """
        Estimate city-wide AC load multiplier based on weather.
        - High temp + high humidity = high AC load
        - Returns a factor (0.5 - 2.0) relative to baseline city load.
        """
        temp = weather.get("temperature_c", 25)
        humidity = weather.get("humidity_pct", 50)

        # Base AC load kicks in above 25°C
        base_threshold = 25
        if temp <= base_threshold:
            return 0.8  # Lower than baseline (cool weather)

        # Exponential increase with temperature and humidity
        temp_factor = (temp - base_threshold) / 10  # 0.0 - 1.5+
        humidity_factor = humidity / 100  # 0.0 - 1.0

        # AC load multiplier: 1.0 (baseline) to ~2.0 (extreme heatwave)
        ac_multiplier = 1.0 + (temp_factor * 0.6) + (humidity_factor * 0.4)
        return min(ac_multiplier, 2.0)

    def _fallback_weather(self, lat: float, lon: float) -> dict:
        """Fallback for Karachi if API is unavailable."""
        return {
            "temperature_c": 32,
            "feels_like_c": 36,
            "humidity_pct": 65,
            "wind_speed_ms": 3.5,
            "weather_main": "Clear",
            "weather_description": "clear sky",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


if __name__ == "__main__":
    client = WeatherAPIClient()
    # Karachi National Stadium
    result = client.get_current_weather(24.8959, 67.0936)
    print(f"Temperature: {result['temperature_c']}°C")
    print(f"Humidity: {result['humidity_pct']}%")
    ac_factor = client.calculate_ac_load_factor(result)
    print(f"City AC Load Factor: {ac_factor:.2f}x")
