# Carbon Sentinel: Autonomous ReFi for the Pakistan Super League (PSL)

![Carbon Sentinel Dashboard Banner](frontend_v2/public/psl_giants.png)

**Carbon Sentinel** is transforming the PSL into the world's first live carbon offsetting sports league. It is an autonomous, AI-driven protocol designed to execute zero-intervention carbon offset transactions for large-scale sporting events. Built during FluidHack, the protocol leverages the **WireFluid** testnet to provide an end-to-end, signature-less integration between real-world environmental data and on-chain decentralized finance (ReFi).

By targeting the Pakistan Super League (PSL), Carbon Sentinel showcases how high-emission events can autonomously neutralize their carbon footprint in real-time, completely eliminating the bureaucratic overhead traditionally associated with corporate ESG compliance.

---

## 🔥 Why This Matters (The Real-World Implication)
Mega sporting events like the PSL draw massive crowds and consume enormous amounts of energy (stadium floodlights, broadcasting equipment, city-wide AC surges during watch parties, and logistical transit operations for teams and fans). Historically, tracking and offsetting these emissions takes months of offline auditing.

Carbon Sentinel changes the paradigm. It acts as an **always-on, autonomous auditor and executor** that:
1. Detects live games in real-time via sports APIs.
2. Identifies the local energy grid's carbon intensity.
3. Automatically purchases and retires verified carbon credits on-chain matching the exact footprint of that specific match.

By decentralizing and automating environmental accountability, we make sustainability a programmatic guarantee rather than a corporate afterthought.

---

## 🌟 Key Features

### 1. The Disaggregated Carbon Attribution Engine
It's not enough to blindly estimate emissions. Carbon Sentinel uses a hyper-local **Attribution Engine** that intelligently isolates the stadium's load from the rest of the city's power grid.
- **Electricity Maps API:** Pulls live carbon intensity (gCO2eq/kWh) for the regional grid (e.g., Pakistan PK Zone).
- **WeatherAPI:** Computes city-wide AC load factors based on real-time temperature and humidity.
- **Sports Data (CricAPI):** Tracks match status, stadium location, and intelligently determines if high-consumption floodlights are active based on the time of day and schedule.

### 2. Autonomous Multi-Chain ReFi Execution
When an emission footprint is successfully calculated, the protocol's AI Agent automatically formulates a mitigation strategy.
- **DefiLlama Yield Aggregation:** The agent scrapes live on-chain data to find the most cost-effective and highly liquid carbon tokens (e.g., BCT, UBO, NCT) across L2 networks.
- **Cross-Chain Bridge Routing:** Demonstrating actual multichain mechanics, it seamlessly routes funding from the source chain (Base) to the destination execution chain (Polygon) where the carbon token liquidity resides.

### 3. WireFluid Architecture & Signature-less Security
A core requirement for an autonomous system is executing transactions safely without exposing hot wallet private keys to the open internet. **WireFluid's multi-chain signature-less intent architecture is the cornerstone of this protocol.**
- **Preimage Hash Chains:** The Executor utilizes pre-computed hash chains to authenticate transactions. The agent submits a valid preimage that mathematically proves authorization without ever requiring an ECDSA signature at the execution layer.
- **Gas Efficiency:** By offloading authorization to lightweight hash verification, the protocol achieves an estimated 40% reduction in gas fees compared to traditional smart wallets.
- **Intent-Based Execution:** The Agent broadcasts an intent on the WireFluid testnet, dictating the target ERC20 token and the precise USDC equivalent required for the offset, which the protocol then fulfills autonomously.

### 4. User Control & Governance (The Sandbox)
While the agent is autonomous, human oversight remains paramount.
- **Strict Budget Gates:** Users authorize specific financial allowances (e.g., $50 total budget, $5 max per-transaction). The agent will automatically cap its purchases to respect these boundaries, proving safe delegation of capital to AI.
- **Kill-Switch (Revoke):** A one-click mechanism allows sponsors or admins to instantly revoke the AI's execution authority.

### 5. Premium Glassmorphism Dashboard
The data is visualized through a bespoke, emerald-themed frontend built with React.
- **Live Ecosystem View:** Displays real-time offsets, active live matches, grid statistics, and an immutable on-chain transaction ledger.
- **Ecological Aesthetics:** Custom dynamic backgrounds and cursor interactions provide a highly polished, professional user experience that bridges the gap between complex blockchain mechanics and intuitive consumer UI.

---

## 🏗️ System Architecture

1. **Frontend (React / Vite):** The user-facing dashboard where sponsors connect wallets via WalletConnect/Wagmi, authorize budgets, and monitor agent activity.
2. **Backend API (Flask / Python):** Exposes programmatic endpoints for the frontend and triggers the AI Sentinel via an internal execution queue.
3. **The Brain (Groq LLM):** An AI prompt loop that ingests data from 4 discrete data sources (Electricity, Weather, Sports, DeFi) to output a deterministic JSON execution path.
4. **The Executor (WireFluid Hub):** Receives the JSON instruction, locks a local preimage cryptographic proof, and submits the intent payload directly to the WireFluid Testnet smart contracts.
5. **Ledger System:** All hashes are logged dual-layer—locally to a `jsonl` file to ensure zero data loss, and mirrored to Supabase for global read access by the front-end dashboard.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- A valid Groq API Key and standard data API keys (WeatherAPI, CricAPI, ElectricityMaps)

### Backend Setup
1. Clone the repository.
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and populate your keys. Make sure to include the `CRIC_API_KEY` and `WEATHER_API_KEY`.
4. Ensure your terminal utilizes UTF-8 encoding to support robust logging:
   *(Windows PowerShell)*
   ```powershell
   $env:PYTHONUTF8="1"
   $env:PYTHONIOENCODING="utf-8:replace"
   python glue/api_server.py
   ```

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend_v2
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the dashboard at `http://localhost:5173`.

---

## 🔐 Security Protocols in Action

1. **Terminal Hardening:** The Python execution backend is strictly engineered to catch and sanitize non-ASCII or localized `charmap` rendering errors, ensuring the AI agent's execution thread never crashes during a live cycle.
2. **Local Fallback Systems:** The transaction history and agent session architecture are designed with dual-redundancy. If the primary cloud database goes offline during a transaction, the executor gracefully falls back to local disk persistence, ensuring immutable accounting syncs when connection restores.
3. **Budget Hard-Stops:** The `user_control` layer enforces mathematical hard-stops. Even if the LLM hallucinates an instruction to buy $10,000 of carbon credits, the Executor preemptively intercepts the payload and caps it strictly to the user's pre-authorized spending threshold.

---

## 🏆 Hackathon Conclusion
Carbon Sentinel acts as the ultimate bridge between the physical world and decentralized intent-based finance. By utilizing WireFluid's execution environment, we have successfully created a protocol that can audit itself, fund its own ESG mandates, and execute cross-chain operations securely with zero human intervention. This is the future of corporate sustainability for the world's largest events.
