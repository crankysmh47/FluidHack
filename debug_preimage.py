import os
from web3 import Web3
from dotenv import load_dotenv
import json

load_dotenv(dotenv_path=".env", override=True)

rpc = "https://evm.wirefluid.com"
w3 = Web3(Web3.HTTPProvider(rpc))
vault_address = os.getenv("HASH_VAULT_ADDRESS")

_VAULT_ABI = [
    {
        "inputs": [],
        "name": "currentHash",
        "outputs": [{"name": "", "type": "bytes32"}],
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
]

vault = w3.eth.contract(address=Web3.to_checksum_address(vault_address), abi=_VAULT_ABI)

current_hash = vault.functions.currentHash().call()
print(f"Vault Address: {vault_address}")
print(f"On-chain Current Hash: {current_hash.hex()}")

with open("glue/hash_chain.json", "r") as f:
    chain = json.load(f)

p1 = chain["preimages"][0]
print(f"Local P1: {p1}")

# Try validation
is_valid = vault.functions.validatePreimage(bytes.fromhex(p1.replace("0x", ""))).call()
print(f"Validation result: {is_valid}")
