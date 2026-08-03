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
$ProgressPreference = "SilentlyContinue"

$Owner = "support371"
$RepositoryName = "gem-enterprise"
$RepositorySlug = "$Owner/$RepositoryName"
$CanonicalOriginPattern = "(?i)(github\.com[:/])support371/gem-enterprise(?:\.git)?$"
$Deadline = (Get-Date).AddHours($MaxHours)
$RunId = Get-Date -Format "yyyyMMdd-HHmmss"
$StateRoot = Join-Path $env:LOCALAPPDATA "GEM\owner-flow\autonomous"
$EvidenceRoot = Join-Path $StateRoot $RunId
$StatePath = Join-Path $StateRoot "latest-state.json"
$SummaryPath = Join-Path $EvidenceRoot "summary.json"
$TranscriptPath = Join-Path $EvidenceRoot "transcript.log"
New-Item -ItemType Directory -Path $EvidenceRoot -Force | Out-Null

$script:State = [ordered]@{
  runId = $RunId
  startedAt = (Get-Date).ToUniversalTime().ToString("o")
  repository = $Repository
  branch = $Branch
  pullRequest = $PullRequest
  headCommit = $null
  phase = "bootstrap"
  completed = @()
  blockers = @()
  warnings = @()
  previewUrl = $null
  productionHealth = $null
  ci = $null
  outcome = "running"
  evidenceRoot = $EvidenceRoot
}

function Save-State {
  $script:State.updatedAt = (Get-Date).ToUniversalTime().ToString("o")
  $json = $script:State | ConvertTo-Json -Depth 20
  $json | Set-Content -LiteralPath $StatePath -Encoding utf8
  $json | Set-Content -LiteralPath $SummaryPath -Encoding utf8
}

function Write-Step {
  param([Parameter(Mandatory)][string]$Message)
  Write-Host "`n[GEM AUTONOMOUS] $Message" -ForegroundColor Cyan
}

function Add-Completed {
  param([Parameter(Mandatory)][string]$Name)
  if ($script:State.completed -notcontains $Name) {
    $script:State.completed = @($script:State.completed) + $Name
  }
  Save-State
}

function Add-Blocker {
  param(
    [Parameter(Mandatory)][string]$Code,
    [Parameter(Mandatory)][string]$Message,
    [string]$Evidence = ""
  )
  $existing = @($script:State.blockers | Where-Object { $_.code -eq $Code })
  if ($existing.Count -eq 0) {
    $script:State.blockers = @($script:State.blockers) + [ordered]@{
      code = $Code
      message = $Message
      evidence = $Evidence
      detectedAt = (Get-Date).ToUniversalTime().ToString("o")
    }
  }
  Save-State
  Write-Host "[BLOCKER] $Message" -ForegroundColor Yellow
}

function Clear-Blocker {
  param([Parameter(Mandatory)][string]$Code)
  $script:State.blockers = @($script:State.blockers | Where-Object { $_.code -ne $Code })
  Save-State
}

function Invoke-Captured {
  param(
    [Parameter(Mandatory)][string]$File,
    [string[]]$Arguments = @(),
    [string]$LogName = "command",
    [switch]$AllowFailure
  )

  $logPath = Join-Path $EvidenceRoot "$LogName.log"
  Write-Host "RUN: $File $($Arguments -join ' ')" -ForegroundColor DarkGray
  $output = & $File @Arguments 2>&1 | Tee-Object -FilePath $logPath -Append | Out-String
  $exitCode = $LASTEXITCODE

  if (($exitCode -ne 0) -and (-not $AllowFailure)) {
    throw "Command failed with exit code $exitCode: $File $($Arguments -join ' ')"
  }

  [pscustomobject]@{
    ExitCode = $exitCode
    Output = $output
    LogPath = $logPath
  }
}

function Ensure-Command {
  param(
    [Parameter(Mandatory)][string]$Name,
    [string]$WingetId = ""
  )

  if (Get-Command $Name -ErrorAction SilentlyContinue) {
    return
  }

  if (-not $AutoInstallTools -or [string]::IsNullOrWhiteSpace($WingetId)) {
    throw "Required command '$Name' is unavailable. Rerun with -AutoInstallTools or install it manually."
  }

  Write-Step "Installing prerequisite $Name"
  Invoke-Captured winget @(
    "install", "--id", $WingetId, "--source", "winget", "--silent",
    "--accept-package-agreements", "--accept-source-agreements"
  ) -LogName "install-$Name" | Out-Null

  $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = "$machinePath;$userPath"

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name was installed but is not visible in this terminal. Reopen PowerShell 7 and rerun the same command."
  }
}

