// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IWireFluid
/// @notice Minimal interface for the WireFluid cross-chain intent router.
/// @dev Track 4 (Glue) encodes `payload` from the AI agent's JSON decision.
///      Track 1 (Muscle) passes it through without parsing.
interface IWireFluid {
    /// @notice Emit a cross-chain swap/bridge intent.
    /// @param payload ABI-encoded WireFluid intent bytecode, assembled by Track 4.
    function route(bytes calldata payload) external;
}
