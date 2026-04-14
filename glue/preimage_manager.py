"""
Preimage Manager
Determines which preimage from hash_chain.json to submit next,
by querying the live executionCount from the HashVault contract on-chain.

Hash-chain logic:
  - hash_chain.json["rootHash"]    → locked in contract at deploy time
  - hash_chain.json["preimages"][0] → submitted on execution #0
  - hash_chain.json["preimages"][n] → submitted on execution #n
  Contract verifies: keccak256(preimage[n]) == currentHash before advancing.
"""
import json
import os
import sys

from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

CHAIN_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hash_chain.json")

# Minimal ABI — only what we need
_VAULT_ABI = [
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
        "name": "currentHash",
        "outputs": [{"name": "", "type": "bytes32"}],
        "stateMutability": "view",
        "type": "function",
    },
]


def _get_web3():
    rpc = os.getenv("WIREFLUID_TESTNET_RPC_URL", "https://evm.wirefluid.com")
    return Web3(Web3.HTTPProvider(rpc))


def _get_vault(w3: Web3):
    address = os.getenv("HASH_VAULT_ADDRESS")
    if not address:
        raise EnvironmentError("HASH_VAULT_ADDRESS not set in .env")
    return w3.eth.contract(address=Web3.to_checksum_address(address), abi=_VAULT_ABI)


def load_chain() -> dict:
    """Load the pre-generated hash chain from disk."""
    with open(CHAIN_FILE, "r") as f:
        return json.load(f)


def get_on_chain_count() -> int:
    """Return how many executions have already happened on-chain."""
    w3 = _get_web3()
    vault = _get_vault(w3)
    return vault.functions.executionCount().call()


def get_next_preimage() -> tuple[int, str]:
    """
    Return (index, preimage_hex) for the next valid preimage to submit.
    Validates against the contract before returning.

    Raises:
        ValueError  – chain exhausted or preimage out of sync
        EnvironmentError – missing config
    """
    w3 = _get_web3()
    vault = _get_vault(w3)

    count = vault.functions.executionCount().call()
    chain = load_chain()
    preimages = chain["preimages"]

    if count >= len(preimages):
        raise ValueError(
            f"Hash chain exhausted! Used {count}/{len(preimages)} preimages."
        )

    preimage_hex = preimages[count]
    preimage_bytes = bytes.fromhex(preimage_hex.removeprefix("0x"))

    is_valid = vault.functions.validatePreimage(preimage_bytes).call()
    if not is_valid:
        raise ValueError(
            f"Preimage at index {count} failed on-chain validation. "
            f"Chain may be out of sync with contract state."
        )

    print(f"[PreimageManager] Using preimage #{count} (validated ✓)")
    return count, preimage_hex


def remaining_executions() -> int:
    """Return how many preimages are still available."""
    count = get_on_chain_count()
    chain = load_chain()
    return len(chain["preimages"]) - count


if __name__ == "__main__":
    try:
        count = get_on_chain_count()
        print(f"On-chain execution count : {count}")
        remaining = remaining_executions()
        print(f"Remaining preimages      : {remaining}")
        idx, preimage = get_next_preimage()
        print(f"Next preimage (#{idx})     : {preimage[:20]}...")
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)