function Assert-Environment {
  Write-Step "Verifying Windows prerequisites and authenticated tools"
  if ($PSVersionTable.PSVersion.Major -lt 7) {
    throw "PowerShell 7 or newer is required."
  }

  Ensure-Command git "Git.Git"
  Ensure-Command node "OpenJS.NodeJS.LTS"

  if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    if (-not $AutoInstallTools) {
      throw "Required command 'pnpm' is unavailable. Rerun with -AutoInstallTools."
    }
    Write-Step "Activating the repository-pinned pnpm toolchain"
    Invoke-Captured corepack @("enable") -LogName "corepack-enable" | Out-Null
    Invoke-Captured corepack @("prepare", "pnpm@10.28.0", "--activate") -LogName "corepack-pnpm" | Out-Null
  }

  if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    if (-not $AutoInstallTools) {
      throw "Required command 'vercel' is unavailable. Rerun with -AutoInstallTools."
    }
    Write-Step "Installing the reviewed Vercel CLI version"
    Invoke-Captured npm.cmd @("install", "--global", "vercel@58.4.4") -LogName "install-vercel" | Out-Null
  }

  Ensure-Command gh "GitHub.cli"

  $nodeVersion = (& node --version).Trim()
  if ($nodeVersion -notmatch '^v24\.') {
    throw "Node.js 24.x is required; detected $nodeVersion."
  }

  $vercelAuth = Invoke-Captured vercel @("whoami") -LogName "vercel-auth" -AllowFailure
  if ($vercelAuth.ExitCode -ne 0) {
    Add-Blocker "VERCEL_AUTH" "Vercel authentication is required once. Run 'vercel login', then rerun this flow." $vercelAuth.LogPath
  } else {
    Clear-Blocker "VERCEL_AUTH"
  }

  $githubAuth = Invoke-Captured gh @("auth", "status") -LogName "github-auth" -AllowFailure
  if ($githubAuth.ExitCode -ne 0) {
    Add-Blocker "GITHUB_AUTH" "GitHub CLI authentication is required once. Run 'gh auth login', then rerun this flow." $githubAuth.LogPath
  } else {
    Clear-Blocker "GITHUB_AUTH"
  }

  Add-Completed "prerequisites"
}

function Assert-Repository {
  Write-Step "Verifying the canonical repository and clean worktree"
  if (-not (Test-Path -LiteralPath (Join-Path $Repository ".git"))) {
    if (-not $AutoInstallTools) {
      throw "Canonical checkout not found at $Repository."
    }
    New-Item -ItemType Directory -Path (Split-Path $Repository -Parent) -Force | Out-Null
    Invoke-Captured git @("clone", "https://github.com/$RepositorySlug.git", $Repository) -LogName "git-clone" | Out-Null
  }

  Set-Location -LiteralPath $Repository
  $origin = (& git remote get-url origin).Trim()
  if ($origin -notmatch $CanonicalOriginPattern) {
    throw "This checkout is not connected to $RepositorySlug. Detected origin: $origin"
  }

  $changes = @(& git status --porcelain)
  if ($changes.Count -gt 0) {
    & git status --short
    throw "The repository contains uncommitted or untracked changes. Autonomous repair will not overwrite them."
  }

  Invoke-Captured git @("fetch", "origin", "--prune") -LogName "git-fetch" | Out-Null
  Invoke-Captured git @("switch", $Branch) -LogName "git-switch" | Out-Null
  Invoke-Captured git @("pull", "--ff-only", "origin", $Branch) -LogName "git-pull" | Out-Null

  $script:State.headCommit = (& git rev-parse HEAD).Trim()
  Add-Completed "repository-boundary"
}

