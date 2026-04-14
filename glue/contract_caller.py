"""
HashVault Contract Caller
Submits a preimage + carbon offset intent to HashVault.execute() on the
WireFluid Testnet (Chain ID: 92533) using web3.py.

Required env vars:
  WIREFLUID_TESTNET_RPC_URL   (default: https://evm.wirefluid.com)
  HASH_VAULT_ADDRESS          The deployed HashVault address
  DEPLOYER_PRIVATE_KEY        Wallet private key — no 0x prefix
"""
import os
import sys
import time

from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

# ── Full ABI for HashVault ────────────────────────────────────────────────────
HASH_VAULT_ABI = [
    {
        "inputs": [
            {"name": "_preimage", "type": "bytes32"},
            {"name": "_token", "type": "address"},
            {"name": "_amount", "type": "uint256"},
            {"name": "_wireFluidPayload", "type": "bytes"},
        ],
        "name": "execute",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "currentHash",
        "outputs": [{"name": "", "type": "bytes32"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "executionCount",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"name": "_preimage", "type": "bytes32"}],
        "name": "validatePreimage",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "remainingExecutions",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "executionCount", "type": "uint256"},
            {"indexed": True, "name": "preimage", "type": "bytes32"},
            {"indexed": False, "name": "token", "type": "address"},
            {"indexed": False, "name": "amount", "type": "uint256"},
        ],
        "name": "Executed",
        "type": "event",
    },
]


def _build_web3() -> Web3:
    rpc = os.getenv("WIREFLUID_TESTNET_RPC_URL", "https://evm.wirefluid.com")
    w3 = Web3(Web3.HTTPProvider(rpc))
    if not w3.is_connected():
        raise ConnectionError(f"Cannot connect to WireFluid RPC: {rpc}")
    return w3


def call_hash_vault(
    preimage_hex: str,
    token_address: str,
    amount_usdc_wei: int,
    wirefluid_payload: bytes,
    gas_limit: int = 250_000,
) -> dict:
    """
    Call HashVault.execute() on WireFluid testnet.

    Args:
        preimage_hex:       0x-prefixed preimage bytes32 from hash_chain.json
        token_address:      Carbon credit token address (e.g. BCT on Polygon)
        amount_usdc_wei:    Amount in USDC base units (6 decimals: $5 = 5_000_000)
        wirefluid_payload:  ABI-encoded WireFluid intent bytes
        gas_limit:          Gas ceiling for the transaction

    Returns:
        {"tx_hash": str, "status": "success"|"failed", "gas_used": int,
         "block": int, "execution_index": int}
    """
    raw_key = os.getenv("DEPLOYER_PRIVATE_KEY", "")
    if not raw_key:
        raise EnvironmentError("DEPLOYER_PRIVATE_KEY not set in .env")
    vault_addr = os.getenv("HASH_VAULT_ADDRESS", "")
    if not vault_addr:
        raise EnvironmentError("HASH_VAULT_ADDRESS not set in .env")

    # Strip 0x prefix from private key if present
    private_key = raw_key.removeprefix("0x")

    w3 = _build_web3()
    account = w3.eth.account.from_key(private_key)
    vault = w3.eth.contract(
        address=Web3.to_checksum_address(vault_addr), abi=HASH_VAULT_ABI
    )

    preimage_bytes = bytes.fromhex(preimage_hex.removeprefix("0x"))
    token_checksum = Web3.to_checksum_address(token_address)

    print(f"[ContractCaller] Wallet   : {account.address}")
    print(f"[ContractCaller] Contract : {vault_addr}")
    print(f"[ContractCaller] Preimage : {preimage_hex[:20]}...")
    print(f"[ContractCaller] Token    : {token_checksum}")
    print(f"[ContractCaller] Amount   : {amount_usdc_wei} (USDC wei = ${amount_usdc_wei/1e6:.4f})")

    # Get balance to warn if low
    balance_wei = w3.eth.get_balance(account.address)
    balance_wire = w3.from_wei(balance_wei, "ether")
    print(f"[ContractCaller] Balance  : {balance_wire:.6f} WIRE")
    if balance_wire < 0.01:
        print("[ContractCaller] ⚠️  Low balance — get more from the WireFluid faucet!")

    # Build transaction
    nonce = w3.eth.get_transaction_count(account.address)
    gas_price = w3.eth.gas_price

    tx = vault.functions.execute(
        preimage_bytes,
        token_checksum,
        amount_usdc_wei,
        wirefluid_payload,
    ).build_transaction(
        {
            "chainId": 92533,  # WireFluid Testnet
            "from": account.address,
            "nonce": nonce,
            "gas": gas_limit,
            "gasPrice": gas_price,
        }
    )

    # Sign and broadcast
    signed = account.sign_transaction(tx)
    print("[ContractCaller] Broadcasting transaction...")
    try:
        raw_tx = getattr(signed, "raw_transaction", None) or signed.rawTransaction
        tx_hash = w3.eth.send_raw_transaction(raw_tx)
    except Exception as e:
        raise RuntimeError(f"Transaction broadcast failed: {e}") from e

    tx_hash_hex = "0x" + tx_hash.hex() if not tx_hash.hex().startswith("0x") else tx_hash.hex()
    print(f"[ContractCaller] TX Hash  : {tx_hash_hex}")
    print(f"[ContractCaller] Explorer : https://wirefluidscan.com/tx/{tx_hash_hex}")

    # Wait for receipt
    print("[ContractCaller] Waiting for confirmation...")
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

    status = "success" if receipt.status == 1 else "failed"
    execution_count = vault.functions.executionCount().call()

    print(f"[ContractCaller] Status   : {status.upper()} (block #{receipt.blockNumber})")
    print(f"[ContractCaller] Gas used : {receipt.gasUsed}")
    print(f"[ContractCaller] Executions used: {execution_count}/1000")

    return {
        "tx_hash": tx_hash_hex,
        "status": status,
        "gas_used": receipt.gasUsed,
        "block": receipt.blockNumber,
        "execution_index": execution_count - 1,
        "explorer_url": f"https://wirefluidscan.com/tx/{tx_hash_hex}",
    }


if __name__ == "__main__":
    # Quick connectivity test (read-only — no broadcast)
    print("=== HashVault Connectivity Test ===")
    try:
        w3 = _build_web3()
        print(f"Connected: {w3.is_connected()} | Block: {w3.eth.block_number}")

        vault_addr = os.getenv("HASH_VAULT_ADDRESS", "")
        if vault_addr:
            vault = w3.eth.contract(
                address=Web3.to_checksum_address(vault_addr), abi=HASH_VAULT_ABI
            )
            count = vault.functions.executionCount().call()
            remaining = vault.functions.remainingExecutions().call()
            print(f"HashVault @ {vault_addr}")
            print(f"  executionCount    : {count}")
            print(f"  remainingExecutions: {remaining}")
        else:
            print("HASH_VAULT_ADDRESS not set — skipping contract read")
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)
