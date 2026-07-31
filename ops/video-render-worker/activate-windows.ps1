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
$ProductionAlias = "https://www.gemcybersecurityassist.com"
$SupabaseUrl = "https://slzdjoqpzbkwzuaexlkj.supabase.co"
$StorageBucket = "gem-video-renders"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$WorkerHome = Join-Path $env:LOCALAPPDATA "GEM\video-render-worker"
$WorkerStateDirectory = Join-Path $WorkerHome "state"
$WorkerEnvironmentFile = Join-Path $WorkerHome "worker.production.env"
$WorkerStdoutLog = Join-Path $WorkerHome "worker.stdout.log"
$WorkerStderrLog = Join-Path $WorkerHome "worker.stderr.log"
$CompleteNegativePrompt = "real company logos, credentials, private data, unreadable text, distorted faces, weapons, exploit instructions"
$ManagedVercelNames = @(
  "VIDEO_RENDER_DISPATCH_MODE",
  "COMFYUI_WORKFLOW_JSON",
  "COMFYUI_PROMPT_NODE_ID",
  "COMFYUI_NEGATIVE_PROMPT_NODE_ID",
  "COMFYUI_SEED_NODE_ID",
  "COMFYUI_DEFAULT_NEGATIVE_PROMPT",
  "VIDEO_RENDER_CALLBACK_SECRET",
  "VIDEO_RENDER_STORAGE_URL",
  "VIDEO_RENDER_STORAGE_KEY",
  "VIDEO_RENDER_STORAGE_AUTH_ORIGIN",
  "VIDEO_ASSET_ALLOWED_ORIGINS"
)
$SensitiveVercelNames = @(
  "COMFYUI_WORKFLOW_JSON",
  "VIDEO_RENDER_CALLBACK_SECRET",
  "VIDEO_RENDER_STORAGE_KEY"
)

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

function Merge-OriginAllowlist([string]$Existing, [string]$RequiredOrigin) {
  $origins = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
  foreach ($candidate in ($Existing -split ',')) {
    $normalized = $candidate.Trim().TrimEnd('/')
    if ($normalized) { [void]$origins.Add($normalized) }
  }
  [void]$origins.Add($RequiredOrigin.Trim().TrimEnd('/'))
  return (($origins | Sort-Object) -join ',')
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
    throw "Failed to remove Vercel environment variable '$Name'; production configuration may be out of sync. $($_.Exception.Message)"
  }
}

function Get-VercelProductionEnvironment {
  $tempFile = Join-Path ([IO.Path]::GetTempPath()) ("gem-vercel-env-{0}.tmp" -f [Guid]::NewGuid())
  try {
    Invoke-Pnpm @("dlx", "vercel@latest", "env", "pull", $tempFile, "--environment=production", "--yes")
    return Get-EnvironmentMap $tempFile
  }
  finally {
    if (Test-Path $tempFile) { Remove-Item -LiteralPath $tempFile -Force }
  }
}

function Restore-VercelProductionEnvironment([hashtable]$PreviousEnvironment) {
  Write-Step "Restoring the previous production worker environment."
  $currentEnvironment = Get-VercelProductionEnvironment
  foreach ($name in $ManagedVercelNames) {
    if ($PreviousEnvironment.ContainsKey($name)) {
      Set-VercelValue $name ([string]$PreviousEnvironment[$name]) ($SensitiveVercelNames -contains $name)
    }
    elseif ($currentEnvironment.ContainsKey($name)) {
      Remove-VercelValue $name
    }
  }
}

function Protect-WorkerFile([string]$Path) {
  $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $currentSid = $currentIdentity.User
  $acl = Get-Acl -LiteralPath $Path
  $acl.SetAccessRuleProtection($true, $false)
  foreach ($existingRule in @($acl.Access)) {
    [void]$acl.RemoveAccessRuleSpecific($existingRule)
  }
  $currentUserRule = [Security.AccessControl.FileSystemAccessRule]::new(
    $currentSid,
    [Security.AccessControl.FileSystemRights]::FullControl,
    [Security.AccessControl.AccessControlType]::Allow
  )
  [void]$acl.AddAccessRule($currentUserRule)
  Set-Acl -LiteralPath $Path -AclObject $acl

  $verifiedAcl = Get-Acl -LiteralPath $Path
  $unexpectedRules = @(
    $verifiedAcl.Access | Where-Object {
      try {
        $ruleSid = $_.IdentityReference.Translate([Security.Principal.SecurityIdentifier])
        $ruleSid.Value -ne $currentSid.Value
      }
      catch {
        $true
      }
    }
  )
  if ($unexpectedRules.Count -ne 0) {
    throw "Failed to remove non-current-user access rules from $Path."
  }
}