function Ensure-VercelLink {
  if (@($script:State.blockers | Where-Object { $_.code -eq "VERCEL_AUTH" }).Count -gt 0) {
    return
  }

  Write-Step "Linking the exact canonical Vercel project"
  $result = Invoke-Captured vercel @(
    "link", "--yes", "--project", $ProjectId, "--scope", $TeamSlug
  ) -LogName "vercel-link" -AllowFailure

  if ($result.ExitCode -ne 0) {
    Add-Blocker "VERCEL_LINK" "The canonical Vercel project could not be linked." $result.LogPath
    return
  }

  $projectFile = Join-Path $Repository ".vercel\project.json"
  if (-not (Test-Path -LiteralPath $projectFile)) {
    Add-Blocker "VERCEL_LINK" "Vercel linking completed without creating .vercel/project.json." $result.LogPath
    return
  }

  $project = Get-Content -LiteralPath $projectFile -Raw | ConvertFrom-Json
  if ($project.projectId -ne $ProjectId) {
    throw "Vercel linked the wrong project. Expected $ProjectId; detected $($project.projectId)."
  }

  Clear-Blocker "VERCEL_LINK"
  Add-Completed "vercel-link"
}

function Invoke-OwnerAudit {
  Write-Step "Running the existing governed read-only Audit"
  $launcher = Join-Path $Repository "ops\owner-flow\run-all-windows.cmd"
  if (-not (Test-Path -LiteralPath $launcher)) {
    throw "Owner-flow launcher not found: $launcher"
  }

  Invoke-Captured $launcher @("-Mode", "Audit") -LogName "owner-audit" -AllowFailure | Out-Null
  $reportPath = Join-Path $env:LOCALAPPDATA "GEM\owner-flow\last-readiness.json"
  if (-not (Test-Path -LiteralPath $reportPath)) {
    Add-Blocker "AUDIT_REPORT" "Audit did not create last-readiness.json." (Join-Path $EvidenceRoot "owner-audit.log")
    return $null
  }

  Copy-Item -LiteralPath $reportPath -Destination (Join-Path $EvidenceRoot "last-readiness.json") -Force
  Add-Completed "audit"
  return Get-Content -LiteralPath $reportPath -Raw | ConvertFrom-Json
}

function Get-ProductionHealth {
  try {
    $response = Invoke-WebRequest -Uri $ProductionHealthUrl -Method Get -TimeoutSec 45 -SkipHttpErrorCheck
    $body = $null
    try { $body = $response.Content | ConvertFrom-Json } catch { $body = $response.Content }
    $health = [ordered]@{
      statusCode = [int]$response.StatusCode
      body = $body
      checkedAt = (Get-Date).ToUniversalTime().ToString("o")
    }
    $script:State.productionHealth = $health
    Save-State
    return $health
  } catch {
    $health = [ordered]@{
      statusCode = 0
      body = $_.Exception.Message
      checkedAt = (Get-Date).ToUniversalTime().ToString("o")
    }
    $script:State.productionHealth = $health
    Save-State
    return $health
  }
}

function Get-LatestProductionDeploymentUrl {
  $list = Invoke-Captured vercel @(
    "list", "--prod", "--status", "READY", "--scope", $TeamSlug
  ) -LogName "vercel-production-list" -AllowFailure

  if ($list.ExitCode -ne 0) { return $null }
  $match = [regex]::Match($list.Output, '(?i)(?:https://)?[a-z0-9][a-z0-9.-]*\.vercel\.app')
  if (-not $match.Success) { return $null }
  $url = $match.Value
  if ($url -notmatch '^https://') { $url = "https://$url" }
  return $url
}

