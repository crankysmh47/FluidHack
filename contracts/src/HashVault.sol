// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IWireFluid.sol";

/// @title HashVault
/// @author Carbon Sentinel — Track 1 (The Muscle)
/// @notice Signature-less execution vault using a Keccak-256 hash-chain.
///
/// ── How it works ──────────────────────────────────────────────────────────
///
///   1. The sponsor calls the constructor once, depositing budget and locking
///      the `rootHash` — the tip of a pre-computed keccak256 hash chain.
///
///   2. The AI agent (Track 4) calls `execute()` with the *next preimage*
///      in the chain, a token address, an amount, and an opaque WireFluid
///      payload (encoded by Track 4 from Track 2's JSON decision).
///
///   3. The contract verifies:  keccak256(preimage) == currentHash
///      If valid, it advances the chain, then forwards the payload to the
///      WireFluid router — triggering cross-chain swap/bridge.
///
///   4. No wallet signature is required per execution.
///      Gas cost target: ~30,000 gas (vs ~65,000 for ECDSA).
///
/// ── Security model ────────────────────────────────────────────────────────
///   • Only someone with the pre-computed preimage list (Track 4) can call
///     `execute()`.  The list comes from `glue/hash_chain.json`.
///   • Preimages are single-use: once consumed, `currentHash` advances.
///   • `onlySponsor` guard on admin functions prevents unauthorized draining.
///
contract HashVault {
    // ── Immutables ─────────────────────────────────────────────────────────
    address public immutable sponsor;
    address public immutable wireFluid;

    // ── State ──────────────────────────────────────────────────────────────
    bytes32 public currentHash;
    uint256 public executionCount;

    // ── Events ─────────────────────────────────────────────────────────────
    event Executed(
        uint256 indexed executionCount,
        bytes32 indexed preimage,
        address token,
        uint256 amount
    );

    event BudgetDeposited(address indexed from, uint256 amount);
    event BudgetWithdrawn(address indexed to, uint256 amount);

    // ── Errors ─────────────────────────────────────────────────────────────
    error InvalidPreimage(bytes32 got, bytes32 expected);
    error OnlySponsor();
    error ZeroAmount();
    error TransferFailed();

    // ── Modifiers ──────────────────────────────────────────────────────────
    modifier onlySponsor() {
        if (msg.sender != sponsor) revert OnlySponsor();
        _;
    }

    // ── Constructor ────────────────────────────────────────────────────────
    /// @param _rootHash   The root (tip) of the keccak256 hash chain,
    ///                    produced by `glue/generate_chain.py`.
    /// @param _wireFluid  Address of the WireFluid router on this chain.
    ///                    Provided by Track 4 at hackathon Hour 0.
    constructor(bytes32 _rootHash, address _wireFluid) payable {
        sponsor    = msg.sender;
        wireFluid  = _wireFluid;
        currentHash = _rootHash;
    }

    // ── Core Logic ─────────────────────────────────────────────────────────

    /// @notice Execute a carbon-offset intent.
    ///         No human signature required — the preimage IS the authorization.
    ///
    /// @param _preimage         Next preimage from `glue/hash_chain.json`.
    ///                          Must satisfy: keccak256(_preimage) == currentHash.
    /// @param _token            ERC-20 token address the AI agent chose to buy.
    /// @param _amount           Token amount in wei (e.g. USDC with 6 decimals).
    /// @param _wireFluidPayload Opaque payload assembled by Track 4's encoder.
    ///                          Passed through untouched to the WireFluid router.
    function execute(
        bytes32 _preimage,
        address _token,
        uint256 _amount,
        bytes calldata _wireFluidPayload
    ) external {
        // ── 1. VERIFY hash-chain integrity (~3,000 gas) ───────────────────
        bytes32 expected = currentHash;
        bytes32 got      = keccak256(abi.encodePacked(_preimage));
        if (got != expected) revert InvalidPreimage(got, expected);

        // ── 2. ADVANCE the chain (1 SSTORE, ~5,000 gas warm / 20,000 cold) ─
        currentHash = _preimage;
        unchecked { ++executionCount; }

        // ── 3. FORWARD to WireFluid (external call, gas varies by router) ──
        //      We do NOT parse _wireFluidPayload — Track 4 owns the encoding.
        IWireFluid(wireFluid).route(_wireFluidPayload);

        emit Executed(executionCount, _preimage, _token, _amount);
    }

    // ── Admin ──────────────────────────────────────────────────────────────

    /// @notice Sponsor can top up the vault's native budget.
    receive() external payable {
        emit BudgetDeposited(msg.sender, msg.value);
    }

    /// @notice Emergency escape hatch for the sponsor.
    function withdraw(address payable _to, uint256 _amount) external onlySponsor {
        if (_amount == 0) revert ZeroAmount();
        (bool ok,) = _to.call{value: _amount}("");
        if (!ok) revert TransferFailed();
        emit BudgetWithdrawn(_to, _amount);
    }

    // ── View helpers ───────────────────────────────────────────────────────

    /// @notice Remaining preimages in a 1,000-deep chain (informational only).
    function remainingExecutions() external view returns (uint256) {
        return 1000 - executionCount;
    }

    /// @notice Check if a given preimage would be accepted right now.
    function validatePreimage(bytes32 _preimage) external view returns (bool) {
        return keccak256(abi.encodePacked(_preimage)) == currentHash;
    }
}
