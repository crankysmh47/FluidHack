// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/HashVault.sol";

/// @title DeployHashVault
/// @notice Foundry deployment script for HashVault.
///
/// ── Usage ──────────────────────────────────────────────────────────────────
///
///   DRY RUN (no broadcast, safe to run now):
///     forge script script/Deploy.s.sol \
///       --rpc-url $BASE_SEPOLIA_RPC_URL
///
///   LIVE DEPLOY (run once WireFluid address is received from Track 4):
///     forge script script/Deploy.s.sol \
///       --rpc-url $BASE_SEPOLIA_RPC_URL \
///       --broadcast \
///       --verify \
///       --etherscan-api-key $BASESCAN_API_KEY
///
/// ── Pre-flight checklist ───────────────────────────────────────────────────
///   [ ] Set WIRE_FLUID below to the address Track 4 provides.
///   [ ] Ensure DEPLOYER_PRIVATE_KEY is in your .env.
///   [ ] Ensure BASE_SEPOLIA_RPC_URL is in your .env.
///   [ ] Confirm ROOT_HASH matches rootHash in glue/hash_chain.json.
///
contract DeployHashVault is Script {
    // ── CONSTANTS ─────────────────────────────────────────────────────────
    // rootHash from glue/hash_chain.json — DO NOT CHANGE
    bytes32 constant ROOT_HASH = 0xd72ab163d6233bd0810afd53cb4f45753851e87035266adbfe006c74e9f2fb7a;

    // ⚠️  REPLACE with real address when Track 4 sends it.
    //      Leaving as address(0) makes the live deploy revert immediately,
    //      which acts as a safety guard against accidental early deployment.
    address constant WIRE_FLUID = address(0); // ← TODO: Track 4 to provide

    function run() external {
        require(
            WIRE_FLUID != address(0),
            "Deploy: set WIRE_FLUID to the WireFluid router address first"
        );

        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        HashVault vault = new HashVault{value: 0}(ROOT_HASH, WIRE_FLUID);

        vm.stopBroadcast();

        console.log("===========================================");
        console.log("  HashVault deployed at:", address(vault));
        console.log("  rootHash:            ", vm.toString(ROOT_HASH));
        console.log("  wireFluid:           ", WIRE_FLUID);
        console.log("  Share address with Track 4 immediately.");
        console.log("===========================================");
    }
}