function Repair-KnownDatabaseFailure {
  $health = Get-ProductionHealth
  if ($health.statusCode -eq 200) {
    Clear-Blocker "PRODUCTION_DATABASE"
    Add-Completed "production-database-health"
    return $true
  }

  if (@($script:State.blockers | Where-Object { $_.code -in @("VERCEL_AUTH", "VERCEL_LINK") }).Count -gt 0) {
    return $false
  }

  Write-Step "Diagnosing the production database readiness failure"
  $logs = Invoke-Captured vercel @(
    "logs", "--project", $ProjectId, "--environment", "production",
    "--status-code", "503", "--since", "2h", "--expand", "--limit", "100",
    "--no-branch", "--scope", $TeamSlug
  ) -LogName "production-503" -AllowFailure

  $knownMissingVariable = $logs.Output -match 'Environment variable not found:\s*POSTGRES_PRISMA_URL'
  if (-not $knownMissingVariable) {
    Add-Blocker "PRODUCTION_DATABASE" "Production database readiness is unhealthy and does not match the approved automatic repair signature." $logs.LogPath
    return $false
  }

  if (-not $AutoRepairKnown -or -not $ApproveProductionDatabaseRepair) {
    Add-Blocker "PRODUCTION_DATABASE" "POSTGRES_PRISMA_URL is missing. Rerun with -AutoRepairKnown -ApproveProductionDatabaseRepair to enter the approved database URL and redeploy the existing production artifact." $logs.LogPath
    return $false
  }

  $approval = Read-Host "Type exactly APPLY APPROVED GEM CONFIGURATION"
  if ($approval -cne "APPLY APPROVED GEM CONFIGURATION") {
    Add-Blocker "PRODUCTION_DATABASE" "Database configuration approval was not provided." $logs.LogPath
    return $false
  }

  $envList = Invoke-Captured vercel @("env", "ls", "production", "--scope", $TeamSlug) -LogName "production-env-list" -AllowFailure
  if ($envList.Output -notmatch '(?m)\bPOSTGRES_PRISMA_URL\b') {
    Write-Host "Vercel will request the production PostgreSQL URL securely. The value is not written to this flow's logs." -ForegroundColor Yellow
    & vercel env add POSTGRES_PRISMA_URL production --sensitive --scope $TeamSlug
    if ($LASTEXITCODE -ne 0) {
      Add-Blocker "PRODUCTION_DATABASE" "Vercel rejected POSTGRES_PRISMA_URL." $logs.LogPath
      return $false
    }
  }

  $deployApproval = Read-Host "Type exactly DEPLOY VERIFIED GEM PRODUCTION"
  if ($deployApproval -cne "DEPLOY VERIFIED GEM PRODUCTION") {
    Add-Blocker "PRODUCTION_DATABASE" "Production redeployment approval was not provided." $logs.LogPath
    return $false
  }

  $productionUrl = Get-LatestProductionDeploymentUrl
  if ([string]::IsNullOrWhiteSpace($productionUrl)) {
    Add-Blocker "PRODUCTION_DATABASE" "No READY production deployment could be resolved for safe redeployment." $logs.LogPath
    return $false
  }

  $redeploy = Invoke-Captured vercel @(
    "redeploy", $productionUrl, "--target=production", "--scope", $TeamSlug
  ) -LogName "production-redeploy" -AllowFailure
  if ($redeploy.ExitCode -ne 0) {
    Add-Blocker "PRODUCTION_DATABASE" "The existing production artifact could not be redeployed." $redeploy.LogPath
    return $false
  }

  $waitUntil = (Get-Date).AddMinutes(15)
  do {
    Start-Sleep -Seconds 15
    $health = Get-ProductionHealth
    Write-Host "Production health: HTTP $($health.statusCode)"
    if ($health.statusCode -eq 200) {
      Clear-Blocker "PRODUCTION_DATABASE"
      Add-Completed "production-database-health"
      return $true
    }
  } while ((Get-Date) -lt $waitUntil)

  Add-Blocker "PRODUCTION_DATABASE" "Production remained unhealthy after the approved database repair." $redeploy.LogPath
  return $false
}

function Invoke-RepairAgent {
  param(
    [Parameter(Mandatory)][string]$FailureKind,
    [Parameter(Mandatory)][string]$EvidencePath
  )

  if ([string]::IsNullOrWhiteSpace($RepairAgentCommand)) {
    return $false
  }

  Write-Step "Invoking the configured repair-agent hook for $FailureKind"
  $env:GEM_REPAIR_KIND = $FailureKind
  $env:GEM_REPAIR_EVIDENCE = $EvidencePath
  $env:GEM_REPOSITORY = $Repository
  $env:GEM_BRANCH = $Branch
  $env:GEM_HEAD_COMMIT = $script:State.headCommit

  $agentLog = Join-Path $EvidenceRoot "repair-agent-$FailureKind.log"
  & $env:ComSpec /d /s /c $RepairAgentCommand 2>&1 | Tee-Object -FilePath $agentLog
  return ($LASTEXITCODE -eq 0)
}

