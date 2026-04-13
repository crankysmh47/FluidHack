# HashVault — Solidity Contracts

The **Muscle** layer of Carbon Sentinel. A signature-less execution vault powered by a Keccak-256 hash chain.

## Structure
```
contracts/
├── src/
│   ├── HashVault.sol           # Core vault contract
│   └── interfaces/
│       └── IWireFluid.sol      # WireFluid router interface
├── test/
│   └── HashVault.t.sol         # Foundry unit tests
├── script/
│   └── Deploy.s.sol            # Deployment script
├── .env.example                # Required env vars
└── foundry.toml                # Foundry config
```

## Quickstart

### Prerequisites
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Build & Test
```bash
cd contracts

# Install forge-std (standard library)
forge install foundry-rs/forge-std --no-commit

# Compile
forge build

# Run all tests
forge test -vvv

# Gas report (critical: execute() should be <30k)
forge test --gas-report
```

### Deploy (BLOCKED until WireFluid address received)
```bash
# 1. Copy env template
cp .env.example .env

# 2. Fill in .env (DEPLOYER_PRIVATE_KEY, BASE_SEPOLIA_RPC_URL, WIRE_FLUID in Deploy.s.sol)

# 3. Dry run
forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL

# 4. Live broadcast
forge script script/Deploy.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY
```

## Key Values
| Item | Value |
|------|-------|
| `rootHash` | `0xd72ab163d6233bd0810afd53cb4f45753851e87035266adbfe006c74e9f2fb7a` |
| First preimage | `0x8167ea58129ec8c2f402b2575c238d9444aeed75b60b4cbcb55e7d42e62f5abf` |
| Gas target for `execute()` | < 30,000 gas |

## Interface for Track 4
```solidity
function execute(
    bytes32 _preimage,
    address _token,
    uint256 _amount,
    bytes calldata _wireFluidPayload
) external;
```
