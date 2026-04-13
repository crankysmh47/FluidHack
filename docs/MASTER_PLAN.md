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


## Full Project descriptions

### **Project Title: Carbon Sentinel**
> **Elevator Pitch:** Carbon Sentinel is an autonomous, zero-latency agentic protocol. It utilizes cryptographic hash-chains to allow an AI agent to execute high-frequency cross-chain transactions via WireFluid—automatically neutralizing the carbon footprint of live PSL matches in real-time, without human signatures or budget-draining deterministic errors.
> 
### **1. The Core Problems**
**The Technical Problem: The Agentic Bottleneck**
If an autonomous AI agent has to use a heavy ECDSA wallet signature for every micro-transaction, it causes severe network latency and exorbitant gas costs. If it relies on a human to click "Approve" on MetaMask, it isn't truly autonomous.
**The Business Problem: The Attribution Flaw**
Corporate sponsors (like HBL) have massive ESG budgets, but current Web3 automation is too brittle to manage them. If a city-wide heatwave causes the power grid to spike during a PSL match, a deterministic "dumb script" will blindly drain the sponsor's budget to offset the entire city's air conditioning footprint. Sponsors need a system with fiduciary intelligence, not just an algorithmic alarm clock.
### **2. The Tri-Layer Architecture**
Carbon Sentinel separates intelligence, security, and execution into three distinct layers to ensure a flawless, 48-hour deliverable.
#### **Layer 1: The Brain (Contextual AI & Routing)**
A Python-based AI agent acts as the autonomous auditor. It does not use heavy local models; it relies on high-speed API tool-calling to synthesize unstructured reality.
 * **Data Ingestion:** It ingests the Electricity Maps API (for grid intensity), live sports APIs (for match status), and local weather data.
 * **The Search:** Instead of relying on WireFluid to find the cheapest token, the Python agent natively pings the DefiLlama API to scrape multi-chain ReFi liquidity pools (e.g., comparing BCT on Polygon vs. MCO2 on Celo).
 * **The Output:** It formulates the precise execution payload (e.g., Buy 50 BCT on Polygon).
#### **Layer 2: The Muscle (Cryptographic Hash-Chains)**
To bypass the MetaMask bottleneck, the architecture uses a 1990s cryptographic primitive adapted for the EVM.
 * **The Anchor:** The sponsor signs *one* standard transaction to lock a $10,000 budget and a single "Root Hash" into the Carbon Sentinel Smart Contract.
 * **The Execution:** When the AI decides to execute, it bypasses wallet signatures entirely. It simply submits the next mathematically linked hash (the preimage) alongside its payload to the contract.
#### **Layer 3: The Engine (WireFluid)**
WireFluid handles the plumbing. Once the smart contract instantly verifies the keccak256 hash, it emits the intent. WireFluid automatically routes the USDC from the vault, bridges it to the destination chain chosen by the AI, swaps it, and retires the carbon credit.
### **3. The Design Defenses (For the Judges)**
If technical judges interrogate the architecture, these are the strict defensive arguments built into the project design:
**Defense 1: Gas Optimization via Cryptography**
 * *The Argument:* "By anchoring once and executing via hash preimages, we cut the EVM authorization cost from roughly 65,000 gas (for an ECDSA signature) down to approximately 30,000 gas (for a keccak256 verification). We achieved true agent autonomy while dropping authorization overhead by over 50%."
**Defense 2: The Need for AI over Deterministic Scripts**
 * *The Argument:* "We built an AI Agent instead of a 20-line cron job to solve the **Attribution Problem**. If a sudden heatwave hits Karachi during a match, a dumb script will blindly drain the sponsor's budget to offset civilian AC usage. Our AI ingests weather and stadium baselines, performs real-time load disaggregation, isolates the exact percentage of the grid spike caused by the stadium floodlights, and only routes funds for that specific footprint. We used an LLM because sponsors need a fiduciary that understands context, not a script that blindly spends."
**Defense 3: WireFluid as an Execution Layer, Not a Search Engine**
 * *The Argument:* "We didn't force WireFluid to scrape token prices. We built the AI to act as an environmental hedge fund—scraping global DefiLlama data to find the cheapest carbon credit, and using WireFluid strictly for its world-class cross-chain routing."
### **4. The Live Demo Execution (The Stage Pitch)**
The demo will target the live April 13th PSL match (Peshawar Zalmi vs. Multan Sultans at the National Stadium) to prove immediate utility.
 1. **The UI:** The judges see a Shadcn-powered dashboard built on Next.js, fueled by a Supabase backend to ensure real-time state synchronization (preventing serverless timeouts).
 2. **The Visual Split:** * *Left Screen (The Brain):* A live terminal showing the AI agent pulling the Sindh grid data, realizing the floodlights are burning dirty energy, and executing the DefiLlama API to find the cheapest offset.
   * *Center Screen (The Logic):* The **Attribution Chart** dynamically updating, visually separating the stadium's carbon footprint from the ambient city footprint based on current weather data.
   * *Right Screen (The Engine):* The hash is submitted, and the UI traces the WireFluid transaction—showing the seamless bridge and swap on-chain.
 3. **The Fail-Safe:** The UI includes a hidden "Force Buy" manual override button. If the venue Wi-Fi blocks the APIs or the testnet lags, clicking this button perfectly simulates the AI's execution to ensure the 3-minute pitch is flawless.
### **5. 48-Hour Sprint Roadmap**
| Phase | Hours | Technical Focus | Success Metric |
|---|---|---|---|
| **Phase 1: Foundation** | 0 - 12 | Deploy the Hash-Vault Smart Contract on Base/WireFluid testnet. Spin up Next.js frontend. | Vault accepts a root hash and verifies a manual preimage submission. |
| **Phase 2: The Brain** | 12 - 24 | Build Python script. Integrate Electricity Maps API, DefiLlama API, and basic LLM context logic. | Python script correctly identifies a spike and selects the cheapest token. |
| **Phase 3: The Engine** | 24 - 36 | Hook Python output to the Smart Contract. Integrate WireFluid SDK for cross-chain execution. | One end-to-end transaction successfully bridges and swaps on testnet. |
| **Phase 4: State & Polish** | 36 - 48 | Connect Python logs to Supabase for real-time frontend updates. Build the Attribution Chart. Record backup demo video. | A flawless, 3-minute stage presentation ready for the judges. |