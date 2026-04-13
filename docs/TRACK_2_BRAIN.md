# Track 2: The Brain (AI Agent & Data Auditor)
**Role:** AI/Data Engineer | **Difficulty:** High

## 1. Objective
Build the autonomous auditor that calculates the "Stadium-Specific" carbon debt.

## 2. Key Dependencies
- **From Track 4 (H 4):** Receive Supabase credentials to begin logging live decisions.

## 3. The Output (Your "Contract" with Track 4)
You output a JSON decision. Track 4 is responsible for encoding this into blockchain bytecode.
```json
{
  "match_id": "PSL_2026_01",
  "calculated_footprint_kg": 450.5,
  "target_token": "0xTokenAddress",
  "source_chain": "Base",
  "dest_chain": "Polygon"
}
```

## 4. 48-Hour Task List
- **H 0-4:** Build API connectors (Electricity Maps/Sports).
- **H 4-12:** Integrate Supabase logging using credentials from Track 4.
- **H 12-24:** Finalize Attribution Engine (Stadium vs City logic).
- **H 24-48:** Implement DefiLlama Liquidity Scraper.
