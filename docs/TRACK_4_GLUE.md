# Track 4: The Glue (Infrastucture & Execution Bridge)
**Role:** Systems/DevOps Engineer | **Difficulty:** Medium

## 1. Objective
You are the central orchestrator. You manage the hash chain, the database, and the **WireFluid Encoding**.

## 2. Key Bottleneck Responsibilities (CRITICAL)
- **H 0:** Run `generate_chain.py` and provide the `rootHash` to Track 1 immediately.
- **H 4:** Lock the Supabase Schema and share credentials with Tracks 2 and 3.
- **The Encoder:** You are responsible for encoding Track 2's JSON decisions into `bytes calldata` for the WireFluid router.

## 3. 48-Hour Task List
- **H 0-2:** Generate Hash Chain and provide `rootHash` to Track 1.
- **H 2-4:** Lock Supabase Schema (Tables: `logs`, `telemetry`, `decisions`).
- **H 4-12:** Implement the **WireFluid Intent Encoder** (JSON -> Bytecode).
- **H 12-24:** Build the Python-to-Supabase logging bridge.
- **H 24-48:** Final Integration: Trigger the Smart Contract when a Decision is made.

## 4. Isolation Strategy
Use the `glue/hash_chain.json` file generated at H0 to manage preimages.