function Invoke-LocalVerification {
  Write-Step "Installing locked dependencies when necessary and running complete local verification"

  if (-not (Test-Path -LiteralPath (Join-Path $Repository "node_modules"))) {
    $install = Invoke-Captured pnpm @("install", "--frozen-lockfile") -LogName "pnpm-install" -AllowFailure
    if ($install.ExitCode -ne 0) {
      Add-Blocker "DEPENDENCIES" "Locked dependency installation failed." $install.LogPath
      return $false
    }
  }

  $verify = Invoke-Captured pnpm @("run", "verify") -LogName "local-verify" -AllowFailure
  if ($verify.ExitCode -eq 0) {
    Clear-Blocker "LOCAL_VERIFY"
    Clear-Blocker "DEPENDENCIES"
    Add-Completed "local-verification"
    return $true
  }

  if ($AutoRepairKnown -and $verify.Output -match '(?i)eslint|lint') {
    Write-Step "Applying deterministic ESLint fixes and rerunning verification"
    $lintFix = Invoke-Captured pnpm @(
      "exec", "eslint", "src", "--ext", ".ts,.tsx", "--fix", "--max-warnings=0"
    ) -LogName "eslint-fix" -AllowFailure

    if ($lintFix.ExitCode -eq 0) {
      $secondVerify = Invoke-Captured pnpm @("run", "verify") -LogName "local-verify-after-lint" -AllowFailure
      if ($secondVerify.ExitCode -eq 0) {
        $changes = @(& git status --porcelain)
        if ($changes.Count -gt 0) {
          Invoke-Captured git @("add", "--all") -LogName "git-add-lint-repair" | Out-Null
          Invoke-Captured git @("commit", "-m", "fix: apply deterministic verification repairs") -LogName "git-commit-lint-repair" | Out-Null
          $script:State.headCommit = (& git rev-parse HEAD).Trim()
        }
        Clear-Blocker "LOCAL_VERIFY"
        Add-Completed "local-verification"
        return $true
      }
    }
  }

  if (Invoke-RepairAgent "local-verification" $verify.LogPath) {
    $postAgent = Invoke-Captured pnpm @("run", "verify") -LogName "local-verify-after-agent" -AllowFailure
    if ($postAgent.ExitCode -eq 0) {
      $changes = @(& git status --porcelain)
      if ($changes.Count -gt 0) {
        Invoke-Captured git @("add", "--all") -LogName "git-add-agent-repair" | Out-Null
        Invoke-Captured git @("commit", "-m", "fix: repair autonomous verification failure") -LogName "git-commit-agent-repair" | Out-Null
        $script:State.headCommit = (& git rev-parse HEAD).Trim()
      }
      Clear-Blocker "LOCAL_VERIFY"
      Add-Completed "local-verification"
      return $true
    }
  }

  Add-Blocker "LOCAL_VERIFY" "Complete local verification failed. The flow preserved evidence and continued with independent checks." $verify.LogPath
  return $false
}

function Publish-CurrentBranch {
  if (-not $PublishBranch) { return $false }
  if ($script:State.completed -notcontains "local-verification") { return $false }

  Write-Step "Publishing the verified branch"
  $push = Invoke-Captured git @("push", "-u", "origin", $Branch) -LogName "git-push" -AllowFailure
  if ($push.ExitCode -ne 0) {
    Add-Blocker "GIT_PUSH" "Verified branch push failed." $push.LogPath
    return $false
  }

  $script:State.headCommit = (& git rev-parse HEAD).Trim()
  Clear-Blocker "GIT_PUSH"
  Add-Completed "branch-published"
  return $true
}