function Initialize-ProtectedWorkerFile([string]$Path) {
  $parent = Split-Path -Parent $Path
  New-Item -ItemType Directory -Force -Path $parent | Out-Null
  if (-not (Test-Path -LiteralPath $Path)) {
    [IO.File]::WriteAllText($Path, "", [Text.UTF8Encoding]::new($false))
  }
  Protect-WorkerFile $Path
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
  Initialize-ProtectedWorkerFile $WorkerEnvironmentFile
  [IO.File]::WriteAllLines($WorkerEnvironmentFile, $lines, [Text.UTF8Encoding]::new($false))
  Protect-WorkerFile $WorkerEnvironmentFile
}

function Restore-WorkerEnvironment([bool]$Existed, [string]$Content) {
  if ($Existed) {
    Initialize-ProtectedWorkerFile $WorkerEnvironmentFile
    [IO.File]::WriteAllText($WorkerEnvironmentFile, $Content, [Text.UTF8Encoding]::new($false))
    Protect-WorkerFile $WorkerEnvironmentFile
  }
  elseif (Test-Path $WorkerEnvironmentFile) {
    Remove-Item -LiteralPath $WorkerEnvironmentFile -Force
  }
}

function Assert-WorkflowNode(
  [object]$Workflow,
  [string]$NodeId,
  [string]$RequiredInput,
  [string]$Label
) {
  if (-not $NodeId) { return }
  $nodeProperty = $Workflow.PSObject.Properties[$NodeId]
  if ($null -eq $nodeProperty -or $null -eq $nodeProperty.Value) {
    throw "$Label node '$NodeId' does not exist in the supplied ComfyUI workflow."
  }
  $inputsProperty = $nodeProperty.Value.PSObject.Properties["inputs"]
  if ($null -eq $inputsProperty -or $null -eq $inputsProperty.Value) {
    throw "$Label node '$NodeId' has no inputs object."
  }
  if (-not ($inputsProperty.Value.PSObject.Properties.Name -contains $RequiredInput)) {
    throw "$Label node '$NodeId' does not expose the required '$RequiredInput' input."
  }
}

function Test-ComfyUiPreflight([string]$BearerToken) {
  Write-Step "Checking local ComfyUI before changing production."
  $headers = @{}
  if ($BearerToken) { $headers["Authorization"] = "Bearer $BearerToken" }
  try {
    $response = Invoke-WebRequest -Uri "$($ComfyUiBaseUrl.TrimEnd('/'))/system_stats" -Headers $headers -Method Get -TimeoutSec 30
    if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 300) {
      throw "HTTP $($response.StatusCode)"
    }
  }
  catch {
    throw "ComfyUI preflight failed at '$ComfyUiBaseUrl'. $($_.Exception.Message)"
  }
}

function Test-WorkerStateDirectory {
  New-Item -ItemType Directory -Force -Path $WorkerStateDirectory | Out-Null
  $probe = Join-Path $WorkerStateDirectory ("activation-probe-{0}.tmp" -f [Guid]::NewGuid())
  try {
    [IO.File]::WriteAllText($probe, "GEM worker journal probe", [Text.UTF8Encoding]::new($false))
  }
  finally {
    if (Test-Path $probe) { Remove-Item -LiteralPath $probe -Force }
  }
}

