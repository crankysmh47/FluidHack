import os
import sys
import time
from supabase import create_client
from dotenv import load_dotenv

# Allow running from glue/ directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from wirefluid_encoder import encode_wirefluid_payload

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

def process_new_decisions():
    result = supabase.table('decisions') \
        .select('*') \
        .eq('status', 'pending') \
        .execute()

    for decision in result.data:
        print(f"🔄 New decision detected: {decision['match_id']}")

        # Step 1: Encode the payload
        payload_hex = encode_wirefluid_payload(decision)
        print(f"✅ Encoded payload: {payload_hex[:40]}...")

        # Step 2: Update status to 'encoded' in Supabase
        supabase.table('decisions').update({
            'encoded_payload': payload_hex,
            'status': 'encoded'
        }).eq('id', decision['id']).execute()
        print(f"✅ Supabase updated to 'encoded'")

        # Step 3: TODO - call smart contract here (Track 1 ABI needed)
        # This will be filled once Track 1 shares their contract address + ABI
        print(f"⏳ Waiting for Track 1 ABI to trigger contract...")


# --- Poll every 10 seconds for new decisions ---
if __name__ == "__main__":
    print("🚀 Execution trigger running... polling every 10 seconds")
    while True:
        process_new_decisions()
        time.sleep(10)
