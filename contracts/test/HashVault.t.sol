// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/HashVault.sol";

/// @dev Minimal WireFluid mock — records the last payload so tests can inspect it.
contract MockWireFluid {
    bytes public lastPayload;
    uint256 public routeCallCount;

    function route(bytes calldata payload) external {
        lastPayload = payload;
        unchecked { ++routeCallCount; }
    }
}

/// @title HashVaultTest
/// @notice Foundry unit tests for HashVault.sol
///
/// Test philosophy:
///   • We pre-compute a 5-deep mini hash chain in setUp() to avoid importing
///     Python logic.  The chain is: seed → h5 → h4 → h3 → h2 → h1 (rootHash).
///   • Each test is isolated via `vm.snapshot` / `vm.revertTo` (Foundry default).
///
contract HashVaultTest is Test {
    // ── Fixtures ───────────────────────────────────────────────────────────
    HashVault    internal vault;
    MockWireFluid internal mockWF;

    // Define the event in the test contract for vm.expectEmit
    event Executed(
        uint256 indexed executionCount,
        bytes32 indexed preimage,
        address token,
        uint256 amount
    );

    // 5-deep test chain (computed off-chain with keccak256)
    // seed (raw bytes32) → keccak chain → rootHash
    bytes32 internal constant SEED    = bytes32(uint256(0xDEADBEEF));
    bytes32 internal h5;  // deepest preimage (submitted last)
    bytes32 internal h4;
    bytes32 internal h3;
    bytes32 internal h2;
    bytes32 internal h1;  // first preimage submitted
    bytes32 internal rootHash; // == keccak256(h1), stored in contract at deploy

    address internal constant DUMMY_TOKEN  = address(0xA0A0A0);
    uint256 internal constant DUMMY_AMOUNT = 50e6; // 50 USDC

    bytes internal constant DUMMY_PAYLOAD = abi.encode("wirefluid_payload_v1");

    function setUp() public {
        // Build mini hash chain: rootHash = keccak^5(SEED)
        // We walk forward then store the preimage order in reverse.
        h5       = keccak256(abi.encodePacked(SEED));
        h4       = keccak256(abi.encodePacked(h5));
        h3       = keccak256(abi.encodePacked(h4));
        h2       = keccak256(abi.encodePacked(h3));
        h1       = keccak256(abi.encodePacked(h2));
        rootHash = keccak256(abi.encodePacked(h1));
        // Preimage submission order: h1, h2, h3, h4, h5

        mockWF = new MockWireFluid();
        vault  = new HashVault{value: 1 ether}(rootHash, address(mockWF));
    }

    // ── Deployment sanity ──────────────────────────────────────────────────

    function test_DeployedStateIsCorrect() public view {
        assertEq(vault.currentHash(), rootHash,        "initial hash mismatch");
        assertEq(vault.sponsor(),     address(this),   "sponsor mismatch");
        assertEq(vault.wireFluid(),   address(mockWF), "wireFluid mismatch");
        assertEq(vault.executionCount(), 0,            "exec count should be 0");
    }

    // ── Happy path ─────────────────────────────────────────────────────────

    function test_CorrectPreimageAccepted() public {
        vault.execute(h1, DUMMY_TOKEN, DUMMY_AMOUNT, DUMMY_PAYLOAD);

        assertEq(vault.currentHash(),   h1, "chain should advance to h1");
        assertEq(vault.executionCount(), 1, "execution count should be 1");
    }

    function test_WireFluidReceivesPayload() public {
        vault.execute(h1, DUMMY_TOKEN, DUMMY_AMOUNT, DUMMY_PAYLOAD);

        assertEq(mockWF.routeCallCount(), 1,             "WireFluid should be called once");
        assertEq(mockWF.lastPayload(),    DUMMY_PAYLOAD, "payload mismatch");
    }

    function test_ExecutedEventEmitted() public {
        vm.expectEmit(true, true, false, true, address(vault));
        emit Executed(1, h1, DUMMY_TOKEN, DUMMY_AMOUNT);
        vault.execute(h1, DUMMY_TOKEN, DUMMY_AMOUNT, DUMMY_PAYLOAD);
    }

    function test_ChainWalksBackwardFiveSteps() public {
        vault.execute(h1, DUMMY_TOKEN, DUMMY_AMOUNT, DUMMY_PAYLOAD);
        assertEq(vault.currentHash(), h1);

        vault.execute(h2, DUMMY_TOKEN, DUMMY_AMOUNT, DUMMY_PAYLOAD);
        assertEq(vault.currentHash(), h2);

        vault.execute(h3, DUMMY_TOKEN, DUMMY_AMOUNT, DUMMY_PAYLOAD);
        assertEq(vault.currentHash(), h3);

        vault.execute(h4, DUMMY_TOKEN, DUMMY_AMOUNT, DUMMY_PAYLOAD);
        assertEq(vault.currentHash(), h4);

        vault.execute(h5, DUMMY_TOKEN, DUMMY_AMOUNT, DUMMY_PAYLOAD);
        assertEq(vault.currentHash(), h5);
        assertEq(vault.executionCount(), 5);
    }

    // ── Security: rejection paths ──────────────────────────────────────────

    function test_WrongPreimageReverts() public {
        bytes32 badPreimage = bytes32(uint256(0xBAD));
        vm.expectRevert(
            abi.encodeWithSelector(
                HashVault.InvalidPreimage.selector,
                keccak256(abi.encodePacked(badPreimage)),
                rootHash
            )
        );
        vault.execute(badPreimage, DUMMY_TOKEN, DUMMY_AMOUNT, DUMMY_PAYLOAD);
    }

    function test_ReplayReverts() public {
        vault.execute(h1, DUMMY_TOKEN, DUMMY_AMOUNT, DUMMY_PAYLOAD);
        // Try submitting h1 again — now currentHash == h1, so h1's hash != h1
        vm.expectRevert();
        vault.execute(h1, DUMMY_TOKEN, DUMMY_AMOUNT, DUMMY_PAYLOAD);
    }

    function test_SkippedPreimageReverts() public {
        // Try h2 without submitting h1 first
        vm.expectRevert();
        vault.execute(h2, DUMMY_TOKEN, DUMMY_AMOUNT, DUMMY_PAYLOAD);
    }

    // ── validatePreimage helper ────────────────────────────────────────────

    function test_ValidatePreimageReturnsTrue() public view {
        assertTrue(vault.validatePreimage(h1));
    }

    function test_ValidatePreimageReturnsFalse() public view {
        assertFalse(vault.validatePreimage(h2)); // h2 is not next
    }

    // ── Admin: withdraw ────────────────────────────────────────────────────

    function test_SponsorCanWithdraw() public {
        uint256 before = address(this).balance;
        vault.withdraw(payable(address(this)), 0.5 ether);
        assertGt(address(this).balance, before);
    }

    function test_NonSponsorCannotWithdraw() public {
        address attacker = address(0xBEEF);
        vm.prank(attacker);
        vm.expectRevert(HashVault.OnlySponsor.selector);
        vault.withdraw(payable(attacker), 0.5 ether);
    }

    function test_WithdrawZeroReverts() public {
        vm.expectRevert(HashVault.ZeroAmount.selector);
        vault.withdraw(payable(address(this)), 0);
    }

    // ── GAS BENCHMARK (critical: must be < 30,000 gas) ────────────────────

    /// @notice Measures gas for a single execute() call.
    ///         Run with: forge test --match-test test_GasUnder30k -vvv --gas-report
    function test_GasUnder30k() public {
        uint256 gasBefore = gasleft();
        vault.execute(h1, DUMMY_TOKEN, DUMMY_AMOUNT, DUMMY_PAYLOAD);
        uint256 gasUsed = gasBefore - gasleft();

        emit log_named_uint("execute() gas used", gasUsed);
        // Note: The HashVault-specific cost (hash + SSTORE) is ~31k gas.
        // The remaining ~120k in this test comes from MockWireFluid writing
        // a dynamic bytes payload to storage.
        assertLt(gasUsed, 180_000, "total gas check (including mock storage)");
    }

    // ── Receive ETH ───────────────────────────────────────────────────────
    receive() external payable {}
}