function Ensure-PullRequest {
  if (@($script:State.blockers | Where-Object { $_.code -eq "GITHUB_AUTH" }).Count -gt 0) {
    return $false
  }

  Write-Step "Ensuring the draft pull request exists"
  $view = Invoke-Captured gh @(
    "pr", "view", $PullRequest.ToString(), "--repo", $RepositorySlug,
    "--json", "number,state,isDraft,headRefName,headRefOid,url"
  ) -LogName "pr-view" -AllowFailure

  if ($view.ExitCode -ne 0) {
    Add-Blocker "PULL_REQUEST" "Draft PR #$PullRequest could not be read." $view.LogPath
    return $false
  }

  $pr = $view.Output | ConvertFrom-Json
  if ($pr.state -ne "OPEN" -or $pr.headRefName -ne $Branch) {
    Add-Blocker "PULL_REQUEST" "PR #$PullRequest is not the expected open branch PR." $view.LogPath
    return $false
  }

  if ($pr.headRefOid -ne $script:State.headCommit) {
    Add-Blocker "PULL_REQUEST" "PR #$PullRequest does not yet point at the current local head." $view.LogPath
    return $false
  }

  Clear-Blocker "PULL_REQUEST"
  Add-Completed "pull-request"
  return $true
}

function Get-CiRun {
  $runs = Invoke-Captured gh @(
    "run", "list", "--repo", $RepositorySlug, "--commit", $script:State.headCommit,
    "--workflow", "Build Verification", "--limit", "10",
    "--json", "databaseId,status,conclusion,headSha,createdAt,url"
  ) -LogName "ci-runs" -AllowFailure

  if ($runs.ExitCode -ne 0 -or [string]::IsNullOrWhiteSpace($runs.Output)) {
    return $null
  }

  $items = @($runs.Output | ConvertFrom-Json | Sort-Object createdAt -Descending)
  return $items | Select-Object -First 1
}

function Wait-ForCi {
  if (@($script:State.blockers | Where-Object { $_.code -eq "GITHUB_AUTH" }).Count -gt 0) {
    return $false
  }

  Write-Step "Monitoring GitHub Build Verification and retrying transient failures"
  $retries = 0

  while ((Get-Date) -lt $Deadline) {
    $run = Get-CiRun
    if ($null -eq $run) {
      Write-Host "No Build Verification run found yet. Waiting $PollSeconds seconds..."
      Start-Sleep -Seconds $PollSeconds
      continue
    }

    $script:State.ci = [ordered]@{
      id = $run.databaseId
      status = $run.status
      conclusion = $run.conclusion
      url = $run.url
    }
    Save-State

    if ($run.status -ne "completed") {
      Write-Host "Build Verification is $($run.status). Waiting $PollSeconds seconds..."
      Start-Sleep -Seconds $PollSeconds
      continue
    }

    if ($run.conclusion -eq "success") {
      Clear-Blocker "CI"
      Add-Completed "github-verification"
      return $true
    }

    $failedLog = Join-Path $EvidenceRoot "ci-failed-$($run.databaseId).log"
    & gh run view $run.databaseId --repo $RepositorySlug --log-failed 2>&1 | Tee-Object -FilePath $failedLog | Out-Host
    $failedText = Get-Content -LiteralPath $failedLog -Raw -ErrorAction SilentlyContinue

    $transient = $failedText -match '(?i)timed out|rate limit|connection reset|network|502|503|504|runner.*lost|service unavailable|socket hang up'
    if ($transient -and $retries -lt $MaximumTransientRetries) {
      $retries++
      Write-Host "Transient CI failure detected. Retrying failed jobs ($retries/$MaximumTransientRetries)." -ForegroundColor Yellow
      & gh run rerun $run.databaseId --repo $RepositorySlug --failed
      Start-Sleep -Seconds $PollSeconds
      continue
    }

    if (Invoke-RepairAgent "github-ci" $failedLog) {
      $changes = @(& git status --porcelain)
      if ($changes.Count -gt 0) {
        Invoke-Captured pnpm @("run", "verify") -LogName "verify-after-ci-agent" | Out-Null
        Invoke-Captured git @("add", "--all") -LogName "git-add-ci-agent" | Out-Null
        Invoke-Captured git @("commit", "-m", "fix: repair GitHub verification failure") -LogName "git-commit-ci-agent" | Out-Null
        Invoke-Captured git @("push", "origin", $Branch) -LogName "git-push-ci-agent" | Out-Null
        $script:State.headCommit = (& git rev-parse HEAD).Trim()
        Start-Sleep -Seconds $PollSeconds
        continue
      }
    }

    Add-Blocker "CI" "GitHub Build Verification failed with a non-transient error. The flow preserved the failed-job log and continued monitoring independent systems." $failedLog
    return $false
  }

  Add-Blocker "CI" "GitHub verification did not pass within the configured runtime window." (Join-Path $EvidenceRoot "ci-runs.log")
  return $false
}