function Test-StorageWritePreflight([string]$StorageKey) {
  Write-Step "Verifying private storage write and cleanup access before activation."
  $probePath = "activation-probes/$([Guid]::NewGuid().ToString('N')).mp4"
  $objectUri = "$SupabaseUrl/storage/v1/object/$StorageBucket/$probePath"
  $bucketUri = "$SupabaseUrl/storage/v1/object/$StorageBucket"
  $headers = @{
    Authorization = "Bearer $StorageKey"
    apikey = $StorageKey
    "x-upsert" = "false"
  }
  $uploaded = $false
  try {
    $probeBytes = [Text.Encoding]::ASCII.GetBytes("GEM_VIDEO_STORAGE_WRITE_PROBE")
    $upload = Invoke-WebRequest -Uri $objectUri -Method Post -Headers $headers -Body $probeBytes -ContentType "video/mp4" -TimeoutSec 60
    if ($upload.StatusCode -lt 200 -or $upload.StatusCode -ge 300) {
      throw "Storage upload returned HTTP $($upload.StatusCode)."
    }
    $uploaded = $true

    $deleteBody = @{ prefixes = @($probePath) } | ConvertTo-Json -Compress
    $delete = Invoke-WebRequest -Uri $bucketUri -Method Delete -Headers $headers -Body $deleteBody -ContentType "application/json" -TimeoutSec 60
    if ($delete.StatusCode -lt 200 -or $delete.StatusCode -ge 300) {
      throw "Storage cleanup returned HTTP $($delete.StatusCode)."
    }
    $uploaded = $false
  }
  catch {
    $orphan = if ($uploaded) { " Probe object may remain at '$probePath'." } else { "" }
    throw "Dedicated storage credential preflight failed.$orphan $($_.Exception.Message)"
  }
}

function Stop-ExistingWorkerProcesses {
  $matches = @(
    Get-CimInstance Win32_Process | Where-Object {
      $_.ProcessId -ne $PID -and
      $_.CommandLine -and
      $_.CommandLine -match 'scripts[\\/]video-render-worker\.ts'
    }
  )
  foreach ($process in $matches) {
    Write-Step "Stopping existing GEM video worker process $($process.ProcessId) before credential rotation."
    Stop-Process -Id $process.ProcessId -Force
    Wait-Process -Id $process.ProcessId -ErrorAction SilentlyContinue
  }
  return $matches.Count -gt 0
}

