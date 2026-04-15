# Carbon Sentinel - Autonomous Carbon Offsetting for Live Sports

## Project Overview

Carbon Sentinel is an innovative autonomous protocol that uses cryptographic hash-chains to enable zero-latency, signature-less cross-chain transactions for real-time carbon offsetting during live sports events. The system automatically neutralizes the carbon footprint of professional cricket matches (PSL) by purchasing carbon credits on the cheapest available ReFi markets.

## Core Innovation

**Hash-Chain Authorization**: Instead of expensive ECDSA signatures (~65k gas), Carbon Sentinel uses a pre-computed keccak256 hash chain where each transaction consumes the next "preimage" as authorization (~30k gas), enabling high-frequency autonomous execution.

**AI-Powered Attribution**: An intelligent agent disaggregates stadium-specific carbon emissions from ambient city load using real-time data from Electricity Maps, weather APIs, and sports feeds.

**Cross-Chain Execution**: Integrates with WireFluid for seamless bridging and swapping across chains (Base, Polygon, Celo) to find the cheapest carbon credits (BCT, NCT, MCO2, UBO).

## Architecture

The project follows a "Tri-Layer Architecture" with four specialized tracks:

### Track 1: The Muscle (Smart Contracts)
- **HashVault.sol**: Signature-less execution vault using cryptographic hash-chains
- **Gas Target**: ~30,000 gas per transaction (vs 65,000 for ECDSA)
- **Security**: Single-use preimages prevent replay attacks
- **WireFluid Integration**: Accepts opaque payloads for cross-chain intent execution

### Track 2: The Brain (AI Agent)
- **Autonomous Auditor**: Python-based agent that calculates stadium-specific carbon debt
- **Data Sources**: 
  - Electricity Maps API (grid carbon intensity)
  - OpenWeatherMap API (temperature/humidity for AC load factor)
  - Sports API (PSL match status and floodlight inference)
- **DefiLlama Integration**: Scrapes multi-chain ReFi pools for cheapest carbon credits
- **Attribution Engine**: Disaggregates stadium load from city baseline using weather and match data

### Track 3: The Pulse (Frontend Dashboard)
- **Real-time Visualization**: Next.js 15 + Shadcn UI + Recharts/D3
- **3-Screen Layout**:
  - Left: AI agent terminal logs
  - Center: Attribution chart (stadium vs city emissions)
  - Right: Transaction flow visualization
- **User Controls**: Budget management, agent revocation, force-buy triggers

### Track 4: The Glue (Infrastructure & Orchestration)
- **Hash Chain Generation**: `generate_chain.py` creates the cryptographic root
- **WireFluid Encoder**: JSON decisions → ABI-encoded bytecode
- **Supabase Backend**: Real-time logging and user control tables
- **Execution Orchestrator**: Python-to-blockchain bridge with retry logic

## Key Features

### Autonomous Execution
- Zero human intervention required after initial setup
- Budget gates and user controls prevent runaway spending
- Real-time decision making during live matches

### Intelligent Attribution
- Isolates stadium floodlights from city AC usage during heatwaves
- Accounts for spectator travel (Scope 3 emissions) when enabled
- Weather-adjusted load disaggregation

### Cross-Chain Optimization
- Compares carbon credit prices across Polygon, Celo, and Base
- Automatic bridging and swapping via WireFluid
- TVL-weighted liquidity analysis

### User Sovereignty
- Complete control over agent behavior
- Emergency kill-switches and budget limits
- Force-buy capability for manual interventions

## Technical Stack

### Backend
- **Python 3.9+**: Core agent and data processing
- **Web3.py**: Blockchain interaction
- **Supabase**: Real-time database and user controls
- **Flask**: REST API for frontend integration

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Shadcn UI + Tailwind**: Modern component library
- **Recharts + D3**: Data visualization
- **Zustand**: State management

### Blockchain
- **Solidity 0.8.20**: Smart contracts
- **Foundry**: Testing and deployment
- **WireFluid Testnet**: Cross-chain execution layer
- **Base/Polygon/Celo**: Target chains for carbon credits

### APIs & Data Sources
- **Electricity Maps**: Grid carbon intensity data
- **OpenWeatherMap**: Weather conditions
- **API-Football**: PSL match data
- **DefiLlama**: ReFi pool analytics

## Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- Foundry (for smart contracts)
- Git

