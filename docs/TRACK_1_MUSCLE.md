# Track 1: The Muscle (Smart Contracts & WireFluid)
**Role:** Protocol Engineer | **Difficulty:** Expert

## 1. Objective
Build a "signature-less" execution vault that uses cryptographic hash-chains to authorize high-frequency transactions.

## 2. Key Dependencies
- **From Track 4 (H 0):** Receive the `rootHash` to hardcode into your initial deployment.
- **From Track 4 (H 4):** Receive the WireFluid contract address on Testnet.


## 3. The Interface (Your "Contract" with Track 4)
```solidity
function execute(
    bytes32 _preimage, 
    address _token, 
    uint256 _amount, 
    bytes calldata _wireFluidPayload
) external;
```
*Note: You do NOT need to know what is in `_wireFluidPayload`. You simply pass it to the WireFluid contract.*

## 4. 48-Hour Task List
- **H 0-4:** Deploy `HashVault.sol` using the `rootHash` provided by Track 4.
- **H 4-12:** Unit test hash verification (30k gas target).
- **H 12-24:** Integrate WireFluid SDK for cross-chain intent emission.
- **H 24-48:** Final on-chain verification and ABI handoff to Track 4.
