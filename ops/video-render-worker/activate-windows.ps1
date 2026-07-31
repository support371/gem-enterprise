[CmdletBinding()]
param(
  [ValidateSet("Setup", "Check", "Once", "Run")]
  [string]$Mode = "Setup",
  [string]$ComfyUiBaseUrl = "http://127.0.0.1:8188"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$VercelOrgId = "team_7lMXW95WSLeyK4yAObe8FptW"
$VercelProjectId = "prj_VDGqnA7wZt2E65LLvT94ZOpnYc2Z"
$SupabaseUrl = "https://slzdjoqpzbkwzuaexlkj.supabase.co"
$StorageBucket = "gem-video-renders"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$WorkerHome = Join-Path $env:LOCALAPPDATA "GEM\video-render-worker"
$WorkerStateDirectory = Join-Path $WorkerHome "state"
$WorkerEnvironmentFile = Join-Path $WorkerHome "worker.production.env"

function Write-Step([string]$Message) {
  Write-Host "[GEM video worker] $Message" -ForegroundColor Cyan
}

function Assert-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command '$Name' was not found in PATH."
  }
}

function Convert-SecureStringToPlainText([Security.SecureString]$SecureValue) {
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureValue)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  }
}

function New-CallbackSecret {
  $bytes = New-Object byte[] 48
  [Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
  return [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

function Invoke-Pnpm([string[]]$Arguments, [string]$InputValue = $null) {
  if ($null -eq $InputValue) {
    & pnpm @Arguments
  }
  else {
    $InputValue | & pnpm @Arguments
  }
  if ($LASTEXITCODE -ne 0) {
    throw "pnpm command failed: pnpm $($Arguments -join ' ')"
  }
}

function Get-EnvironmentMap([string]$Path) {
  $values = @{}
  if (-not (Test-Path $Path)) { return $values }
  foreach ($line in Get-Content -LiteralPath $Path) {
    $trimmed = $line.Trim()
    if (-not $trimmed -or $trimmed.StartsWith('#')) { continue }
    $separator = $trimmed.IndexOf('=')
    if ($separator -le 0) { continue }
    $name = $trimmed.Substring(0, $separator).Trim()
    $value = $trimmed.Substring($separator + 1).Trim()
    if ($value.Length -ge 2 -and $value.StartsWith('"') -and $value.EndsWith('"')) {
      $value = $value.Substring(1, $value.Length - 2)
      $value = $value.Replace('\n', "`n").Replace('\"', '"').Replace('\\', '\')
    }
    $values[$name] = $value
  }
  return $values
}

function Import-WorkerEnvironment {
  if (-not (Test-Path $WorkerEnvironmentFile)) {
    throw "Worker environment file is missing: $WorkerEnvironmentFile. Run with -Mode Setup first."
  }
  $values = Get-EnvironmentMap $WorkerEnvironmentFile
  foreach ($name in $values.Keys) {
    Set-Item -Path "Env:$name" -Value $values[$name]
  }
}

function Set-VercelValue(
  [string]$Name,
  [string]$Value,
  [bool]$Sensitive = $true
) {
  $arguments = @("dlx", "vercel@latest", "env", "add", $Name, "production", "--force")
  if ($Sensitive) { $arguments += "--sensitive" } else { $arguments += "--no-sensitive" }
  Invoke-Pnpm -Arguments $arguments -InputValue $Value
}

function Remove-VercelValue([string]$Name) {
  $arguments = @("dlx", "vercel@latest", "env", "rm", $Name, "production", "--yes")
  try {
    Invoke-Pnpm -Arguments $arguments
  }
  catch {
    throw "Failed to remove optional Vercel environment variable '$Name'; production configuration may be out of sync. $($_.Exception.Message)"
  }
}

function Protect-WorkerFile([string]$Path) {
  & icacls $Path /inheritance:r *> $null
  if ($LASTEXITCODE -ne 0) { throw "Failed to disable inherited permissions on $Path." }
  & icacls $Path /grant:r "${env:USERNAME}:(F)" *> $null
  if ($LASTEXITCODE -ne 0) { throw "Failed to restrict $Path to the current Windows user." }
}

function Write-WorkerEnvironment(
  [string]$CallbackSecret,
  [string]$StorageKey,
  [string]$ComfyBearerToken
) {
  New-Item -ItemType Directory -Force -Path $WorkerHome | Out-Null
  New-Item -ItemType Directory -Force -Path $WorkerStateDirectory | Out-Null

  $lines = @(
    "GEM_VIDEO_WORKER_API_URL=https://www.gemcybersecurityassist.com",
    "VIDEO_RENDER_CALLBACK_SECRET=$CallbackSecret",
    "COMFYUI_BASE_URL=$ComfyUiBaseUrl",
    "COMFYUI_BEARER_TOKEN=$ComfyBearerToken",
    "VIDEO_RENDER_STORAGE_URL=$SupabaseUrl",
    "VIDEO_RENDER_STORAGE_KEY=$StorageKey",
    "VIDEO_RENDER_STORAGE_BUCKET=$StorageBucket",
    "VIDEO_RENDER_STORAGE_PREFIX=renders",
    "VIDEO_RENDER_WORKER_STATE_DIR=$WorkerStateDirectory",
    "VIDEO_RENDER_WORKER_BATCH_SIZE=5",
    "VIDEO_RENDER_WORKER_DISPATCH_LEASE_MS=120000",
    "VIDEO_RENDER_WORKER_POLL_MS=15000",
    "VIDEO_RENDER_WORKER_TIMEOUT_MS=30000",
    "VIDEO_RENDER_WORKER_TRANSFER_TIMEOUT_MS=900000",
    "VIDEO_RENDER_MAX_FILE_BYTES=1073741824"
  )
  [IO.File]::WriteAllLines($WorkerEnvironmentFile, $lines, [Text.UTF8Encoding]::new($false))
  Protect-WorkerFile $WorkerEnvironmentFile
}

function Invoke-Worker([string]$WorkerMode) {
  Import-WorkerEnvironment
  Push-Location $RepoRoot
  try {
    switch ($WorkerMode) {
      "Check" { Invoke-Pnpm @("run", "video:worker:check") }
      "Once"  { Invoke-Pnpm @("run", "video:worker:once") }
      "Run"   { Invoke-Pnpm @("run", "video:worker") }
      default  { throw "Unsupported worker mode: $WorkerMode" }
    }
  }
  finally {
    Pop-Location
  }
}

if ($Mode -ne "Setup") {
  Assert-Command "node"
  Assert-Command "pnpm"
  Invoke-Worker $Mode
  exit 0
}

Write-Step "Checking local requirements."
Assert-Command "node"
Assert-Command "pnpm"
Assert-Command "icacls"

$nodeMajor = [int]((& node --version).TrimStart('v').Split('.')[0])
if ($nodeMajor -ne 24) {
  throw "Node.js 24.x is required; detected $(& node --version)."
}
$pnpmMajor = [int]((& pnpm --version).Split('.')[0])
if ($pnpmMajor -ne 10) {
  throw "pnpm 10.x is required; detected $(& pnpm --version)."
}
if (-not (Test-Path (Join-Path $RepoRoot "package.json"))) {
  throw "The GEM repository root could not be located from this script."
}

$workflowPath = Read-Host "Full path to the ComfyUI workflow exported with Save (API Format)"
if (-not (Test-Path -LiteralPath $workflowPath -PathType Leaf)) {
  throw "The ComfyUI API workflow file was not found."
}
$workflowText = Get-Content -LiteralPath $workflowPath -Raw
try {
  $workflowObject = $workflowText | ConvertFrom-Json
  $workflowJson = $workflowObject | ConvertTo-Json -Depth 100 -Compress
}
catch {
  throw "The selected ComfyUI workflow is not valid JSON."
}

$promptNodeId = (Read-Host "Positive prompt node ID").Trim()
if (-not $promptNodeId) { throw "A positive prompt node ID is required." }
if (-not ($workflowObject.PSObject.Properties.Name -contains $promptNodeId)) {
  throw "Prompt node '$promptNodeId' does not exist in the supplied workflow."
}
$negativePromptNodeId = (Read-Host "Negative prompt node ID (press Enter if unused)").Trim()
$seedNodeId = (Read-Host "Seed node ID (press Enter if unused)").Trim()

Write-Step "Authenticating the Vercel CLI."
$env:VERCEL_ORG_ID = $VercelOrgId
$env:VERCEL_PROJECT_ID = $VercelProjectId
& pnpm dlx vercel@latest whoami *> $null
if ($LASTEXITCODE -ne 0) {
  Invoke-Pnpm @("dlx", "vercel@latest", "login")
}

$tempEnvironmentFile = Join-Path ([IO.Path]::GetTempPath()) ("gem-vercel-env-{0}.tmp" -f [Guid]::NewGuid())
try {
  Write-Step "Reading the existing production storage credential without printing it."
  Invoke-Pnpm @("dlx", "vercel@latest", "env", "pull", $tempEnvironmentFile, "--environment=production", "--yes")
  $productionEnvironment = Get-EnvironmentMap $tempEnvironmentFile
  $storageKey = $productionEnvironment["VIDEO_RENDER_STORAGE_KEY"]
  if (-not $storageKey) { $storageKey = $productionEnvironment["SUPABASE_SERVICE_ROLE_KEY"] }
  if (-not $storageKey) {
    $secureStorageKey = Read-Host "Restricted Supabase storage credential" -AsSecureString
    $storageKey = Convert-SecureStringToPlainText $secureStorageKey
  }
  if (-not $storageKey) { throw "A restricted storage credential is required." }

  $secureComfyToken = Read-Host "ComfyUI bearer token (press Enter if localhost has no token)" -AsSecureString
  $comfyBearerToken = Convert-SecureStringToPlainText $secureComfyToken
  $callbackSecret = New-CallbackSecret

  Write-Step "Applying the production Vercel worker configuration."
  Set-VercelValue "VIDEO_RENDER_DISPATCH_MODE" "worker" $false
  Set-VercelValue "COMFYUI_WORKFLOW_JSON" $workflowJson $true
  Set-VercelValue "COMFYUI_PROMPT_NODE_ID" $promptNodeId $false
  if ($negativePromptNodeId) {
    Set-VercelValue "COMFYUI_NEGATIVE_PROMPT_NODE_ID" $negativePromptNodeId $false
  }
  else {
    Remove-VercelValue "COMFYUI_NEGATIVE_PROMPT_NODE_ID"
  }
  if ($seedNodeId) {
    Set-VercelValue "COMFYUI_SEED_NODE_ID" $seedNodeId $false
  }
  else {
    Remove-VercelValue "COMFYUI_SEED_NODE_ID"
  }
  Set-VercelValue "COMFYUI_DEFAULT_NEGATIVE_PROMPT" "real company logos, credentials, private data, unreadable text, distorted faces" $false
  Set-VercelValue "VIDEO_RENDER_CALLBACK_SECRET" $callbackSecret $true
  Set-VercelValue "VIDEO_RENDER_STORAGE_URL" $SupabaseUrl $false
  Set-VercelValue "VIDEO_RENDER_STORAGE_KEY" $storageKey $true
  Set-VercelValue "VIDEO_RENDER_STORAGE_AUTH_ORIGIN" $SupabaseUrl $false
  Set-VercelValue "VIDEO_ASSET_ALLOWED_ORIGINS" $SupabaseUrl $false

  Write-Step "Writing the local worker configuration with current-user-only permissions."
  Write-WorkerEnvironment $callbackSecret $storageKey $comfyBearerToken

  Push-Location $RepoRoot
  try {
    Write-Step "Installing locked repository dependencies."
    Invoke-Pnpm @("install", "--frozen-lockfile")

    Write-Step "Deploying the current checked-out GEM revision to production with the managed worker environment."
    Invoke-Pnpm @("dlx", "vercel@latest", "deploy", "--prod", "--yes")
  }
  finally {
    Pop-Location
  }
}
finally {
  if (Test-Path $tempEnvironmentFile) {
    Remove-Item -LiteralPath $tempEnvironmentFile -Force
  }
}

Write-Step "Running the complete worker readiness check."
Invoke-Worker "Check"
Write-Step "Activation is complete. Start continuous processing with:"
Write-Host "  pwsh -NoLogo -NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Mode Run" -ForegroundColor Green
