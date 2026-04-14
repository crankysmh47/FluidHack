from eth_utils import keccak
import json
import os

def generate_keccak_chain(seed: bytes, length: int = 1000):
    """
    Generates an EVM-compatible Keccak-256 hash chain.
    """
    chain = []
    current_val = seed
    
    # Generate the chain using EVM's Keccak-256
    for _ in range(length + 1):
        current_val = keccak(current_val)
        # Store as standard hex strings
        chain.append(current_val.hex())
    
    # Reverse so that chain[0] is the ROOT
    reversed_chain = list(reversed(chain))
    
    data = {
        "rootHash": "0x" + reversed_chain[0],
        "preimages": ["0x" + p for p in reversed_chain[1:]],
        "seed_used": seed.hex()
    }
    
    with open("glue/hash_chain.json", "w") as f:
        json.dump(data, f, indent=4)
    
    print(f"✅ Keccak-256 Hash Chain Generated!")
    print(f"ROOT HASH (For Track 1): 0x{reversed_chain[0]}")
    print(f"Preimages saved to: glue/hash_chain.json")

if __name__ == "__main__":
    # Ensure glue directory exists
    os.makedirs("glue", exist_ok=True)
    # Generate 32 bytes of secure random entropy
    secure_seed = os.urandom(32)
    generate_keccak_chain(secure_seed)