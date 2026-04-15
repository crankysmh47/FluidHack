import requests

# DefiLlama public API - no key required
POOLS_URL = "https://yields.llama.fi/pools"
COINS_URL = "https://coins.llama.fi/prices/current"

# Carbon credit tokens to track across chains
CARBON_TOKENS = {
    "BCT":  "polygon:0x2f800db0fdb5223b3c3f354886d907a671414a7",   # Base Carbon Tonne - Polygon
    "NCT":  "polygon:0xd838290e877e0188a4a44700463419ed96c16107",   # Nature Carbon Tonne - Polygon
    "MCO2": "celo:0x32a9fe697a32135bfd313a6ac28792dae4d9979d",       # Moss Carbon Credit - Celo
    "TOUCAN": "polygon:0x5786d3754443c0df46da5855b42f37b8c4b4e24",  # Toucan - Polygon
}

# Protocols known to host ReFi pools
REFI_PROTOCOLS = {"uniswap-v3", "sushiswap", "klimadao", "toucan", "moss", "ubeswap"}


def get_token_prices(token_addresses: dict) -> dict:
    """
    Fetches current USD prices for carbon credit tokens via DefiLlama Coins API.

    Args:
        token_addresses: Dict of {symbol: chain:address}

    Returns:
        Dict of {symbol: {"price": float, "chain": str}}
    """
    joined = ",".join(token_addresses.values())
    response = requests.get(f"{COINS_URL}/{joined}")
    response.raise_for_status()
    raw = response.json().get("coins", {})

    results = {}
    for symbol, addr in token_addresses.items():
        entry = raw.get(addr)
        if entry:
            results[symbol] = {
                "price_usd": entry.get("price"),
                "chain": addr.split(":")[0],
                "address": addr.split(":")[1],
            }
        else:
            results[symbol] = {"price_usd": None, "chain": addr.split(":")[0]}

    return results


def get_refi_pools() -> list[dict]:
    """
    Fetches all yield pools from DefiLlama and filters for ReFi/carbon credit ones.

    Returns:
        List of relevant pool dicts sorted by TVL descending.
    """
    response = requests.get(POOLS_URL)
    response.raise_for_status()
    all_pools = response.json().get("data", [])

    carbon_symbols = set(CARBON_TOKENS.keys())

    filtered = []
    for pool in all_pools:
        symbol = pool.get("symbol", "").upper()
        project = pool.get("project", "").lower()

        # Match if pool symbol contains a carbon token OR it's a known ReFi protocol
        if any(tok in symbol for tok in carbon_symbols) or project in REFI_PROTOCOLS:
            filtered.append({
                "pool_id":  pool.get("pool"),
                "protocol": pool.get("project"),
                "chain":    pool.get("chain"),
                "symbol":   pool.get("symbol"),
                "tvl_usd":  pool.get("tvlUsd"),
                "apy":      pool.get("apy"),
            })

    return sorted(filtered, key=lambda x: x["tvl_usd"] or 0, reverse=True)


def find_cheapest_offset(token_prices: dict) -> dict:
    """
    Identifies the cheapest carbon credit token by USD price.

    Args:
        token_prices: Output from get_token_prices()

    Returns:
        Dict with the cheapest token's details.
    """
    available = {k: v for k, v in token_prices.items() if v["price_usd"] is not None}
    if not available:
        return {}

    cheapest = min(available, key=lambda k: available[k]["price_usd"])
    return {"token": cheapest, **available[cheapest]}


def print_report(prices: dict, pools: list[dict], cheapest: dict) -> None:
    print("\n=== Carbon Credit Token Prices ===")
    for symbol, data in prices.items():
        price = f"${data['price_usd']:.4f}" if data["price_usd"] else "N/A"
        print(f"  {symbol:<8} {price:<12} on {data['chain'].capitalize()}")

    print("\n=== Top ReFi Liquidity Pools (by TVL) ===")
    for pool in pools[:10]:
        tvl = f"${pool['tvl_usd']:,.0f}" if pool["tvl_usd"] else "N/A"
        apy = f"{pool['apy']:.2f}%" if pool["apy"] else "N/A"
        print(f"  [{pool['chain']:<10}] {pool['protocol']:<15} {pool['symbol']:<20} TVL: {tvl:<14} APY: {apy}")

    print("\n=== AI Recommendation: Cheapest Offset ===")
    if cheapest:
        print(f"  Token:   {cheapest['token']}")
        print(f"  Price:   ${cheapest['price_usd']:.4f}")
        print(f"  Chain:   {cheapest['chain'].capitalize()}")
        print(f"  Address: {cheapest.get('address', 'N/A')}")
    else:
        print("  Could not determine cheapest token (price data unavailable).")


if __name__ == "__main__":
    try:
        print("Fetching carbon credit token prices...")
        prices = get_token_prices(CARBON_TOKENS)

        print("Fetching ReFi liquidity pools...")
        pools = get_refi_pools()

        cheapest = find_cheapest_offset(prices)

        print_report(prices, pools, cheapest)

        # This is the payload format for Track 2 -> Track 4
        if cheapest:
            decision_payload = {
                "target_token": cheapest["token"],
                "token_address": cheapest.get("address"),
                "dest_chain": cheapest["chain"].capitalize(),
                "price_usd": cheapest["price_usd"],
            }
            print(f"\n=== Decision Payload (for Track 4) ===")
            print(f"  {decision_payload}")

    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        print(f"Error: {e}")
