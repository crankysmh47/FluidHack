import os
from eth_abi import encode
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

def encode_wirefluid_payload(decision: dict) -> str:
    encoded = encode(
        ['string', 'uint256', 'address', 'string', 'string'],
        [
            decision['match_id'],
            int(decision['calculated_footprint_kg'] * 1e18),
            decision['target_token'],
            decision['source_chain'],
            decision['dest_chain']
        ]
    )
    return encoded.hex()


def process_pending_decisions():
    # Fetch all pending decisions from Supabase
    result = supabase.table('decisions') \
        .select('*') \
        .eq('status', 'pending') \
        .execute()

    for decision in result.data:
        print(f"Encoding decision: {decision['match_id']}")
        
        payload_hex = encode_wirefluid_payload(decision)
        
        # Save encoded payload back to Supabase
        supabase.table('decisions').update({
            'encoded_payload': payload_hex,
            'status': 'encoded'
        }).eq('id', decision['id']).execute()

        print(f"✅ Encoded: {payload_hex[:40]}...")


# --- Test with sample data ---
if __name__ == "__main__":
    sample = {
        "match_id": "PSL_2026_01",
        "calculated_footprint_kg": 450.5,
        "target_token": "0x1234567890123456789012345678901234567890",
        "source_chain": "Base",
        "dest_chain": "Polygon"
    }

    hex_output = encode_wirefluid_payload(sample)
    print("Sample encoded payload:")
    print(hex_output)
