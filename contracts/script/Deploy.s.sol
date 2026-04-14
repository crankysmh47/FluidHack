// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/HashVault.sol";

/// @title DeployHashVault
/// @notice Foundry deployment script for HashVault on WireFluid Testnet.
///
/// ── Network ────────────────────────────────────────────────────────────────
///   Chain:    WireFluid Testnet (Chain ID: 92533)
///   RPC:      https://evm.wirefluid.com
///   Explorer: https://wirefluidscan.com
///
/// ── Usage ──────────────────────────────────────────────────────────────────
///
///   STUB DEPLOY (hash-chain working, WireFluid router = address(1)):
///     forge script script/Deploy.s.sol:DeployHashVault \
///       --rpc-url $WIREFLUID_TESTNET_RPC_URL \
///       --broadcast \
///       --sig "runStub()"
///
///   LIVE DEPLOY (full integration once WireFluid router address is known):
///     Set WIRE_FLUID constant below, then:
///     forge script script/Deploy.s.sol:DeployHashVault \
///       --rpc-url $WIREFLUID_TESTNET_RPC_URL \
///       --broadcast
///
/// ── Pre-flight checklist ───────────────────────────────────────────────────
///   [x] rootHash matches glue/hash_chain.json (already set)
///   [ ] DEPLOYER_PRIVATE_KEY set in contracts/.env (no 0x prefix)
///   [ ] WIREFLUID_TESTNET_RPC_URL set in contracts/.env
///   [ ] Wallet has WIRE tokens for gas (faucet: see WireFluid docs)
///   [ ] Set WIRE_FLUID below before calling run() for live deploy
///
contract DeployHashVault is Script {
    // ── CONSTANTS ─────────────────────────────────────────────────────────
    // rootHash from glue/hash_chain.json — DO NOT CHANGE
    bytes32 constant ROOT_HASH = 0xd72ab163d6233bd0810afd53cb4f45753851e87035266adbfe006c74e9f2fb7a;

    // ⚠️  Set this to the WireFluid router address once provided.
    //     Get it from: https://wirefluidscan.com or support@wirefluid.com
    address constant WIRE_FLUID = address(0); // ← TODO: fill with real router address

    // ── Stub Deploy (for testing hash-chain logic without live router) ─────
    /// @notice Deploy with address(1) as a stub WireFluid router.
    ///         Use this to verify gas, hash-chain, and preimage logic on testnet.
    ///         The .execute() call will fail gracefully (no real route).
    function runStub() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address stubRouter = address(1); // non-zero stub so contract deploys

        vm.startBroadcast(deployerKey);
        HashVault vault = new HashVault{value: 0}(ROOT_HASH, stubRouter);
        vm.stopBroadcast();

        console.log("===========================================");
        console.log("  [STUB] HashVault deployed at:", address(vault));
        console.log("  rootHash:  ", vm.toString(ROOT_HASH));
        console.log("  wireFluid: ", stubRouter, " (STUB - replace for live demo)");
        console.log("  Chain:      WireFluid Testnet (92533)");
        console.log("  Explorer:   https://wirefluidscan.com/address/", address(vault));
        console.log("===========================================");
        console.log("  Next: copy the address above into contracts/.env as HASH_VAULT_ADDRESS");
    }

    // ── Live Deploy (full integration) ────────────────────────────────────
    function run() external {
        require(
            WIRE_FLUID != address(0),
            "Deploy: set WIRE_FLUID router address first (see WireFluid docs)"
        );

        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerKey);
        HashVault vault = new HashVault{value: 0}(ROOT_HASH, WIRE_FLUID);
        vm.stopBroadcast();

        console.log("===========================================");
        console.log("  [LIVE] HashVault deployed at:", address(vault));
        console.log("  rootHash:  ", vm.toString(ROOT_HASH));
        console.log("  wireFluid: ", WIRE_FLUID);
        console.log("  Chain:      WireFluid Testnet (92533)");
        console.log("  Explorer:   https://wirefluidscan.com/address/", address(vault));
        console.log("===========================================");
        console.log("  Next: copy the address above into contracts/.env as HASH_VAULT_ADDRESS");
    }
}
