"""
WireFluid Payload Encoder (upgraded)
Encodes a carbon offset decision into the bytes payload passed to
HashVault.execute() ? IWireFluid.route().

In stub mode (wireFluid = address(1)), this payload is ignored by the chain
but is still correctly formed for when the real WireFluid router is provided.

Encoding schema (ABI-packed):
  (string matchId, uint256 footprintKgWei, address tokenAddress,
   string sourceChain, string destChain, uint256 amountUsdcWei)
"""

import os
import sys
from eth_abi import encode
from dotenv import load_dotenv

load_dotenv()


def encode_wirefluid_payload(decision: dict) -> bytes:
    """
    Encode the agent's decision dict into ABI bytes for IWireFluid.route().

    Args:
        decision: The full decision dict from agent._build_decision(), which must include:
            - match_id (str)
            - calculated_footprint_kg (float)
            - target_token (str)     - ERC-20 address
            - source_chain (str)
            - dest_chain (str)
            - amount_usdc_wei (int)  - USDC base units (6 decimals)

    Returns:
        ABI-encoded bytes
    """
    match_id = decision.get("match_id", "UNKNOWN")
    footprint_kg = float(decision.get("calculated_footprint_kg", 0.0))
    footprint_kg_wei = int(footprint_kg * 1e18)  # scale to uint256
    token_address = decision.get("target_token", "0x0000000000000000000000000000000000000000")
    source_chain = decision.get("source_chain", "WireFluid")
    dest_chain = decision.get("dest_chain", "Polygon")
    amount_usdc_wei = int(decision.get("amount_usdc_wei", 0))

    payload = encode(
        ["string", "uint256", "address", "string", "string", "uint256"],
        [
            match_id,
            footprint_kg_wei,
            token_address,
            source_chain,
            dest_chain,
            amount_usdc_wei,
        ],
    )
    return payload


def decode_wirefluid_payload(payload: bytes) -> dict:
    """Decode a payload back to a dict (for debugging/verification)."""
    from eth_abi import decode as abi_decode

    decoded = abi_decode(
        ["string", "uint256", "address", "string", "string", "uint256"],
        payload,
    )
    return {
        "match_id": decoded[0],
        "footprint_kg": decoded[1] / 1e18,
        "token_address": decoded[2],
        "source_chain": decoded[3],
        "dest_chain": decoded[4],
        "amount_usdc_wei": decoded[5],
    }


if __name__ == "__main__":
    # -- Test encode / decode round-trip --------------------------------------
    sample = {
        "match_id": "PSL_2026_01",
        "calculated_footprint_kg": 450.5,
        "target_token": "0x2F800Db0fdb5223b3C3f354886d907A671414A7F",
        "source_chain": "WireFluid",
        "dest_chain": "Polygon",
        "amount_usdc_wei": 5_000_000,  # $5.00 USDC
    }

    payload = encode_wirefluid_payload(sample)
    print(f"Encoded payload ({len(payload)} bytes):")
    print(f"  0x{payload.hex()[:80]}...")

    decoded = decode_wirefluid_payload(payload)
    print("\nDecoded:")
    for k, v in decoded.items():
        print(f"  {k}: {v}")
