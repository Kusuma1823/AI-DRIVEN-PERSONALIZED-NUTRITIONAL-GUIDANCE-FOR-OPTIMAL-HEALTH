$ErrorActionPreference = "Stop"

function Test-NodeInstalled {
  try {
    $n = Get-Command "node" -ErrorAction Stop
    return $true
  } catch {
    return $false
  }
}

if (Test-NodeInstalled) {
  Write-Host "Node.js is already installed. Skipping."
  & node -v | ForEach-Object { Write-Host "Detected node version: $_" }
  exit 0
}

Write-Host "Node.js not found. Installing latest Node.js LTS (v20.x) for Windows x64..."

$latestDirUrl = "https://nodejs.org/dist/latest-v20.x/"
$html = Invoke-WebRequest -Uri $latestDirUrl -UseBasicParsing | Select-Object -ExpandProperty Content

# Extract candidate MSI filenames like: node-v20.20.1-x64.msi
$matches = [regex]::Matches($html, "node-v(?<ver>\d+\.\d+\.\d+)-x64\.msi")
if ($matches.Count -eq 0) {
  throw "Could not find an x64 MSI in $latestDirUrl"
}

$candidates = @()
foreach ($m in $matches) {
  $ver = $m.Groups["ver"].Value
  $parts = $ver.Split(".")
  if ($parts.Count -lt 3) { continue }
  $major = [int]$parts[0]
  $minor = [int]$parts[1]
  $patch = [int]$parts[2]
  $candidates += [pscustomobject]@{
    version = $ver
    major = $major
    minor = $minor
    patch = $patch
    msiFile = "node-v$ver-x64.msi"
  }
}

if ($candidates.Count -eq 0) {
  throw "No valid x64 MSI candidates found in $latestDirUrl"
}

$best = $candidates |
  Sort-Object -Property major, minor, patch -Descending |
  Select-Object -First 1

$msiFile = $best.msiFile
$msiUrl = $latestDirUrl.TrimEnd("/") + "/" + $msiFile

Write-Host "Selected: $msiFile"
Write-Host "Downloading: $msiUrl"

$tempDir = $env:TEMP
$msiPath = Join-Path $tempDir $msiFile

Invoke-WebRequest -Uri $msiUrl -OutFile $msiPath

Write-Host "Running silent MSI install..."

# /qn = quiet, /norestart = don't restart
$proc = Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$msiPath`" /qn /norestart" -Wait -PassThru
Write-Host "msiexec exit code: $($proc.ExitCode)"

function Get-NodeExePath {
  $candidates = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:ProgramFiles\nodejs\node.exe",
    "$env:ProgramFiles(x86)\nodejs\node.exe"
  )
  foreach ($p in $candidates) {
    if (Test-Path $p) { return $p }
  }
  return $null
}

$nodeExe = Get-NodeExePath
Write-Host "Verifying installation..."
if ($null -eq $nodeExe) {
  throw "Node.exe not found after install. msiexec exit code: $($proc.ExitCode)"
}

Write-Host "Detected node.exe at: $nodeExe"
& $nodeExe -v | ForEach-Object { Write-Host "Detected node version: $_" }

Write-Host "Verifying npm..."
$nodeDir = Split-Path -Parent $nodeExe
$npmCmd = Join-Path $nodeDir "npm.cmd"
if (Test-Path $npmCmd) {
  & $npmCmd -v | ForEach-Object { Write-Host "Detected npm version: $_" }
} else {
  Write-Warning "npm.cmd not found next to node.exe. Your Node installation may be incomplete."
}

Write-Host "If `node` is still not found on PATH, restart your terminal so PATH refreshes."