### Environment Setup
1. Clone the repository
2. Copy `.env.example` to `.env` and fill in API keys
3. Install Python dependencies: `pip install -r requirements.txt`
4. Install Node dependencies: `cd frontend && npm install`
5. Install Foundry dependencies: `cd contracts && forge install`

### Smart Contract Deployment
1. Generate hash chain: `python glue/generate_chain.py`
2. Deploy HashVault: Update `foundry.toml` with RPC URLs and deploy
3. Update contract addresses in environment variables

### Database Setup
1. Create Supabase project
2. Run migrations in `glue/migrations/`
3. Configure Supabase URL and keys in `.env`

## Usage

### Starting the Agent
```bash
# Run autonomous audit cycle
python sentinel_core/agent.py

# Force-buy mode
python sentinel_core/agent.py --force-buy 5.0

# Loop mode with interval
python sentinel_core/agent.py --loop --interval 60
```

### Starting the Frontend
```bash
cd frontend
npm run dev
```

### Starting the API Server
```bash
python glue/api_server.py
```

## API Documentation

### REST Endpoints
- `GET /api/status`: Agent status and recent activity
- `GET /api/ledger`: Carbon offset transaction history
- `POST /api/config`: Update user agent configuration
- `POST /api/force-buy`: Trigger manual carbon purchase

### Decision Payload Format
```json
{
  "match_id": "PSL_2026_01",
  "calculated_footprint_kg": 450.5,
  "target_token": "0x2F800Db0fdb5223b3C3f354886d907A671414A7F",
  "source_chain": "Base",
  "dest_chain": "Polygon",
  "amount_usd": 0.675,
  "amount_usdc_wei": 675000,
  "metadata": {
    "attribution_ratio": 0.0847,
    "floodlights_on": true,
    "city_ac_load_factor": 1.32,
    "token_symbol": "BCT",
    "tvl_usd": 500000,
    "price_per_tonne_usd": 1.5
  }
}
```

## Configuration

### Environment Variables
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase anon key
- `HASH_VAULT_ADDRESS`: Deployed contract address
- `DEPLOYER_PRIVATE_KEY`: Wallet private key
- `ELECTRICITY_MAPS_TOKEN`: Electricity Maps API key
- `WEATHER_API_KEY`: OpenWeatherMap API key
- `WIREFLUID_TESTNET_RPC_URL`: WireFluid RPC endpoint

### User Controls
- `budget_usd`: Total spending limit
- `max_tx_usd`: Per-transaction limit
- `is_active`: Master kill-switch
- `auto_execute`: Allow autonomous transactions
- `spectatorless_mode`: Skip Scope 3 emissions

## Testing

### Smart Contract Tests
```bash
cd contracts
forge test
```

### Gas Benchmarks
```bash
forge test --match-test test_GasUnder30k
```

## Deployment

### Production Setup
1. Deploy smart contracts to mainnet
2. Set up production Supabase instance
3. Configure production API keys
4. Deploy frontend to Vercel/Netlify
5. Set up monitoring and alerts

### Monitoring
- Supabase logs for agent activity
- On-chain transaction monitoring
- API rate limit tracking
- Budget utilization alerts

## Security Considerations

### Cryptographic Security
- Hash-chain prevents unauthorized execution
- Single-use preimages prevent replay
- Root hash locked in immutable contract

### User Controls
- Budget limits prevent overspending
- Kill-switches for emergency stops
- Force-buy requires explicit user action

### API Security
- Environment variable storage for secrets
- Rate limiting on external APIs
- Fallback mechanisms for API failures

## Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

### Code Standards
- Python: Black formatting, type hints
- TypeScript: ESLint, Prettier
- Solidity: Foundry standards
- Commit messages: Conventional commits

### Testing Requirements
- Unit tests for all new features
- Integration tests for API interactions
- Gas benchmarks for contract changes

## License

MIT License - see LICENSE file for details

## Acknowledgments

- WireFluid for cross-chain infrastructure
- Electricity Maps for carbon intensity data
- DefiLlama for ReFi analytics
- Toucan Protocol for carbon credit infrastructure

## Demo Script

For hackathon presentations, the system targets live PSL matches with:
- Real-time attribution visualization
- On-chain transaction tracing
- User control demonstrations
- Fail-safe manual override buttons

The demo showcases autonomous execution while maintaining user sovereignty and fiduciary intelligence.