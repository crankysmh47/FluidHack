# Carbon Sentinel: Master Engineering Blueprint (v2.0 - Gap-Free)

**Project Goal:** Autonomous, zero-latency carbon offsetting for live sports via WireFluid.
**Key Innovation:** Replacing slow ECDSA signatures with high-speed cryptographic hash-chains (30k gas vs 65k gas).

---

## 1. Critical "Hour 0" Milestones (The Synchronizer)
To prevent bottlenecks, these tasks MUST be completed before anyone else starts:
1. **Track 4 (Glue):** Run `generate_chain.py` to produce the **Root Hash**.
2. **Track 4 (Glue) -> Track 1:** Provide the `rootHash` for the Smart Contract deployment.
3. **Track 4 (Glue) -> All Tracks:** Lock the Supabase Schema and share credentials by **Hour 4**.

---

## 2. Module Difficulty & Skill Matrix

| Module | Track | Difficulty | Core Skills Required |
| :--- | :--- | :--- | :--- |
| **The Muscle** | Track 1 | **Expert** | Solidity, EIP-712/Hashing, WireFluid SDK, Gas Optimization |
| **The Brain** | Track 2 | **High** | Python, API Orchestration (DefiLlama/Electricity Maps), Data Disaggregation |
| **The Pulse** | Track 3 | **Medium** | Next.js 15, Shadcn UI, Real-time Data Viz (Recharts/D3) |
| **The Glue** | Track 4 | **Medium** | Supabase, Webhooks, WireFluid Encoding (JSON -> Bytecode), System Orchestration |

---

## 3. Technical Contracts (Inter-Track Interfaces)

### A. The Smart Contract Interface (Track 1 ↔ Track 4)
Track 1 provides this; Track 4 calls this.
```solidity
function execute(
    bytes32 _preimage, 
    address _token, 
    uint256 _amount, 
    bytes calldata _wireFluidPayload
) external;
```
*Note: Track 4 is responsible for encoding the `_wireFluidPayload` bytecode.*

### B. The Decision Payload (Track 2 ↔ Track 4)
Track 2 outputs this JSON; Track 4 encodes it into WireFluid bytecode.
```json
{
  "match_id": "PSL_2026_01",
  "calculated_footprint_kg": 450.5,
  "target_token": "0xTokenAddress",
  "source_chain": "Base",
  "dest_chain": "Polygon"
}
```

---

## 4. 48-Hour Concurrent Roadmap

| Phase | Track 1 (Muscle) | Track 2 (Brain) | Track 3 (Pulse) | Track 4 (Glue) |
| :--- | :--- | :--- | :--- | :--- |
| **H 0 - 4** | **Deploy** Vault with `rootHash` from Track 4. | API Wrappers | UI Skeleton | **Generate Hash Chain** & **Lock Supabase Schema**. |
| **H 4 - 12** | Test preimage walk-back logic. | Disaggregation Logic | Connect to Supabase | Implement WireFluid Encoder. |
| **H 12-24** | Integrate WireFluid SDK. | Attribution Engine | Real-time Log View | Python-to-Supabase Bridge. |
| **H 24-48** | Final Verification | Liquidity Scraper | D3 Charts | Execution Trigger. |