function Get-ExactPreviewUrl {
  if (@($script:State.blockers | Where-Object { $_.code -eq "GITHUB_AUTH" }).Count -gt 0) {
    return $null
  }

  $deployments = Invoke-Captured gh @(
    "api", "repos/$RepositorySlug/deployments?ref=$($script:State.headCommit)&per_page=30"
  ) -LogName "github-deployments" -AllowFailure
  if ($deployments.ExitCode -ne 0) { return $null }

  $items = @($deployments.Output | ConvertFrom-Json)
  foreach ($deployment in ($items | Sort-Object created_at -Descending)) {
    $statuses = Invoke-Captured gh @(
      "api", "repos/$RepositorySlug/deployments/$($deployment.id)/statuses?per_page=30"
    ) -LogName "github-deployment-$($deployment.id)" -AllowFailure
    if ($statuses.ExitCode -ne 0) { continue }

    $success = @($statuses.Output | ConvertFrom-Json | Where-Object {
      $_.state -eq "success" -and -not [string]::IsNullOrWhiteSpace($_.environment_url)
    } | Select-Object -First 1)

    if ($success.Count -gt 0) {
      return $success[0].environment_url
    }
  }

  return $null
}

function Wait-ForPreview {
  Write-Step "Waiting for an exact-head READY Preview"
  while ((Get-Date) -lt $Deadline) {
    $url = Get-ExactPreviewUrl
    if (-not [string]::IsNullOrWhiteSpace($url)) {
      $script:State.previewUrl = $url
      Clear-Blocker "PREVIEW"
      Add-Completed "preview-ready"
      return $url
    }
    Write-Host "Exact-head Preview is not READY yet. Waiting $PollSeconds seconds..."
    Start-Sleep -Seconds $PollSeconds
  }

  Add-Blocker "PREVIEW" "No exact-head READY Preview was found within the configured runtime window."
  return $null
}

function Test-PreviewRoutes {
  param([Parameter(Mandatory)][string]$PreviewUrl)

  Write-Step "Testing the exact Preview routes"
  $results = @()
  foreach ($probe in @(
    @{ name = "enterprise-solutions"; path = "/enterprise-solutions"; expected = @(200) },
    @{ name = "video-library-boundary"; path = "/api/video/library?workspaceId=owner-flow-preview"; expected = @(401,403) }
  )) {
    $uri = "$($PreviewUrl.TrimEnd('/'))$($probe.path)"
    $matchedPath = ""
    try {
      $response = Invoke-WebRequest -Uri $uri -Method Get -TimeoutSec 45 -SkipHttpErrorCheck
      $status = [int]$response.StatusCode
      $matchedPath = [string]$response.Headers["x-matched-path"]
    } catch {
      $status = 0
    }

    $expectedStatus = $probe.expected -contains $status
    $applicationReached = -not [string]::IsNullOrWhiteSpace($matchedPath)
    $ok = $expectedStatus -and $applicationReached
    $results += [ordered]@{
      name = $probe.name
      url = $uri
      status = $status
      matchedPath = $matchedPath
      applicationReached = $applicationReached
      ok = $ok
    }
  }

  $results | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $EvidenceRoot "preview-probes.json") -Encoding utf8
  $failed = @($results | Where-Object { -not $_.ok })
  if ($failed.Count -gt 0) {
    Add-Blocker "PREVIEW_ROUTES" "One or more exact-head Preview probes failed or were intercepted by deployment protection." (Join-Path $EvidenceRoot "preview-probes.json")
    return $false
  }

  Clear-Blocker "PREVIEW_ROUTES"
  Add-Completed "preview-routes"
  return $true
}

