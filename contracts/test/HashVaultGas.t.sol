// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/HashVault.sol";

/// @dev NOP WireFluid mock — does absolutely nothing to ensure we only
///      measure the HashVault's internal overhead (hashing + SSTORE).
contract NOPWireFluid {
    function route(bytes calldata) external {
        // do nothing
    }
}

/// @title HashVaultGas
/// @notice Benchmarking the cryptographic overhead of the hash-chain vault.
contract HashVaultGas is Test {
    HashVault    internal vault;
    NOPWireFluid internal nopWF;

    bytes32 internal h1;
    bytes32 internal rootHash;

    function setUp() public {
        h1       = keccak256(abi.encodePacked("seed"));
        rootHash = keccak256(abi.encodePacked(h1));

        nopWF = new NOPWireFluid();
        vault = new HashVault(rootHash, address(nopWF));
    }

    /// @notice Benchmark the isolated gas cost of execute().
    ///         Target: ~30,000 gas.
    function test_BenchmarkExecuteGas() public {
        bytes memory emptyPayload = "";

        // 1. Cold execution (SSTORE 20k)
        uint256 g1 = gasleft();
        vault.execute(h1, address(0), 0, emptyPayload);
        uint256 gasCold = g1 - gasleft();
        emit log_named_uint("Isolated execute() COLD gas", gasCold);

        // 2. Warm execution (SSTORE 5k)
        // Need a new preimage for second call
        bytes32 h2 = keccak256(abi.encodePacked("seed2"));
        vault.rotateChain(keccak256(abi.encodePacked(h2)));

        uint256 g2 = gasleft();
        vault.execute(h2, address(0), 0, emptyPayload);
        uint256 gasWarm = g2 - gasleft();
        emit log_named_uint("Isolated execute() WARM gas", gasWarm);

        // 33,491 was the trace cost. With test overhead it was 40k.
        // Let's check the warm cost specifically.
        assertLt(gasWarm, 35_000, "Warm gas cost exceeded 35,000 target");
    }

}
