# sentinel_core — Carbon Sentinel AI Auditor

## What This Module Does

`sentence_core` is the autonomous AI auditor (Track 2 / "The Brain") for the Carbon Sentinel hackathon project. It performs **stadium-specific carbon footprint attribution** and identifies the cheapest cross-chain carbon credit to offset it.

### Architecture

```
sentinel_core/
├── agent.py                      # Main orchestrator — runs full audit cycles
├── attribution_engine.py         # Stadium vs City load disaggregation logic
├── defillama_scraper.py          # Multi-chain ReFi liquidity & price scraper
├── config.py                     # Centralized config (API keys, stadiums, defaults)
├── requirements.txt              # Python dependencies
├── .env.example                  # API credential template
└── data_sources/
    ├── electricity_maps.py       # Grid carbon intensity (gCO2eq/kWh)
    ├── sports_api.py             # Live PSL match status & floodlight inference
    └── weather_api.py            # OpenWeatherMap — temperature, humidity, AC load factor
```

### Data Flow

1. **Sports API** → checks if match is live, infers floodlight status
2. **Electricity Maps** → fetches real-time grid carbon intensity for the stadium's zone
3. **Weather API** → gets temperature/humidity → calculates city AC load factor
4. **Attribution Engine** → disaggregates stadium load from city baseline:
   ```
   stadium_footprint_kg = grid_intensity × stadium_consumption_kWh × attribution_ratio
   ```
5. **DefiLlama Scraper** → compares BCT/MCO2/NCT across Polygon & Celo for cheapest offset
6. **Agent** → produces the final JSON decision payload for Track 4 (Glue)

### Output Contract (JSON)

```json
{
  "match_id": "PSL_2026_01",
  "calculated_footprint_kg": 450.5,
  "target_token": "0x2F800Db0fdb5223b3C3f354886d907A671414A7F",
  "source_chain": "Base",
  "dest_chain": "Polygon",
  "metadata": {
    "attribution_ratio": 0.0847,
    "floodlights_on": true,
    "city_ac_load_factor": 1.32,
    "token_symbol": "BCT",
    "tvl_usd": 500000,
    "timestamp": "2026-04-13T19:30:00Z"
  }
}
```

## How to Run

```bash
cd sentinel_core
pip install -r requirements.txt
copy .env.example .env   # then fill in your API keys

# Single audit cycle
python agent.py

# Continuous monitoring (every 60 seconds)
python agent.py --loop --interval 60

# Specific match
python agent.py --match_id PSL_2026_02

# Dry run (no Supabase logging)
python agent.py --dry-run
```

## What's Done ✅

| Component | Status | Notes |
|---|---|---|
| `config.py` | ✅ Complete | Stadium configs, API URLs, env loading |
| `data_sources/electricity_maps.py` | ✅ Complete | Carbon intensity + history + fallbacks |
| `data_sources/sports_api.py` | ✅ Complete | Live matches, match status, floodlight inference |
| `data_sources/weather_api.py` | ✅ Complete | Weather fetch + AC load factor calculation |
| `attribution_engine.py` | ✅ Complete | Stadium vs City disaggregation logic |
| `defillama_scraper.py` | ✅ Complete | ReFi pool filtering + multi-chain comparison |
| `agent.py` | ✅ Complete | Full orchestration + Supabase logging stub |

## What's Left 🚧

| Task | Priority | Effort | Notes |
|---|---|---|---|
| **Supabase Integration** | 🔴 HIGH | 1-2h | Needs Track 4 to provide credentials + locked schema (`logs`, `decisions`, `telemetry` tables). The `agent.py` already has the logging stub — just needs real credentials. |
| **Live API Testing** | 🟡 MEDIUM | 2-3h | Test with real API keys (Electricity Maps, OpenWeatherMap, API-Football). Currently uses fallback data. |
| **DefiLlama Pool Matching** | 🟡 MEDIUM | 1h | Verify pool symbol matching logic works against live DefiLlama data. May need regex improvements. |
| **LLM Attribution Reasoning** | 🟢 LOW | 2-4h | Optional: integrate OpenAI to generate natural-language attribution explanations. Currently uses string templates. |
| **Error Recovery / Retries** | 🟢 LOW | 1h | Add exponential backoff retries for API failures. |
| **Unit Tests** | 🟢 LOW | 2-3h | Mock API responses and test attribution calculations. |
| **Demo Mode / Force Buy** | 🟢 LOW | 1h | Add `--demo-mode` flag that simulates a full transaction flow for the stage pitch. |

## Dependencies (Track 4)

- **Supabase Credentials**: Track 4 must provide `SUPABASE_URL` and `SUPABASE_KEY` by Hour 4
- **Supabase Schema**: Tables `logs`, `decisions`, `telemetry` must be locked

## Dependencies (External APIs) (to be added) via API kEYS

| API | Purpose | Free Tier? |
|---|---|---|
| [Electricity Maps](https://api.electricitymaps.com) | Grid carbon intensity | ✅ Free tier available |
| [OpenWeatherMap](https://openweathermap.org/api) | Stadium weather data | ✅ Free tier |
| [API-Football](https://www.api-football.com) | Live PSL match status | ⚠️ May need paid tier |
| [DefiLlama](https://defillama.com) | ReFi token prices & TVL | ✅ Completely free |
