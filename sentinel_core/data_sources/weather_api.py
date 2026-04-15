"""
Weather API Connector (OpenWeatherMap & WeatherAPI.com)
Fetches real-time weather data for stadium load disaggregation.
"""
import requests
from datetime import datetime, timezone
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from config import WEATHER_API_URL, WEATHER_API_KEY
except ImportError:
    WEATHER_API_URL = "https://api.openweathermap.org/data/2.5"
    WEATHER_API_KEY = ""


class WeatherAPIClient:
    def __init__(self, api_url: str = None, api_key: str = None):
        self.api_url = api_url or WEATHER_API_URL
        self.api_key = api_key or WEATHER_API_KEY

    def get_current_weather(self, lat: float, lon: float) -> dict:
        """
        Get current weather for stadium coordinates.
        Supports both OpenWeatherMap (default) and WeatherAPI.com (if key format matches).
        """
        is_weatherapi_com = len(self.api_key) == 31  # Typical for weatherapi.com
        
        if is_weatherapi_com:
            endpoint = "http://api.weatherapi.com/v1/current.json"
            params = {
                "key": self.api_key,
                "q": f"{lat},{lon}"
            }
        else:
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
            
            if is_weatherapi_com:
                return {
                    "temperature_c": data["current"]["temp_c"],
                    "feels_like_c": data["current"]["feelslike_c"],
                    "humidity_pct": data["current"]["humidity"],
                    "wind_speed_ms": data["current"]["wind_kph"] / 3.6,
                    "weather_main": data["current"]["condition"]["text"],
                    "weather_description": data["current"]["condition"]["text"],
                    "timestamp": datetime.fromtimestamp(
                        data["current"]["last_updated_epoch"], tz=timezone.utc
                    ).isoformat(),
                }
            else:
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
        except Exception as e:
            print(f"[WeatherAPI] Error fetching weather: {e}")
            return self._fallback_weather(lat, lon)

    def get_forecast(self, lat: float, lon: float, hours: int = 6) -> list:
        """Get forecast (OpenWeatherMap only)."""
        endpoint = f"{self.api_url}/forecast"
        params = {"lat": lat, "lon": lon, "appid": self.api_key, "units": "metric"}
        try:
            resp = requests.get(endpoint, params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            return data.get("list", [])[: hours // 3]
        except Exception:
            return []

    def calculate_ac_load_factor(self, weather: dict) -> float:
        """Estimate city-wide AC load multiplier."""
        temp = weather.get("temperature_c", 25)
        humidity = weather.get("humidity_pct", 50)
        base_threshold = 25
        if temp <= base_threshold:
            return 0.8
        temp_factor = (temp - base_threshold) / 10
        humidity_factor = humidity / 100
        ac_multiplier = 1.0 + (temp_factor * 0.6) + (humidity_factor * 0.4)
        return min(ac_multiplier, 2.0)

    def _fallback_weather(self, lat: float, lon: float) -> dict:
        """Fallback for Karachi."""
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
    result = client.get_current_weather(24.8959, 67.0936)
    print(f"Weather: {result['weather_main']}, Temp: {result['temperature_c']}°C")
