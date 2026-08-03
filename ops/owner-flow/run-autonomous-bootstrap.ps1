#requires -Version 7.0
[CmdletBinding()]
param(
  [string]$Repository = "C:\GEM\gem-enterprise",
  [string]$Branch = "feat/governed-owner-command-flow",
  [int]$PullRequest = 287,
  [string]$ProjectId = "prj_VDGqnA7wZt2E65LLvT94ZOpnYc2Z",
  [string]$TeamSlug = "admin-25521151s-projects",
  [string]$ProductionHealthUrl = "https://www.gemcybersecurityassist.com/api/v1/production/health",
  [int]$MaxHours = 8,
  [int]$PollSeconds = 45,
  [int]$MaximumTransientRetries = 3,
  [switch]$AutoInstallTools,
  [switch]$AutoRepairKnown,
  [switch]$PublishBranch,
  [switch]$ApproveProductionDatabaseRepair,
  [switch]$ApproveMerge,
  [switch]$ApproveProductionActivation,
  [switch]$StartWorker,
  [string]$RepairAgentCommand = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location -LiteralPath $Repository

$origin = (& git remote get-url origin).Trim()
if ($origin -notmatch '(?i)(github\.com[:/])support371/gem-enterprise(?:\.git)?$') {
  throw "This is not the canonical support371/gem-enterprise checkout."
}

$changes = @(& git status --porcelain)
if ($changes.Count -gt 0) {
  & git status --short
  throw "The repository is not clean. The bootstrap will not overwrite local work."
}

& git fetch origin --prune
if ($LASTEXITCODE -ne 0) { throw "Git fetch failed." }
& git switch $Branch
if ($LASTEXITCODE -ne 0) { throw "Could not switch to $Branch." }
& git pull --ff-only origin $Branch
if ($LASTEXITCODE -ne 0) { throw "Could not update $Branch safely." }

$target = Join-Path $Repository "ops\owner-flow\run-autonomous-windows.ps1"
if (-not (Test-Path -LiteralPath $target)) {
  throw "Autonomous flow script not found: $target"
}

$text = Get-Content -LiteralPath $target -Raw
$fixed = $text.Replace('$exitCode:', '${exitCode}:')

$tokens = $null
$parseErrors = $null
[void][System.Management.Automation.Language.Parser]::ParseInput(
  $fixed,
  [ref]$tokens,
  [ref]$parseErrors
)

if ($parseErrors.Count -gt 0) {
  $details = $parseErrors | ForEach-Object {
    "Line $($_.Extent.StartLineNumber), column $($_.Extent.StartColumnNumber): $($_.Message)"
  }
  throw "Autonomous script still contains parser errors:`n$($details -join "`n")"
}

if ($fixed -ne $text) {
  Write-Host "Repairing the autonomous PowerShell parser defect..." -ForegroundColor Yellow
  Set-Content -LiteralPath $target -Value $fixed -Encoding utf8 -NoNewline

  & git add -- "ops/owner-flow/run-autonomous-windows.ps1"
  if ($LASTEXITCODE -ne 0) { throw "Could not stage the parser repair." }

  & git commit -m "fix: correct autonomous PowerShell parser interpolation"
  if ($LASTEXITCODE -ne 0) { throw "Could not commit the parser repair." }

  & git push origin $Branch
  if ($LASTEXITCODE -ne 0) { throw "Could not publish the parser repair." }

  Write-Host "Parser repair committed and published." -ForegroundColor Green
}
else {
  Write-Host "Autonomous script syntax is already repaired." -ForegroundColor Green
}

$invoke = @{
  Repository = $Repository
  Branch = $Branch
  PullRequest = $PullRequest
  ProjectId = $ProjectId
  TeamSlug = $TeamSlug
  ProductionHealthUrl = $ProductionHealthUrl
  MaxHours = $MaxHours
  PollSeconds = $PollSeconds
  MaximumTransientRetries = $MaximumTransientRetries
}

if ($AutoInstallTools) { $invoke.AutoInstallTools = $true }
if ($AutoRepairKnown) { $invoke.AutoRepairKnown = $true }
if ($PublishBranch) { $invoke.PublishBranch = $true }
if ($ApproveProductionDatabaseRepair) { $invoke.ApproveProductionDatabaseRepair = $true }
if ($ApproveMerge) { $invoke.ApproveMerge = $true }
if ($ApproveProductionActivation) { $invoke.ApproveProductionActivation = $true }
if ($StartWorker) { $invoke.StartWorker = $true }
if (-not [string]::IsNullOrWhiteSpace($RepairAgentCommand)) {
  $invoke.RepairAgentCommand = $RepairAgentCommand
}

Write-Host "Starting the repaired autonomous GEM flow..." -ForegroundColor Cyan
& $target @invoke
exit $LASTEXITCODE
