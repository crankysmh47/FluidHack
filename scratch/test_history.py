"""Quick test: check local tx_hashes.jsonl and the history API endpoint."""
import json
import requests

# 1. Check local file
print("=== Local tx_hashes.jsonl ===")
with open("tx_hashes.jsonl", "r", encoding="utf-8") as f:
    lines = f.readlines()

recs = []
for line in lines:
    line = line.strip()
    if line:
        recs.append(json.loads(line))

print(f"Total records: {len(recs)}")
users = {}
for r in recs:
    uid = r.get("user_id", "unknown")
    users[uid] = users.get(uid, 0) + 1
print(f"By user: {users}")

print("\nLast 3 records:")
for r in recs[-3:]:
    print(f"  TX: {r.get('tx_hash', '?')[:40]}...")
    print(f"     user={r.get('user_id')} | ${r.get('amount_usd', 0)} | status={r.get('status')}")
    print(f"     logged_at={r.get('logged_at', '?')}")

# 2. Test API endpoint
print("\n=== API /user/demo_user/ledger/supabase ===")
try:
    r = requests.get("http://127.0.0.1:5000/user/demo_user/ledger/supabase?limit=5", timeout=5)
    d = r.json()
    print(f"HTTP {r.status_code} | ok={d['ok']} | records={len(d['data'])}")
    for rec in d["data"][:3]:
        print(f"  TX: {rec.get('tx_hash', '?')[:40]}... | ${rec.get('amount_usd', 0)}")
except Exception as e:
    print(f"API call failed: {e}")

# 3. Test local ledger endpoint too
print("\n=== API /ledger (local) ===")
try:
    r = requests.get("http://127.0.0.1:5000/ledger?per_page=5", timeout=5)
    d = r.json()
    print(f"HTTP {r.status_code} | ok={d['ok']} | total={d['data'].get('total', 0)}")
    for rec in d["data"].get("records", [])[:3]:
        print(f"  TX: {rec.get('tx_hash', '?')[:40]}... | ${rec.get('amount_usd', 0)}")
except Exception as e:
    print(f"API call failed: {e}")
