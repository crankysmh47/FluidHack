# ============================================================
# Carbon Sentinel — Quick Start Script
# Run this once to set up the full project environment.
# Usage:  .\install.ps1
# ============================================================
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   Carbon Sentinel — Quick Start      " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Check Python ──────────────────────────────────────────────────────────
Write-Host "[1/6] Checking Python..." -ForegroundColor Yellow
try {
    $pyVer = python --version 2>&1
    Write-Host "  ✅ $pyVer" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Python not found. Install from https://python.org/downloads" -ForegroundColor Red
    exit 1
}

# ── 2. Install Python dependencies ───────────────────────────────────────────
Write-Host "[2/6] Installing Python dependencies..." -ForegroundColor Yellow
if (Test-Path "requirements.txt") {
    pip install -r requirements.txt --quiet
    Write-Host "  ✅ Python packages installed." -ForegroundColor Green
} else {
    Write-Host "  ⚠️  requirements.txt not found — skipping." -ForegroundColor DarkYellow
}

# ── 3. Check / Install Foundry ───────────────────────────────────────────────
Write-Host "[3/6] Checking Foundry (forge/cast)..." -ForegroundColor Yellow
$forgeAvailable = Get-Command forge -ErrorAction SilentlyContinue
if ($forgeAvailable) {
    $forgeVer = forge --version 2>&1
    Write-Host "  ✅ Forge: $forgeVer" -ForegroundColor Green
} else {
    Write-Host "  Foundry not found. Installing via foundryup..." -ForegroundColor DarkYellow
    try {
        # Download and run the Foundry installer (Windows)
        Invoke-WebRequest -Uri "https://foundry.paradigm.xyz" -OutFile "$env:TEMP\foundryup.sh"
        Write-Host "  Run this in a WSL or Git Bash terminal to install Foundry:" -ForegroundColor Yellow
        Write-Host "    curl -L https://foundry.paradigm.xyz | bash" -ForegroundColor White
        Write-Host "    foundryup" -ForegroundColor White
        Write-Host "  Then re-run this script." -ForegroundColor Yellow
    } catch {
        Write-Host "  ⚠️  Could not auto-install Foundry. Please install manually:" -ForegroundColor DarkYellow
        Write-Host "    https://book.getfoundry.sh/getting-started/installation" -ForegroundColor White
    }
}

# ── 4. Set up Foundry contract dependencies ───────────────────────────────────
Write-Host "[4/6] Setting up Foundry contract dependencies..." -ForegroundColor Yellow
if (Test-Path "contracts\foundry.toml") {
    Push-Location contracts
    if ($forgeAvailable) {
        forge install --quiet 2>&1 | Out-Null
        Write-Host "  ✅ Foundry dependencies installed." -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Skipping forge install (Foundry not available)." -ForegroundColor DarkYellow
    }
    Pop-Location
} else {
    Write-Host "  ⚠️  contracts/foundry.toml not found — skipping." -ForegroundColor DarkYellow
}

# ── 5. Set up .env files ──────────────────────────────────────────────────────
Write-Host "[5/6] Setting up environment files..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "  ✅ .env created from .env.example" -ForegroundColor Green
        Write-Host "  ⚠️  IMPORTANT: Edit .env and fill in your API keys!" -ForegroundColor Red
    }
} else {
    Write-Host "  ✅ .env already exists." -ForegroundColor Green
}

if (-not (Test-Path "contracts\.env")) {
    if (Test-Path "contracts\.env.example") {
        Copy-Item "contracts\.env.example" "contracts\.env"
        Write-Host "  ✅ contracts/.env created from .env.example" -ForegroundColor Green
    }
} else {
    Write-Host "  ✅ contracts/.env already exists." -ForegroundColor Green
}

# ── 6. Supabase migration instructions ───────────────────────────────────────
Write-Host "[6/6] Supabase Setup Instructions..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Run these SQL files in your Supabase Dashboard SQL Editor:" -ForegroundColor White
Write-Host "  (https://supabase.com/dashboard/project/_/sql)" -ForegroundColor DarkGray
Write-Host ""

$migrations = Get-ChildItem "glue\migrations\*.sql" | Sort-Object Name
foreach ($f in $migrations) {
    Write-Host "    📄 $($f.Name)" -ForegroundColor Cyan
}

# ── Done ──────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   Setup Complete! Next Steps:        " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Edit .env with your API keys"
Write-Host "  2. Run Supabase migrations (glue/migrations/*.sql)"
Write-Host "  3. Deploy the contract:"
Write-Host "       cd contracts"
Write-Host "       forge script script/Deploy.s.sol --rpc-url `$WIREFLUID_TESTNET_RPC_URL --broadcast"
Write-Host "  4. Add HASH_VAULT_ADDRESS to .env"
Write-Host "  5. Run the agent:"
Write-Host "       python sentinel_core/agent.py --dry-run"
Write-Host "  6. Start the API server:"
Write-Host "       python glue/api_server.py"
Write-Host ""
Write-Host "  Agent CLI flags:" -ForegroundColor DarkGray
Write-Host "    --loop              Run continuously" -ForegroundColor DarkGray
Write-Host "    --interval 60       Check every 60s" -ForegroundColor DarkGray
Write-Host "    --dry-run           No on-chain txs" -ForegroundColor DarkGray
Write-Host "    --force-buy 5.0     Spend \$5 now" -ForegroundColor DarkGray
Write-Host "    --user_id 0xABC     Associate txs with a wallet" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  TX Log (local backup of all hashes):" -ForegroundColor DarkGray
Write-Host "    python glue/tx_log.py --stats" -ForegroundColor DarkGray
Write-Host "    python glue/tx_log.py --list" -ForegroundColor DarkGray
Write-Host ""