function Start-WorkerProcess {
  New-Item -ItemType Directory -Force -Path $WorkerHome | Out-Null
  $arguments = "-NoLogo -NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Mode Run"
  $process = Start-Process -FilePath "pwsh" -ArgumentList $arguments -WindowStyle Hidden -RedirectStandardOutput $WorkerStdoutLog -RedirectStandardError $WorkerStderrLog -PassThru
  Start-Sleep -Seconds 2
  if ($process.HasExited) {
    throw "The GEM video worker process exited during startup. Check $WorkerStderrLog."
  }
  Write-Step "Started GEM video worker process $($process.Id)."
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

function Redeploy-CanonicalProductionArtifact {
  Write-Step "Redeploying the current canonical Git-integrated production artifact."
  Invoke-Pnpm @("dlx", "vercel@latest", "redeploy", $ProductionAlias, "--yes")
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
Assert-Command "pwsh"
Assert-Command "Get-CimInstance"

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
$negativePromptNodeId = (Read-Host "Negative prompt node ID (press Enter if unused)").Trim()
$seedNodeId = (Read-Host "Seed node ID (press Enter if unused)").Trim()
Assert-WorkflowNode $workflowObject $promptNodeId "text" "Positive prompt"
Assert-WorkflowNode $workflowObject $negativePromptNodeId "text" "Negative prompt"
Assert-WorkflowNode $workflowObject $seedNodeId "seed" "Seed"

Write-Step "Authenticating the Vercel CLI."
$env:VERCEL_ORG_ID = $VercelOrgId
$env:VERCEL_PROJECT_ID = $VercelProjectId
& pnpm dlx vercel@latest whoami *> $null
if ($LASTEXITCODE -ne 0) {
  Invoke-Pnpm @("dlx", "vercel@latest", "login")
}

Write-Step "Reading the existing production worker configuration without printing secrets."
$previousProductionEnvironment = Get-VercelProductionEnvironment
$storageKey = if ($previousProductionEnvironment.ContainsKey("VIDEO_RENDER_STORAGE_KEY")) {
  [string]$previousProductionEnvironment["VIDEO_RENDER_STORAGE_KEY"]
} else {
  ""
}
if (-not $storageKey) {
  $secureStorageKey = Read-Host "Dedicated bucket-scoped Supabase storage credential" -AsSecureString
  $storageKey = Convert-SecureStringToPlainText $secureStorageKey
}
if (-not $storageKey) {
  throw "A dedicated bucket-scoped VIDEO_RENDER_STORAGE_KEY is required; the Supabase service-role key is not accepted."
}

$secureComfyToken = Read-Host "ComfyUI bearer token (press Enter if localhost has no token)" -AsSecureString
$comfyBearerToken = Convert-SecureStringToPlainText $secureComfyToken
$existingAssetOrigins = if ($previousProductionEnvironment.ContainsKey("VIDEO_ASSET_ALLOWED_ORIGINS")) {
  [string]$previousProductionEnvironment["VIDEO_ASSET_ALLOWED_ORIGINS"]
} else {
  ""
}
$mergedAssetOrigins = Merge-OriginAllowlist $existingAssetOrigins $SupabaseUrl

Test-ComfyUiPreflight $comfyBearerToken
Test-WorkerStateDirectory
Test-StorageWritePreflight $storageKey

$previousWorkerEnvironmentExisted = Test-Path $WorkerEnvironmentFile
$previousWorkerEnvironmentContent = if ($previousWorkerEnvironmentExisted) {
  Get-Content -LiteralPath $WorkerEnvironmentFile -Raw
} else {
  ""
}
$existingWorkerWasRunning = Stop-ExistingWorkerProcesses
$callbackSecret = New-CallbackSecret

try {
  Write-Step "Applying the managed production worker configuration."
  Set-VercelValue "COMFYUI_WORKFLOW_JSON" $workflowJson $true
  Set-VercelValue "COMFYUI_PROMPT_NODE_ID" $promptNodeId $false
  if ($negativePromptNodeId) {
    Set-VercelValue "COMFYUI_NEGATIVE_PROMPT_NODE_ID" $negativePromptNodeId $false
  }
  elseif ($previousProductionEnvironment.ContainsKey("COMFYUI_NEGATIVE_PROMPT_NODE_ID")) {
    Remove-VercelValue "COMFYUI_NEGATIVE_PROMPT_NODE_ID"
  }
  if ($seedNodeId) {
    Set-VercelValue "COMFYUI_SEED_NODE_ID" $seedNodeId $false
  }
  elseif ($previousProductionEnvironment.ContainsKey("COMFYUI_SEED_NODE_ID")) {
    Remove-VercelValue "COMFYUI_SEED_NODE_ID"
  }
  Set-VercelValue "COMFYUI_DEFAULT_NEGATIVE_PROMPT" $CompleteNegativePrompt $false
  Set-VercelValue "VIDEO_RENDER_CALLBACK_SECRET" $callbackSecret $true
  Set-VercelValue "VIDEO_RENDER_STORAGE_URL" $SupabaseUrl $false
  Set-VercelValue "VIDEO_RENDER_STORAGE_KEY" $storageKey $true
  Set-VercelValue "VIDEO_RENDER_STORAGE_AUTH_ORIGIN" $SupabaseUrl $false
  Set-VercelValue "VIDEO_ASSET_ALLOWED_ORIGINS" $mergedAssetOrigins $false
  Set-VercelValue "VIDEO_RENDER_DISPATCH_MODE" "worker" $false

  Write-Step "Writing the local worker configuration with current-user-only permissions."
  Write-WorkerEnvironment $callbackSecret $storageKey $comfyBearerToken

  Push-Location $RepoRoot
  try {
    Write-Step "Installing locked repository dependencies."
    Invoke-Pnpm @("install", "--frozen-lockfile")
  }
  finally {
    Pop-Location
  }

  Redeploy-CanonicalProductionArtifact

  Write-Step "Running the complete post-deployment worker readiness check."
  Invoke-Worker "Check"

  if ($existingWorkerWasRunning) {
    Write-Step "Restarting the previously running worker with the rotated production credential."
    Start-WorkerProcess
  }
}
catch {
  $activationError = $_
  Write-Warning "Activation failed. Restoring the previous production and local worker configuration."
  try {
    Restore-VercelProductionEnvironment $previousProductionEnvironment
    Restore-WorkerEnvironment $previousWorkerEnvironmentExisted $previousWorkerEnvironmentContent
    Redeploy-CanonicalProductionArtifact
    if ($existingWorkerWasRunning -and $previousWorkerEnvironmentExisted) {
      Start-WorkerProcess
    }
  }
  catch {
    throw "Activation failed and rollback was incomplete. Activation error: $($activationError.Exception.Message). Rollback error: $($_.Exception.Message)"
  }
  throw "Activation failed and was rolled back. $($activationError.Exception.Message)"
}

Write-Step "Activation is complete. Start continuous processing with:"
Write-Host "  pwsh -NoLogo -NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Mode Run" -ForegroundColor Green
