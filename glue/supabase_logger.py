import os
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

def log_event(level: str, source: str, message: str, metadata: dict = {}):
    supabase.table('logs').insert({
        'level': level,
        'source': source,
        'message': message,
        'metadata': metadata
    }).execute()
    print(f"[{level.upper()}] {source}: {message}")


def log_telemetry(match_id: str, grid_intensity: float, weather_temp: float, 
                  stadium_load_kw: float, city_load_kw: float, raw_payload: dict = {}):
    supabase.table('telemetry').insert({
        'match_id': match_id,
        'grid_intensity': grid_intensity,
        'weather_temp': weather_temp,
        'stadium_load_kw': stadium_load_kw,
        'city_load_kw': city_load_kw,
        'raw_payload': raw_payload
    }).execute()
    print(f"✅ Telemetry logged for match: {match_id}")


def log_decision(match_id: str, footprint_kg: float, target_token: str,
                 source_chain: str, dest_chain: str):
    supabase.table('decisions').insert({
        'match_id': match_id,
        'calculated_footprint_kg': footprint_kg,
        'target_token': target_token,
        'source_chain': source_chain,
        'dest_chain': dest_chain,
        'status': 'pending'
    }).execute()
    print(f"✅ Decision logged for match: {match_id}")


# --- Test all three tables ---
if __name__ == "__main__":
    log_event('info', 'track_4', 'Supabase logger initialized', {'test': True})
    
    log_telemetry('PSL_2026_01', 412.5, 34.2, 850.0, 12000.0)
    
    log_decision('PSL_2026_01', 450.5, 
                 '0x1234567890123456789012345678901234567890',
                 'Base', 'Polygon')
