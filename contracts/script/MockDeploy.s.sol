// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/HashVault.sol";

contract MockWireFluid {
    bytes public lastPayload;
    uint256 public routeCallCount;

    function route(bytes calldata payload) external {
        lastPayload = payload;
        unchecked { ++routeCallCount; }
    }
}

contract DeployMockVault is Script {
    bytes32 constant ROOT_HASH = 0xc672c3fd541c90fce03ed58d5954044a13ddac2c9a128a9e5903f16c586f4916;

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");

        vm.startBroadcast(deployerKey);
        
        MockWireFluid mock = new MockWireFluid();
        HashVault vault = new HashVault{value: 0}(ROOT_HASH, address(mock));
        
        vm.stopBroadcast();

        console.log("MockWireFluid deployed at:", address(mock));
        console.log("HashVault (Mock) deployed at:", address(vault));
        console.log("rootHash:", vm.toString(ROOT_HASH));
    }
}
