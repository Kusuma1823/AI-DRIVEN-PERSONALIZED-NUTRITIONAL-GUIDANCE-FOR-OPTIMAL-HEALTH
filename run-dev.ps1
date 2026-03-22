$ErrorActionPreference = "Stop"

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing dependencies (npm install)..."
  npm install
}

Write-Host "Starting dev server (npm run dev)..."
npm run dev

