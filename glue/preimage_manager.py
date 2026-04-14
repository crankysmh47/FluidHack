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
import sqlite3
import time

from web3 import Web3
from dotenv import load_dotenv

load_dotenv(override=True)

CHAIN_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hash_chain.json")
CACHE_DB = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".cache.sqlite")

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

def init_db():
    """Ensure the local cache table exists."""
    conn = sqlite3.connect(CACHE_DB)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS preimage_locks 
                 (idx INTEGER PRIMARY KEY, status TEXT, timestamp REAL)''')
    conn.commit()
    conn.close()

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
    Atomicly locks the index in SQLite to prevent concurrent double-spend.

    Raises:
        ValueError  – chain exhausted or preimage out of sync
        EnvironmentError – missing config
    """
    init_db()
    w3 = _get_web3()
    vault = _get_vault(w3)

    on_chain_count = vault.functions.executionCount().call()
    chain = load_chain()
    preimages = chain["preimages"]

    conn = sqlite3.connect(CACHE_DB)
    c = conn.cursor()

    try:
        # Find the first index that is >= on-chain count AND not locked in DB
        # This handles the case where multiple agents start near the same time.
        idx = on_chain_count
        while idx < len(preimages):
            # Try to atomicly lock this index
            try:
                c.execute("INSERT INTO preimage_locks (idx, status, timestamp) VALUES (?, ?, ?)",
                         (idx, 'LOCKED', time.time()))
                conn.commit()
                # Successfully locked idx
                break
            except sqlite3.IntegrityError:
                # This idx is already locked/used, skip to next
                idx += 1
        
        if idx >= len(preimages):
             raise ValueError(f"Hash chain exhausted! Used {on_chain_count} on-chain.")

        preimage_hex = preimages[idx]
        preimage_bytes = bytes.fromhex(preimage_hex.removeprefix("0x"))

        # Safety check: Is this preimage actually valid for the current chain state?
        # If idx > on_chain_count, we can't validate it against currentHash directly.
        # But we can at least check if idx is the very next one.
        if idx == on_chain_count:
            is_valid = vault.functions.validatePreimage(preimage_bytes).call()
            if not is_valid:
                # If it's the next one but invalid, maybe chain is totally desynced.
                # Mark as FAILED in DB and abort.
                c.execute("UPDATE preimage_locks SET status='FAILED' WHERE idx=?", (idx,))
                conn.commit()
                raise ValueError(f"Preimage #{idx} failed on-chain validation. Sync error.")

        print(f"[PreimageManager] Locked local index #{idx} (validated)")
        return idx, preimage_hex

    finally:
        conn.close()


def mark_used(idx: int):
    """Mark a preimage as successfully broadcasted and confirmed."""
    conn = sqlite3.connect(CACHE_DB)
    c = conn.cursor()
    c.execute("UPDATE preimage_locks SET status='USED' WHERE idx=?", (idx,))
    conn.commit()
    conn.close()

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