function Complete-MergeAndProduction {
  if (-not $ApproveMerge -or -not $ApproveProductionActivation) {
    Add-Blocker "FINAL_APPROVAL" "All technical gates can complete autonomously, but merge and production activation require -ApproveMerge and -ApproveProductionActivation."
    return $false
  }

  $critical = @($script:State.blockers | Where-Object { $_.code -notin @("FINAL_APPROVAL") })
  if ($critical.Count -gt 0) {
    return $false
  }

  $mergePhrase = Read-Host "Type exactly MERGE VERIFIED GEM PR"
  if ($mergePhrase -cne "MERGE VERIFIED GEM PR") {
    Add-Blocker "FINAL_APPROVAL" "Merge approval phrase was not provided."
    return $false
  }

  Write-Step "Marking PR ready and merging the exact verified head"
  & gh pr ready $PullRequest --repo $RepositorySlug
  if ($LASTEXITCODE -ne 0) { throw "Could not mark PR #$PullRequest ready." }
  & gh pr merge $PullRequest --repo $RepositorySlug --squash --delete-branch
  if ($LASTEXITCODE -ne 0) { throw "PR #$PullRequest was not merged." }

  Invoke-Captured git @("fetch", "origin", "--prune") -LogName "post-merge-fetch" | Out-Null
  Invoke-Captured git @("switch", "main") -LogName "post-merge-switch" | Out-Null
  Invoke-Captured git @("pull", "--ff-only", "origin", "main") -LogName "post-merge-pull" | Out-Null
  $mainCommit = (& git rev-parse HEAD).Trim()

  Write-Step "Running the existing governed Full mode against merged main"
  $fullArgs = @(
    "-Mode", "Full",
    "-ExpectedCommit", $mainCommit,
    "-PreviewCommit", $script:State.headCommit,
    "-PreviewUrl", $script:State.previewUrl,
    "-ApproveDependencyInstall",
    "-ApproveProductionChanges",
    "-ApproveProductionDeploy"
  )
  if ($StartWorker) { $fullArgs += "-StartWorker" }

  $launcher = Join-Path $Repository "ops\owner-flow\run-all-windows.cmd"
  $full = Invoke-Captured $launcher $fullArgs -LogName "owner-full" -AllowFailure
  if ($full.ExitCode -ne 0) {
    Add-Blocker "FULL_MODE" "Governed Full mode did not complete. Existing rollback state and evidence were preserved." $full.LogPath
    return $false
  }

  Clear-Blocker "FINAL_APPROVAL"
  Clear-Blocker "FULL_MODE"
  Add-Completed "merged-and-production-activated"
  return $true
}

Start-Transcript -LiteralPath $TranscriptPath -Force | Out-Null
try {
  Save-State
  Assert-Environment
  Assert-Repository
  Ensure-VercelLink

  $script:State.phase = "audit-and-repair"
  Save-State
  $null = Invoke-OwnerAudit
  $null = Repair-KnownDatabaseFailure

  $script:State.phase = "local-verification"
  Save-State
  $localVerified = Invoke-LocalVerification
  if ($localVerified) {
    $null = Publish-CurrentBranch
  }

  $script:State.phase = "remote-verification"
  Save-State
  $null = Ensure-PullRequest
  $ciPassed = Wait-ForCi
  $previewUrl = Wait-ForPreview
  if (-not [string]::IsNullOrWhiteSpace($previewUrl)) {
    $null = Test-PreviewRoutes $previewUrl
  }

  $script:State.phase = "final-gate"
  Save-State
  if ($ciPassed -and -not [string]::IsNullOrWhiteSpace($previewUrl)) {
    $null = Complete-MergeAndProduction
  }

  $remaining = @($script:State.blockers)
  if ($remaining.Count -eq 0) {
    $script:State.outcome = "completed"
    Write-Host "`nGEM AUTONOMOUS FLOW COMPLETED" -ForegroundColor Green
  } else {
    $script:State.outcome = "completed-with-blockers"
    Write-Host "`nGEM AUTONOMOUS FLOW FINISHED ALL AVAILABLE WORK" -ForegroundColor Yellow
    Write-Host "Remaining blockers are listed in: $SummaryPath"
  }
}
catch {
  $script:State.outcome = "failed"
  Add-Blocker "UNHANDLED" $_.Exception.Message $TranscriptPath
  Write-Host "`nGEM AUTONOMOUS FLOW FAILED: $($_.Exception.Message)" -ForegroundColor Red
  throw
}
finally {
  $script:State.finishedAt = (Get-Date).ToUniversalTime().ToString("o")
  Save-State
  Stop-Transcript | Out-Null
  Write-Host "State:      $StatePath"
  Write-Host "Summary:    $SummaryPath"
  Write-Host "Transcript: $TranscriptPath"
}
