"""
Attribution Engine: Stadium vs City Load Disaggregation & Logistics
Core logic to isolate the stadium's carbon footprint and the tournament's logistical footprint.
"""
from datetime import datetime, timezone
from data_sources.electricity_maps import ElectricityMapsClient
from data_sources.weather_api import WeatherAPIClient
from data_sources.sports_api import SportsAPIClient
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import STADIUMS


class AttributionEngine:
    def __init__(
        self,
        electricity_client: ElectricityMapsClient = None,
        weather_client: WeatherAPIClient = None,
        sports_client: SportsAPIClient = None,
    ):
        self.em_client = electricity_client or ElectricityMapsClient()
        self.weather_client = weather_client or WeatherAPIClient()
        self.sports_client = sports_client or SportsAPIClient()

    def calculate_stadium_footprint(
        self,
        stadium_key: str,
        match_info: dict = None,
        match_duration_hours: float = 3.0,
    ) -> dict:
        stadium = STADIUMS.get(stadium_key)
        if not stadium:
            raise ValueError(f"Unknown stadium: {stadium_key}")

        # 1. Get grid carbon intensity
        grid_data = self.em_client.get_carbon_intensity(stadium["zone"])
        grid_intensity = grid_data["carbonIntensity"]  # gCO2eq/kWh

        # 2. Get weather and calculate city AC load
        weather = self.weather_client.get_current_weather(
            stadium["lat"], stadium["lon"]
        )
        city_ac_factor = self.weather_client.calculate_ac_load_factor(weather)

        # 3. Determine stadium load based on match status
        floodlights_on = False
        if match_info:
            floodlights_on = self.sports_client.get_floodlight_status(match_info)

        base_operations_kw = 100
        stadium_load_kw = base_operations_kw + (
            stadium["capacity_kw"] if floodlights_on else 0
        )

        # 4. Estimate city baseline load
        city_baseline_kw = 5000 * city_ac_factor

        # 5. Calculate attribution ratio
        total_load = stadium_load_kw + city_baseline_kw
        attribution_ratio = stadium_load_kw / total_load if total_load > 0 else 0

        # 6. Calculate stadium energy consumption (kWh)
        stadium_consumption_kwh = (stadium_load_kw / 1000) * match_duration_hours

        # 7. Scope 3 Logistics: Fans and Team Transit
        spectatorless_mode = os.getenv("SPECTATORLESS_MODE", "False") == "True"
        logistics_footprint_kg = 0
        team_transit_buffer_kg = 2500 
        
        if not spectatorless_mode:
            attendance = stadium.get("max_capacity", 30000) * 0.85
            fan_travel_kg = attendance * 15 * 0.12
            logistics_footprint_kg = fan_travel_kg + team_transit_buffer_kg
        else:
            logistics_footprint_kg = team_transit_buffer_kg

        # 8. Calculate total carbon footprint (kg CO2eq)
        calculated_footprint_kg = (grid_intensity * stadium_consumption_kwh / 1000) + logistics_footprint_kg

        return {
            "calculated_footprint_kg": round(calculated_footprint_kg, 2),
            "breakdown": {
                "grid_intensity_gco2_kwh": round(grid_intensity, 2),
                "stadium_consumption_kwh": round(stadium_consumption_kwh, 2),
                "attribution_ratio": round(attribution_ratio, 4),
                "city_ac_load_factor": round(city_ac_factor, 2),
                "floodlights_on": floodlights_on,
                "stadium_load_kw": round(stadium_load_kw, 2),
                "city_baseline_load_kw": round(city_baseline_kw, 2),
                "logistics_footprint_kg": round(logistics_footprint_kg, 2),
                "weather": {
                    "temperature_c": weather.get("temperature_c"),
                    "humidity_pct": weather.get("humidity_pct"),
                },
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def get_attribution_explanation(self, result: dict) -> str:
        bd = result["breakdown"]
        explanation = (
            f"Attribution Analysis:\n"
            f"  Grid Intensity: {bd['grid_intensity_gco2_kwh']} gCO2eq/kWh\n"
            f"  Stadium Load: {bd['stadium_load_kw']} kW (floodlights: {bd['floodlights_on']})\n"
            f"  City AC Load Factor: {bd['city_ac_load_factor']}x (temp: {bd['weather']['temperature_c']}°C)\n"
            f"  Attribution Ratio: {bd['attribution_ratio']*100:.1f}% of grid spike is stadium\n"
            f"  Stadium Consumption: {bd['stadium_consumption_kwh']} kWh\n"
            f"  Logistics/Transit Footprint: {bd['logistics_footprint_kg']} kg CO2eq\n"
            f"  Calculated Footprint: {result['calculated_footprint_kg']} kg CO2eq"
        )
        return explanation


if __name__ == "__main__":
    engine = AttributionEngine()
    mock_match = {
        "status": "1H",
        "status_long": "First Half",
        "home_team": "Peshawar Zalmi",
        "away_team": "Multan Sultans",
    }
    result = engine.calculate_stadium_footprint(
        "national_stadium_karachi", mock_match
    )
    print(engine.get_attribution_explanation(result))
