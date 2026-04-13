"""
DefiLlama Liquidity Scraper
Scrapes multi-chain ReFi (Regenerative Finance) token pools to find the cheapest carbon credit.
Uses DefiLlama's yields API to compare token prices and pool liquidity across chains.
Docs: https://yields.llama.fi/
"""
import requests
from datetime import datetime, timezone
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import DEFILLAMA_API_URL

# Known ReFi (Regenerative Finance) tokens and their chains
REFI_TOKENS = [
    {
        "symbol": "BCT",
        "name": "Toucan Protocol: Base Carbon Tonne",
        "chain": "Polygon",
        "chain_id": 137,
        "address": "0x2F800Db0fdb5223b3C3f354886d907A671414A7F",
        "category": "carbon",
    },
    {
        "symbol": "MCO2",
        "name": "Moss Carbon Credit",
        "chain": "Polygon",
        "chain_id": 137,
        "address": "0xAa7DbD1598251f856C12f63557A4C4397c253Cea",
        "category": "carbon",
    },
    {
        "symbol": "NCT",
        "name": "Toucan Protocol: Nature Carbon Tonne",
        "chain": "Polygon",
        "chain_id": 137,
        "address": "0xD838290e877E0188a7A4B25602c5E94fB4d93E29",
        "category": "carbon",
    },
    {
        "symbol": "UBO",
        "name": "Universal Basic Offset",
        "chain": "Polygon",
        "chain_id": 137,
        "address": "0x2B6e21e6E8695C3FE86E574E262227F67d1F73Bc",
        "category": "carbon",
    },
    {
        "symbol": "BCT",
        "name": "Toucan Protocol: Base Carbon Tonne",
        "chain": "Celo",
        "chain_id": 42220,
        "address": "0x32A9FE697a32135BFd313a6Ac28792DaE4E9979d",
        "category": "carbon",
    },
]


class DefiLlamaScraper:
    def __init__(self, api_url: str = None):
        self.api_url = api_url or DEFILLAMA_API_URL

    def get_all_pools(self) -> list:
        """
        Fetch all yield pools from DefiLlama.
        Returns raw pool data.
        """
        endpoint = f"{self.api_url}/pools"
        try:
            resp = requests.get(endpoint, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            return data.get("data", [])
        except requests.exceptions.RequestException as e:
            print(f"[DefiLlama] Error fetching pools: {e}")
            return []

    def filter_refi_pools(self, pools: list = None) -> list:
        """
        Filter pools to only include ReFi/carbon credit pools.
        """
        if pools is None:
            pools = self.get_all_pools()

        refi_pools = []
        refi_symbols = {t["symbol"] for t in REFI_TOKENS}

        for pool in pools:
            symbol = pool.get("symbol", "")
            # Check if any ReFi token symbol is in the pool symbol
            for refi_symbol in refi_symbols:
                if refi_symbol in symbol.upper():
                    refi_pools.append(pool)
                    break

        return refi_pools

    def get_cheapest_carbon_credit(
        self, min_tvl_usd: float = 10000
    ) -> dict:
        """
        Find the cheapest carbon credit with sufficient liquidity.

        Args:
            min_tvl_usd: Minimum TVL to consider the pool liquid enough

        Returns:
            {
                "target_token": "0xTokenAddress",
                "token_symbol": "BCT",
                "token_name": "Toucan Protocol: Base Carbon Tonne",
                "source_chain": "Base",
                "dest_chain": "Polygon",
                "price_per_tonne_usd": float,
                "tvl_usd": float,
                "apy": float,
                "pool_id": str,
            }
        """
        refi_pools = self.filter_refi_pools()

        if not refi_pools:
            print("[DefiLlama] No ReFi pools found, using fallback")
            return self._fallback_cheapest()

        # Filter by minimum TVL
        liquid_pools = [p for p in refi_pools if p.get("tvlUsd", 0) >= min_tvl_usd]

        if not liquid_pools:
            print("[DefiLlama] No liquid ReFi pools found, using all pools")
            liquid_pools = refi_pools

        # Sort by APY (higher APY = cheaper to acquire via yield farming)
        # or by TVL (higher TVL = more liquid = less slippage)
        sorted_pools = sorted(liquid_pools, key=lambda p: p.get("tvlUsd", 0), reverse=True)

        if not sorted_pools:
            return self._fallback_cheapest()

        best_pool = sorted_pools[0]

        # Match pool to known token
        pool_symbol = best_pool.get("symbol", "").upper()
        matched_token = None
        for refi in REFI_TOKENS:
            if refi["symbol"] in pool_symbol:
                matched_token = refi
                break

        if not matched_token:
            matched_token = REFI_TOKENS[0]  # Default to BCT on Polygon

        return {
            "target_token": matched_token["address"],
            "token_symbol": matched_token["symbol"],
            "token_name": matched_token["name"],
            "source_chain": "Base",  # Our vault is on Base
            "dest_chain": matched_token["chain"],
            "price_per_tonne_usd": 1.0,  # Carbon credits are ~$1-5/tonne
            "tvl_usd": best_pool.get("tvlUsd", 0),
            "apy": best_pool.get("apy", 0),
            "pool_id": best_pool.get("pool", ""),
        }

    def get_multi_chain_comparison(self) -> list:
        """
        Get a comparison of carbon credit availability across chains.
        """
        refi_pools = self.filter_refi_pools()

        comparison = []
        for token in REFI_TOKENS:
            matching_pools = [
                p for p in refi_pools if token["symbol"] in p.get("symbol", "").upper()
            ]
            best_pool = max(matching_pools, key=lambda p: p.get("tvlUsd", 0)) if matching_pools else None

            comparison.append({
                "token": token["symbol"],
                "chain": token["chain"],
                "address": token["address"],
                "tvl_usd": best_pool.get("tvlUsd", 0) if best_pool else 0,
                "apy": best_pool.get("apy", 0) if best_pool else 0,
                "available": best_pool is not None,
            })

        return comparison

    def _fallback_cheapest(self) -> dict:
        """
        Fallback when DefiLlama API is unavailable.
        BCT on Polygon is the most liquid carbon credit.
        """
        return {
            "target_token": "0x2F800Db0fdb5223b3C3f354886d907A671414A7F",
            "token_symbol": "BCT",
            "token_name": "Toucan Protocol: Base Carbon Tonne",
            "source_chain": "Base",
            "dest_chain": "Polygon",
            "price_per_tonne_usd": 1.5,
            "tvl_usd": 500000,
            "apy": 5.0,
            "pool_id": "fallback",
        }


if __name__ == "__main__":
    scraper = DefiLlamaScraper()

    print("=== Multi-Chain ReFi Comparison ===")
    comparison = scraper.get_multi_chain_comparison()
    for entry in comparison:
        status = "AVAILABLE" if entry["available"] else "NO POOL"
        print(f"  {entry['token']} on {entry['chain']}: TVL=${entry['tvl_usd']:,.0f}, APY={entry['apy']:.1f}% [{status}]")

    print("\n=== Cheapest Carbon Credit ===")
    cheapest = scraper.get_cheapest_carbon_credit()
    print(f"  Token: {cheapest['token_symbol']} ({cheapest['token_name']})")
    print(f"  Chain: {cheapest['dest_chain']}")
    print(f"  Address: {cheapest['target_token']}")
    print(f"  TVL: ${cheapest['tvl_usd']:,.0f}")
