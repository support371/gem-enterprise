[CmdletBinding()]
param(
  [ValidateSet("Audit", "Configure", "ActivateVideo", "Connect", "Full", "Rollback")]
  [string]$Mode = "Full",
  [string]$WorkspaceId = "",
  [string]$ServiceActorId = "",
  [string]$NextdoorLocalContext = "",
  [string]$SocialConfigPath = "",
  [string]$ComfyUiBaseUrl = "http://127.0.0.1:8188",
  [string]$ExpectedCommit = "",
  [string]$PreviewCommit = "",
  [string]$PreviewUrl = "",
  [string]$PlatformVideoUrl = "",
  [switch]$SkipLocalVerification,
  [switch]$ApproveDependencyInstall,
  [switch]$ApproveProductionChanges,
  [switch]$ApproveProductionDeploy,
  [switch]$ApprovePlatformVideo,
  [switch]$ApproveRollback,
  [switch]$StartWorker,
  [switch]$DoNotOpenBrowser
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$VercelOrgId = "team_7lMXW95WSLeyK4yAObe8FptW"
$VercelProjectId = "prj_VDGqnA7wZt2E65LLvT94ZOpnYc2Z"
$ProductionAlias = "https://www.gemcybersecurityassist.com"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$VideoActivationScript = Join-Path $RepoRoot "ops\video-render-worker\activate-windows.ps1"
$DefaultLocalConfig = Join-Path $PSScriptRoot "social-providers.local.json"
$ExampleConfig = Join-Path $PSScriptRoot "social-providers.example.json"
$ReportDirectory = Join-Path $env:LOCALAPPDATA "GEM\owner-flow"
$ReportPath = Join-Path $ReportDirectory "last-readiness.json"
$CommandLogPath = Join-Path $ReportDirectory "last-commands.json"
$RollbackPath = Join-Path $ReportDirectory "rollback-current.json"
$script:ProductionEnvironment = @{}
$script:CommandResults = [Collections.Generic.List[object]]::new()
$ManagedEnvironmentNames = @(
  "CONTENT_ORCHESTRATOR_WORKSPACE_ID", "CONTENT_ORCHESTRATOR_ACTOR_ID",
  "CONTENT_ORCHESTRATOR_NEXTDOOR_LOCAL_CONTEXT", "CONTENT_ORCHESTRATOR_CRON_SECRET",
  "CONTENT_ORCHESTRATOR_PROVIDERS", "CONTENT_ORCHESTRATOR_MINIMUM_TIKTOK_ITEMS",
  "CONTENT_ORCHESTRATOR_OTHER_PROVIDER_ITEMS", "SOCIAL_TOKEN_ENCRYPTION_KEY",
  "SOCIAL_OAUTH_STATE_SECRET", "SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED",
  "META_SOCIAL_PUBLISHING_ENABLED", "X_SOCIAL_PUBLISHING_ENABLED",
  "NEXTDOOR_PUBLISHING_ENABLED", "LINKEDIN_SOCIAL_PUBLISHING_ENABLED",
  "YOUTUBE_PUBLISHING_ENABLED", "TOKMETRIC_LIVE_PUBLISHING_ENABLED",
  "INDEED_JOB_PUBLISHING_ENABLED", "META_APP_ID", "META_APP_SECRET",
  "META_GRAPH_API_VERSION", "META_SOCIAL_SCOPES", "META_OAUTH_REDIRECT_URI",
  "META_APP_REVIEW_APPROVED", "META_SOCIAL_OAUTH_ENABLED", "X_CLIENT_ID",
  "X_CLIENT_SECRET", "X_SOCIAL_SCOPES", "X_OAUTH_REDIRECT_URI",
  "X_SOCIAL_OAUTH_ENABLED", "NEXTDOOR_CLIENT_ID", "NEXTDOOR_CLIENT_SECRET",
  "NEXTDOOR_SOCIAL_SCOPES", "NEXTDOOR_OAUTH_REDIRECT_URI",
  "NEXTDOOR_PUBLISH_API_ACCESS_APPROVED", "NEXTDOOR_OAUTH_ENABLED",
  "LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET", "LINKEDIN_SOCIAL_SCOPES",
  "LINKEDIN_API_VERSION", "LINKEDIN_OAUTH_REDIRECT_URI",
  "LINKEDIN_COMMUNITY_MANAGEMENT_ACCESS_APPROVED", "LINKEDIN_SOCIAL_OAUTH_ENABLED",
  "GOOGLE_SOCIAL_CLIENT_ID", "GOOGLE_SOCIAL_CLIENT_SECRET", "YOUTUBE_SOCIAL_SCOPES",
  "YOUTUBE_OAUTH_REDIRECT_URI", "YOUTUBE_DATA_API_AUDIT_APPROVED",
  "YOUTUBE_SOCIAL_OAUTH_ENABLED", "TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET",
  "TIKTOK_REDIRECT_URI", "TIKTOK_ENVIRONMENT", "TOKMETRIC_TOKEN_ENCRYPTION_KEY",
  "TOKMETRIC_TIKTOK_OAUTH_ENABLED", "INDEED_EMPLOYER_ID", "INDEED_JOB_FEED_URL",
  "INDEED_EMPLOYER_INTEGRATION_ENABLED", "ENTERPRISE_SOLUTIONS_VIDEO_URL",
  "ENTERPRISE_SOLUTIONS_VIDEO_APPROVED"
)
$SensitiveEnvironmentNames = @(
  "CONTENT_ORCHESTRATOR_CRON_SECRET", "SOCIAL_TOKEN_ENCRYPTION_KEY", "SOCIAL_OAUTH_STATE_SECRET",
  "META_APP_SECRET", "X_CLIENT_SECRET", "NEXTDOOR_CLIENT_SECRET", "LINKEDIN_CLIENT_SECRET",
  "GOOGLE_SOCIAL_CLIENT_SECRET", "TIKTOK_CLIENT_SECRET", "TOKMETRIC_TOKEN_ENCRYPTION_KEY"
)

function Write-Step([string]$Message) {
  Write-Host "[GEM owner flow] $Message" -ForegroundColor Cyan
}

function Write-Success([string]$Message) {
  Write-Host "[GEM owner flow] $Message" -ForegroundColor Green
}

function Write-Notice([string]$Message) {
  Write-Host "[GEM owner flow] $Message" -ForegroundColor Yellow
}

function Assert-Windows {
  if (-not $IsWindows) {
    throw "This owner activation flow is for Windows. Use the existing worker runbook for another operating system."
  }
}

function Assert-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command '$Name' was not found in PATH."
  }
}

function Invoke-Native(
  [string]$File,
  [string[]]$Arguments,
  [string]$InputValue = $null
) {
  $startedAt = (Get-Date).ToUniversalTime()
  if ($null -eq $InputValue) {
    & $File @Arguments
  }
  else {
    $InputValue | & $File @Arguments
  }
  $exitCode = $LASTEXITCODE
  $script:CommandResults.Add([ordered]@{
    startedAt = $startedAt.ToString("o")
    finishedAt = (Get-Date).ToUniversalTime().ToString("o")
    file = $File
    arguments = @($Arguments)
    inputProvided = $null -ne $InputValue
    exitCode = $exitCode
  })
  if ($exitCode -ne 0) {
    throw "Command failed: $File $($Arguments -join ' ')"
  }
}

function Confirm-ExactPhrase([string]$Prompt, [string]$Phrase) {
  $confirmation = (Read-Host "$Prompt Type exactly: $Phrase").Trim()
  if ($confirmation -cne $Phrase) {
    throw "The required approval phrase was not provided. No approved mutation was performed."
  }
}

function Assert-RepositoryBoundary {
  Write-Step "Validating the canonical repository boundary."
  $origin = (& git -C $RepoRoot remote get-url origin).Trim()
  if ($LASTEXITCODE -ne 0 -or $origin -notmatch "(?i)(github\.com[:/])support371/gem-enterprise(?:\.git)?$") {
    throw "This checkout is not the canonical support371/gem-enterprise repository."
  }
  $commit = (& git -C $RepoRoot rev-parse HEAD).Trim()
  if ($ExpectedCommit -and $commit -ne $ExpectedCommit) {
    throw "The checkout commit does not match -ExpectedCommit. Expected $ExpectedCommit; detected $commit."
  }
  $status = @(& git -C $RepoRoot status --porcelain)
  if ($Mode -in @("Configure", "ActivateVideo", "Connect", "Full") -and $status.Count -gt 0) {
    throw "The checkout has uncommitted changes. Refusing an activation or production-changing mode."
  }
  $branch = (& git -C $RepoRoot branch --show-current).Trim()
  if ($Mode -in @("Configure", "Full") -and $branch -ne "main") {
    throw "Configure and Full modes require the reviewed canonical main branch. Detected '$branch'."
  }
}

function Assert-ProductionChangeApproval {
  if (-not $ApproveProductionChanges) {
    throw "This mode can change managed production configuration. Re-run with -ApproveProductionChanges after reviewing the Audit report."
  }
  Confirm-ExactPhrase "Approve managed GEM production configuration changes." "APPLY APPROVED GEM CONFIGURATION"
}

function Assert-ExactHeadPreview {
  if (-not $ExpectedCommit) {
    throw "-ExpectedCommit is required for Configure and Full modes. Use the reviewed 40-character commit SHA."
  }
  if ($ExpectedCommit -notmatch "^[0-9a-fA-F]{40}$") {
    throw "ExpectedCommit must be one full 40-character Git commit SHA."
  }
  $resolvedPreviewCommit = if ($PreviewCommit) { $PreviewCommit } else { $ExpectedCommit }
  if ($resolvedPreviewCommit -notmatch "^[0-9a-fA-F]{40}$") {
    throw "PreviewCommit must be one full 40-character Git commit SHA."
  }
  & git -C $RepoRoot cat-file -e "$resolvedPreviewCommit`^{commit}" 2>$null
  if ($LASTEXITCODE -ne 0) {
    throw "PreviewCommit is not available in the local Git object database. Fetch the reviewed PR branch before continuing."
  }
  $productionTree = (& git -C $RepoRoot rev-parse "$ExpectedCommit`^{tree}").Trim()
  $previewTree = (& git -C $RepoRoot rev-parse "$resolvedPreviewCommit`^{tree}").Trim()
  if ($productionTree -ne $previewTree) {
    throw "The reviewed Preview commit and local production commit do not have the same Git tree. A new exact integration Preview is required."
  }
  $parsedPreview = $null
  if (-not [Uri]::TryCreate($PreviewUrl, [UriKind]::Absolute, [ref]$parsedPreview) -or
      $parsedPreview.Scheme -ne "https" -or $parsedPreview.UserInfo) {
    throw "-PreviewUrl must be the exact approved HTTPS Vercel Preview URL without embedded credentials."
  }

  Write-Step "Inspecting the exact-head Vercel Preview."
  $startedAt = (Get-Date).ToUniversalTime()
  $rawInspection = (& vercel inspect $parsedPreview.AbsoluteUri --json | Out-String)
  $exitCode = $LASTEXITCODE
  $script:CommandResults.Add([ordered]@{
    startedAt = $startedAt.ToString("o")
    finishedAt = (Get-Date).ToUniversalTime().ToString("o")
    file = "vercel"
    arguments = @("inspect", "[APPROVED_PREVIEW_URL]", "--json")
    inputProvided = $false
    exitCode = $exitCode
  })
  if ($exitCode -ne 0) { throw "Vercel Preview inspection failed." }
  try { $inspection = $rawInspection | ConvertFrom-Json }
  catch { throw "Vercel Preview inspection did not return valid JSON." }

  $state = [string](Get-PropertyValue $inspection "state" "")
  $readyState = [string](Get-PropertyValue $inspection "readyState" "")
  $effectiveState = if ($readyState) { $readyState } else { $state }
  if ($effectiveState -ne "READY") {
    throw "The exact-head Preview is not READY."
  }
  $meta = Get-PropertyValue $inspection "meta" $null
  $gitSource = Get-PropertyValue $inspection "gitSource" $null
  $reportedShas = @(
    [string](Get-PropertyValue $meta "githubCommitSha" ""),
    [string](Get-PropertyValue $meta "gitCommitSha" ""),
    [string](Get-PropertyValue $gitSource "sha" "")
  ) | Where-Object { $_ }
  if ($reportedShas.Count -eq 0 -or $resolvedPreviewCommit -notin $reportedShas) {
    throw "The Vercel Preview metadata does not prove the approved expected commit."
  }

  $previewOrigin = $parsedPreview.AbsoluteUri.TrimEnd('/')
  foreach ($probe in @(
    @{ Name = "Preview enterprise solutions"; Url = "$previewOrigin/enterprise-solutions"; Expected = @(200) },
    @{ Name = "Preview direct database readiness"; Url = "$previewOrigin/api/v1/production/health"; Expected = @(200) },
    @{ Name = "Preview private video boundary"; Url = "$previewOrigin/api/video/library?workspaceId=owner-flow-preview"; Expected = @(401, 403) }
  )) {
    $result = Test-HttpEndpoint $probe.Name $probe.Url $probe.Expected
    if (-not $result.ok) { throw "$($probe.Name) failed with HTTP $($result.status)." }
  }
  Write-Success "Exact-head Preview metadata and fail-closed route probes passed."
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

function New-RandomSecret([int]$ByteCount = 32) {
  $bytes = New-Object byte[] $ByteCount
  [Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
  return [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

function Get-EnvironmentMap([string]$Path) {
  $values = @{}
  if (-not (Test-Path -LiteralPath $Path)) { return $values }
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

function Initialize-Vercel {
  Write-Step "Authenticating the canonical Vercel project."
  $env:VERCEL_ORG_ID = $VercelOrgId
  $env:VERCEL_PROJECT_ID = $VercelProjectId
  & vercel whoami *> $null
  if ($LASTEXITCODE -ne 0) {
    Invoke-Native "vercel" @("login")
  }

  $temporaryFile = Join-Path ([IO.Path]::GetTempPath()) ("gem-owner-env-{0}.tmp" -f [Guid]::NewGuid())
  try {
    Invoke-Native "vercel" @(
      "env", "pull", $temporaryFile,
      "--environment=production", "--yes"
    )
    $script:ProductionEnvironment = Get-EnvironmentMap $temporaryFile
  }
  finally {
    if (Test-Path -LiteralPath $temporaryFile) {
      Remove-Item -LiteralPath $temporaryFile -Force
    }
  }
}

function Set-VercelValue(
  [string]$Name,
  [string]$Value,
  [bool]$Sensitive = $true
) {
  if (-not $Value) { throw "A value is required for $Name." }
  $existing = if ($script:ProductionEnvironment.ContainsKey($Name)) {
    [string]$script:ProductionEnvironment[$Name]
  } else {
    ""
  }
  if ($existing -eq $Value) {
    Write-Step "$Name is already configured."
    return
  }
  $arguments = @("env", "add", $Name, "production", "--force")
  if ($Sensitive) { $arguments += "--sensitive" } else { $arguments += "--no-sensitive" }
  Invoke-Native "vercel" $arguments $Value
  $script:ProductionEnvironment[$Name] = $Value
}

function Save-RollbackState {
  Write-Step "Creating a Windows-user-protected rollback state before configuration changes."
  New-Item -ItemType Directory -Force -Path $ReportDirectory | Out-Null
  $previousValues = [ordered]@{}
  $previouslyMissing = [Collections.Generic.List[string]]::new()
  foreach ($name in $ManagedEnvironmentNames) {
    $existingValue = if ($script:ProductionEnvironment.ContainsKey($name)) { [string]$script:ProductionEnvironment[$name] } else { "" }
    if (-not [string]::IsNullOrWhiteSpace($existingValue)) {
      $previousValues[$name] = $existingValue
    }
    else {
      $previouslyMissing.Add($name)
    }
  }

  $deploymentUrl = ""
  try {
    $raw = (& vercel inspect $ProductionAlias --json | Out-String)
    if ($LASTEXITCODE -eq 0) {
      $inspection = $raw | ConvertFrom-Json
      $deploymentUrl = [string](Get-PropertyValue $inspection "url" "")
      if ($deploymentUrl -and $deploymentUrl -notmatch "^https://") {
        $deploymentUrl = "https://$deploymentUrl"
      }
    }
  }
  catch {
    Write-Notice "The previous deployment URL could not be captured; environment rollback will still be available."
  }

  $secretJson = [ordered]@{
    values = $previousValues
    missing = @($previouslyMissing)
  } | ConvertTo-Json -Depth 5 -Compress
  $encrypted = ConvertFrom-SecureString (ConvertTo-SecureString $secretJson -AsPlainText -Force)
  [ordered]@{
    createdAt = (Get-Date).ToUniversalTime().ToString("o")
    repositoryCommit = (& git -C $RepoRoot rev-parse HEAD).Trim()
    previousDeploymentUrl = $deploymentUrl
    protection = "WINDOWS_CURRENT_USER_DPAPI"
    encryptedEnvironment = $encrypted
  } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $RollbackPath -Encoding utf8
  Write-Success "Protected rollback state written to $RollbackPath"
}

function Invoke-OwnerRollback {
  if (-not $ApproveRollback) {
    throw "Rollback requires -ApproveRollback and the exact interactive confirmation phrase."
  }
  if (-not (Test-Path -LiteralPath $RollbackPath -PathType Leaf)) {
    throw "No protected rollback state exists at $RollbackPath."
  }
  Confirm-ExactPhrase "Approve restoration of the recorded GEM environment and deployment." "ROLL BACK GEM PRODUCTION"
  $manifest = Get-Content -LiteralPath $RollbackPath -Raw | ConvertFrom-Json
  if ([string](Get-PropertyValue $manifest "protection" "") -ne "WINDOWS_CURRENT_USER_DPAPI") {
    throw "The rollback state does not have the required Windows current-user protection marker."
  }
  $securePayload = ConvertTo-SecureString ([string]$manifest.encryptedEnvironment)
  $plainPayload = Convert-SecureStringToPlainText $securePayload
  try { $state = $plainPayload | ConvertFrom-Json }
  finally { $plainPayload = $null }

  $previousValues = @{}
  foreach ($property in $state.values.PSObject.Properties) {
    $previousValues[$property.Name] = [string]$property.Value
  }
  $previouslyMissing = @($state.missing)
  foreach ($name in $ManagedEnvironmentNames) {
    if ($previousValues.ContainsKey($name)) {
      Set-VercelValue $name $previousValues[$name] ($name -in $SensitiveEnvironmentNames)
    }
    elseif ($name -in $previouslyMissing -and $script:ProductionEnvironment.ContainsKey($name)) {
      Invoke-Native "vercel" @("env", "rm", $name, "production", "--yes")
      $script:ProductionEnvironment.Remove($name)
    }
  }

  $previousDeploymentUrl = [string](Get-PropertyValue $manifest "previousDeploymentUrl" "")
  if ($previousDeploymentUrl) {
    Invoke-Native "vercel" @("rollback", $previousDeploymentUrl, "--yes")
  }
  else {
    Write-Notice "No previous deployment URL was recorded; only managed environment state was restored."
  }
  Write-Success "Recorded rollback actions completed. Run Audit immediately and retain the evidence files."
}

function Get-ExistingOrPrompt(
  [string]$EnvironmentName,
  [string]$ConfiguredValue,
  [string]$Prompt,
  [string]$DefaultValue = ""
) {
  if ($ConfiguredValue) { return $ConfiguredValue.Trim() }
  if ($script:ProductionEnvironment.ContainsKey($EnvironmentName)) {
    $existing = [string]$script:ProductionEnvironment[$EnvironmentName]
    if ($existing) { return $existing }
  }
  $message = if ($DefaultValue) { "$Prompt [$DefaultValue]" } else { $Prompt }
  $value = (Read-Host $message).Trim()
  if (-not $value) { $value = $DefaultValue }
  if (-not $value) { throw "$EnvironmentName is required." }
  return $value
}

function Get-ExistingOrPromptSecret([string]$EnvironmentName, [string]$Prompt) {
  if ($script:ProductionEnvironment.ContainsKey($EnvironmentName)) {
    $existing = [string]$script:ProductionEnvironment[$EnvironmentName]
    if ($existing) {
      Write-Step "$EnvironmentName is already present; the stored value will be retained."
      return $existing
    }
  }
  $secure = Read-Host $Prompt -AsSecureString
  $value = Convert-SecureStringToPlainText $secure
  if (-not $value) { throw "$EnvironmentName is required." }
  return $value
}

function Get-PropertyValue([object]$Object, [string]$Name, $DefaultValue = $null) {
  if ($null -eq $Object) { return $DefaultValue }
  $property = $Object.PSObject.Properties[$Name]
  if ($null -eq $property) { return $DefaultValue }
  return $property.Value
}

function Read-OwnerConfig {
  $path = $SocialConfigPath
  if (-not $path -and (Test-Path -LiteralPath $DefaultLocalConfig)) {
    $path = $DefaultLocalConfig
  }
  if (-not $path) {
    Write-Notice "Create a private local configuration from: $ExampleConfig"
    $path = (Read-Host "Full path to your private social-providers.local.json file").Trim()
  }
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
    throw "The owner configuration file was not found: $path"
  }
  try {
    return Get-Content -LiteralPath $path -Raw | ConvertFrom-Json
  }
  catch {
    throw "The owner configuration file is not valid JSON."
  }
}

function Confirm-PlatformApproval(
  [string]$EnvironmentName,
  [bool]$Requested
) {
  if ($script:ProductionEnvironment.ContainsKey($EnvironmentName) -and
      [string]$script:ProductionEnvironment[$EnvironmentName] -eq "true") {
    Write-Step "$EnvironmentName is already recorded."
    return
  }
  if (-not $Requested) {
    Set-VercelValue $EnvironmentName "false" $false
    return
  }
  $confirmation = (Read-Host "Type APPROVED only if documentary provider approval exists for $EnvironmentName").Trim()
  if ($confirmation -ne "APPROVED") {
    throw "$EnvironmentName was requested but documentary approval was not confirmed."
  }
  Set-VercelValue $EnvironmentName "true" $false
}

function Configure-Orchestrator([object]$Config) {
  Write-Step "Configuring the scheduled cross-platform content orchestrator."
  $orchestrator = Get-PropertyValue $Config "orchestrator" $null
  $workspaceCandidate = if ($WorkspaceId) { $WorkspaceId } else { [string](Get-PropertyValue $orchestrator "workspaceId" "") }
  $actorCandidate = if ($ServiceActorId) { $ServiceActorId } else { [string](Get-PropertyValue $orchestrator "serviceActorId" "") }
  $contextCandidate = if ($NextdoorLocalContext) { $NextdoorLocalContext } else { [string](Get-PropertyValue $orchestrator "nextdoorLocalContext" "") }

  $resolvedWorkspace = Get-ExistingOrPrompt "CONTENT_ORCHESTRATOR_WORKSPACE_ID" $workspaceCandidate "TokMetric workspace ID"
  $resolvedActor = Get-ExistingOrPrompt "CONTENT_ORCHESTRATOR_ACTOR_ID" $actorCandidate "Approved service actor user ID"
  $resolvedContext = Get-ExistingOrPrompt "CONTENT_ORCHESTRATOR_NEXTDOOR_LOCAL_CONTEXT" $contextCandidate "Approved Nextdoor locality context"
  $cronSecret = if ($script:ProductionEnvironment.ContainsKey("CONTENT_ORCHESTRATOR_CRON_SECRET")) {
    [string]$script:ProductionEnvironment["CONTENT_ORCHESTRATOR_CRON_SECRET"]
  } else {
    New-RandomSecret 48
  }

  Set-VercelValue "CONTENT_ORCHESTRATOR_WORKSPACE_ID" $resolvedWorkspace $false
  Set-VercelValue "CONTENT_ORCHESTRATOR_ACTOR_ID" $resolvedActor $false
  Set-VercelValue "CONTENT_ORCHESTRATOR_NEXTDOOR_LOCAL_CONTEXT" $resolvedContext $false
  Set-VercelValue "CONTENT_ORCHESTRATOR_CRON_SECRET" $cronSecret $true
  Set-VercelValue "CONTENT_ORCHESTRATOR_PROVIDERS" "TIKTOK,FACEBOOK_PAGE,INSTAGRAM_PROFESSIONAL,X,NEXTDOOR" $false
  Set-VercelValue "CONTENT_ORCHESTRATOR_MINIMUM_TIKTOK_ITEMS" "20" $false
  Set-VercelValue "CONTENT_ORCHESTRATOR_OTHER_PROVIDER_ITEMS" "3" $false

  $script:WorkspaceId = $resolvedWorkspace
}

function Configure-SocialProviders([object]$Config) {
  Write-Step "Configuring social OAuth prerequisites while keeping every publishing gate disabled."
  $providers = Get-PropertyValue $Config "providers" $null
  if ($null -eq $providers) { throw "The owner configuration has no providers object." }

  $sharedEncryption = if ($script:ProductionEnvironment.ContainsKey("SOCIAL_TOKEN_ENCRYPTION_KEY")) {
    [string]$script:ProductionEnvironment["SOCIAL_TOKEN_ENCRYPTION_KEY"]
  } else {
    New-RandomSecret 32
  }
  $stateSecret = if ($script:ProductionEnvironment.ContainsKey("SOCIAL_OAUTH_STATE_SECRET")) {
    [string]$script:ProductionEnvironment["SOCIAL_OAUTH_STATE_SECRET"]
  } else {
    New-RandomSecret 48
  }
  Set-VercelValue "SOCIAL_TOKEN_ENCRYPTION_KEY" $sharedEncryption $true
  Set-VercelValue "SOCIAL_OAUTH_STATE_SECRET" $stateSecret $true

  Set-VercelValue "SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED" "false" $false
  foreach ($gate in @(
    "META_SOCIAL_PUBLISHING_ENABLED",
    "X_SOCIAL_PUBLISHING_ENABLED",
    "NEXTDOOR_PUBLISHING_ENABLED",
    "LINKEDIN_SOCIAL_PUBLISHING_ENABLED",
    "YOUTUBE_PUBLISHING_ENABLED",
    "TOKMETRIC_LIVE_PUBLISHING_ENABLED",
    "INDEED_JOB_PUBLISHING_ENABLED"
  )) {
    Set-VercelValue $gate "false" $false
  }

  $meta = Get-PropertyValue $providers "meta" $null
  if ([bool](Get-PropertyValue $meta "enabled" $false)) {
    $appId = Get-ExistingOrPrompt "META_APP_ID" ([string](Get-PropertyValue $meta "appId" "")) "Meta App ID"
    $secret = Get-ExistingOrPromptSecret "META_APP_SECRET" "Meta App Secret"
    $version = Get-ExistingOrPrompt "META_GRAPH_API_VERSION" ([string](Get-PropertyValue $meta "graphApiVersion" "")) "Meta Graph API version" "v23.0"
    $scopes = Get-ExistingOrPrompt "META_SOCIAL_SCOPES" ([string](Get-PropertyValue $meta "scopes" "")) "Meta scopes"
    Set-VercelValue "META_APP_ID" $appId $false
    Set-VercelValue "META_APP_SECRET" $secret $true
    Set-VercelValue "META_GRAPH_API_VERSION" $version $false
    Set-VercelValue "META_SOCIAL_SCOPES" $scopes $false
    Set-VercelValue "META_OAUTH_REDIRECT_URI" "$ProductionAlias/api/social-media/oauth/meta/callback" $false
    Confirm-PlatformApproval "META_APP_REVIEW_APPROVED" ([bool](Get-PropertyValue $meta "platformApprovalRecorded" $false))
    Set-VercelValue "META_SOCIAL_OAUTH_ENABLED" "true" $false
  }

  $x = Get-PropertyValue $providers "x" $null
  if ([bool](Get-PropertyValue $x "enabled" $false)) {
    $clientId = Get-ExistingOrPrompt "X_CLIENT_ID" ([string](Get-PropertyValue $x "clientId" "")) "X OAuth Client ID"
    $secret = Get-ExistingOrPromptSecret "X_CLIENT_SECRET" "X OAuth Client Secret"
    $scopes = Get-ExistingOrPrompt "X_SOCIAL_SCOPES" ([string](Get-PropertyValue $x "scopes" "")) "X scopes" "tweet.read tweet.write users.read offline.access"
    Set-VercelValue "X_CLIENT_ID" $clientId $false
    Set-VercelValue "X_CLIENT_SECRET" $secret $true
    Set-VercelValue "X_SOCIAL_SCOPES" $scopes $false
    Set-VercelValue "X_OAUTH_REDIRECT_URI" "$ProductionAlias/api/social-media/oauth/x/callback" $false
    Set-VercelValue "X_SOCIAL_OAUTH_ENABLED" "true" $false
  }

  $nextdoor = Get-PropertyValue $providers "nextdoor" $null
  if ([bool](Get-PropertyValue $nextdoor "enabled" $false)) {
    $clientId = Get-ExistingOrPrompt "NEXTDOOR_CLIENT_ID" ([string](Get-PropertyValue $nextdoor "clientId" "")) "Nextdoor Client ID"
    $secret = Get-ExistingOrPromptSecret "NEXTDOOR_CLIENT_SECRET" "Nextdoor Client Secret"
    $scopes = Get-ExistingOrPrompt "NEXTDOOR_SOCIAL_SCOPES" ([string](Get-PropertyValue $nextdoor "scopes" "")) "Nextdoor scopes" "openid profile post:write post:read"
    Set-VercelValue "NEXTDOOR_CLIENT_ID" $clientId $false
    Set-VercelValue "NEXTDOOR_CLIENT_SECRET" $secret $true
    Set-VercelValue "NEXTDOOR_SOCIAL_SCOPES" $scopes $false
    Set-VercelValue "NEXTDOOR_OAUTH_REDIRECT_URI" "$ProductionAlias/api/social-media/oauth/nextdoor/callback" $false
    Confirm-PlatformApproval "NEXTDOOR_PUBLISH_API_ACCESS_APPROVED" ([bool](Get-PropertyValue $nextdoor "platformApprovalRecorded" $false))
    Set-VercelValue "NEXTDOOR_OAUTH_ENABLED" "true" $false
  }

  $linkedin = Get-PropertyValue $providers "linkedin" $null
  if ([bool](Get-PropertyValue $linkedin "enabled" $false)) {
    $clientId = Get-ExistingOrPrompt "LINKEDIN_CLIENT_ID" ([string](Get-PropertyValue $linkedin "clientId" "")) "LinkedIn Client ID"
    $secret = Get-ExistingOrPromptSecret "LINKEDIN_CLIENT_SECRET" "LinkedIn Client Secret"
    $scopes = Get-ExistingOrPrompt "LINKEDIN_SOCIAL_SCOPES" ([string](Get-PropertyValue $linkedin "scopes" "")) "LinkedIn scopes" "rw_organization_admin w_organization_social r_organization_social"
    $version = Get-ExistingOrPrompt "LINKEDIN_API_VERSION" ([string](Get-PropertyValue $linkedin "apiVersion" "")) "LinkedIn API version"
    Set-VercelValue "LINKEDIN_CLIENT_ID" $clientId $false
    Set-VercelValue "LINKEDIN_CLIENT_SECRET" $secret $true
    Set-VercelValue "LINKEDIN_SOCIAL_SCOPES" $scopes $false
    Set-VercelValue "LINKEDIN_API_VERSION" $version $false
    Set-VercelValue "LINKEDIN_OAUTH_REDIRECT_URI" "$ProductionAlias/api/social-media/oauth/linkedin/callback" $false
    Confirm-PlatformApproval "LINKEDIN_COMMUNITY_MANAGEMENT_ACCESS_APPROVED" ([bool](Get-PropertyValue $linkedin "platformApprovalRecorded" $false))
    Set-VercelValue "LINKEDIN_SOCIAL_OAUTH_ENABLED" "true" $false
  }

  $youtube = Get-PropertyValue $providers "youtube" $null
  if ([bool](Get-PropertyValue $youtube "enabled" $false)) {
    $clientId = Get-ExistingOrPrompt "GOOGLE_SOCIAL_CLIENT_ID" ([string](Get-PropertyValue $youtube "clientId" "")) "Google OAuth Client ID"
    $secret = Get-ExistingOrPromptSecret "GOOGLE_SOCIAL_CLIENT_SECRET" "Google OAuth Client Secret"
    $scopes = Get-ExistingOrPrompt "YOUTUBE_SOCIAL_SCOPES" ([string](Get-PropertyValue $youtube "scopes" "")) "YouTube scopes" "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload"
    Set-VercelValue "GOOGLE_SOCIAL_CLIENT_ID" $clientId $false
    Set-VercelValue "GOOGLE_SOCIAL_CLIENT_SECRET" $secret $true
    Set-VercelValue "YOUTUBE_SOCIAL_SCOPES" $scopes $false
    Set-VercelValue "YOUTUBE_OAUTH_REDIRECT_URI" "$ProductionAlias/api/social-media/oauth/youtube/callback" $false
    Confirm-PlatformApproval "YOUTUBE_DATA_API_AUDIT_APPROVED" ([bool](Get-PropertyValue $youtube "platformApprovalRecorded" $false))
    Set-VercelValue "YOUTUBE_SOCIAL_OAUTH_ENABLED" "true" $false
  }

  $tiktok = Get-PropertyValue $providers "tiktok" $null
  if ([bool](Get-PropertyValue $tiktok "enabled" $false)) {
    $clientKey = Get-ExistingOrPrompt "TIKTOK_CLIENT_KEY" ([string](Get-PropertyValue $tiktok "clientKey" "")) "TikTok Client Key"
    $secret = Get-ExistingOrPromptSecret "TIKTOK_CLIENT_SECRET" "TikTok Client Secret"
    $environment = Get-ExistingOrPrompt "TIKTOK_ENVIRONMENT" ([string](Get-PropertyValue $tiktok "environment" "")) "TikTok environment" "sandbox"
    $tokenKey = if ($script:ProductionEnvironment.ContainsKey("TOKMETRIC_TOKEN_ENCRYPTION_KEY")) {
      [string]$script:ProductionEnvironment["TOKMETRIC_TOKEN_ENCRYPTION_KEY"]
    } else {
      New-RandomSecret 32
    }
    Set-VercelValue "TIKTOK_CLIENT_KEY" $clientKey $false
    Set-VercelValue "TIKTOK_CLIENT_SECRET" $secret $true
    Set-VercelValue "TIKTOK_REDIRECT_URI" "$ProductionAlias/api/tokmetric/oauth/callback" $false
    Set-VercelValue "TIKTOK_ENVIRONMENT" $environment $false
    Set-VercelValue "TOKMETRIC_TOKEN_ENCRYPTION_KEY" $tokenKey $true
    Set-VercelValue "TOKMETRIC_TIKTOK_OAUTH_ENABLED" "true" $false
  }

  $indeed = Get-PropertyValue $providers "indeed" $null
  if ([bool](Get-PropertyValue $indeed "enabled" $false)) {
    $employerId = Get-ExistingOrPrompt "INDEED_EMPLOYER_ID" ([string](Get-PropertyValue $indeed "employerId" "")) "Indeed Employer ID"
    $feedUrl = Get-ExistingOrPrompt "INDEED_JOB_FEED_URL" ([string](Get-PropertyValue $indeed "jobFeedUrl" "")) "Approved Indeed job feed URL"
    Set-VercelValue "INDEED_EMPLOYER_ID" $employerId $false
    Set-VercelValue "INDEED_JOB_FEED_URL" $feedUrl $false
    Set-VercelValue "INDEED_EMPLOYER_INTEGRATION_ENABLED" "true" $false
  }
}

function Invoke-LocalVerification {
  if ($SkipLocalVerification) {
    Write-Notice "Local repository verification was skipped by request."
    return
  }
  Push-Location $RepoRoot
  try {
    $dependencyTreePresent = Test-Path -LiteralPath (Join-Path $RepoRoot "node_modules\.pnpm")
    if (-not $dependencyTreePresent) {
      if ($Mode -eq "Audit") {
        Write-Notice "Locked dependencies are not present. Audit mode recorded the condition and did not install anything."
        return
      }
      if (-not $ApproveDependencyInstall) {
        throw "Locked dependencies are not present. Review the evidence, then use -ApproveDependencyInstall in an approved changing mode."
      }
      Confirm-ExactPhrase "Approve a lockfile-controlled pnpm dependency installation." "INSTALL LOCKED DEPENDENCIES"
      Write-Step "Installing dependencies from the reviewed lockfile."
      Invoke-Native "pnpm" @("install", "--frozen-lockfile")
    }
    Write-Step "Inspecting the installed top-level dependency tree."
    Invoke-Native "pnpm" @("list", "--depth=0")
    Write-Step "Running schema, claims, lint, TypeScript, tests, and production build."
    Invoke-Native "pnpm" @("run", "verify")
  }
  finally {
    Pop-Location
  }
}

function Invoke-DependencyInspection {
  Write-Step "Inspecting dependency state without installation or build output."
  $packagePath = Join-Path $RepoRoot "package.json"
  $lockPath = Join-Path $RepoRoot "pnpm-lock.yaml"
  if (-not (Test-Path -LiteralPath $packagePath -PathType Leaf)) { throw "package.json is missing." }
  if (-not (Test-Path -LiteralPath $lockPath -PathType Leaf)) { throw "pnpm-lock.yaml is missing." }
  if (-not (Test-Path -LiteralPath (Join-Path $RepoRoot "node_modules\.pnpm"))) {
    Write-Notice "node_modules is missing or incomplete. No installation was attempted in Audit mode."
    return
  }
  Push-Location $RepoRoot
  try { Invoke-Native "pnpm" @("list", "--depth=0") }
  finally { Pop-Location }
}

function Redeploy-Production {
  if (-not $ApproveProductionDeploy) {
    throw "Production deployment was not approved. Re-run with -ApproveProductionDeploy only after the exact-head Preview passes."
  }
  Confirm-ExactPhrase "Approve deployment of the verified canonical main artifact." "DEPLOY VERIFIED GEM PRODUCTION"
  Write-Step "Redeploying the reviewed canonical production artifact."
  Invoke-Native "vercel" @("redeploy", $ProductionAlias, "--yes")
}

function Configure-PlatformVideo {
  if (-not $PlatformVideoUrl -and -not $ApprovePlatformVideo) { return }
  if (-not $PlatformVideoUrl) {
    throw "-ApprovePlatformVideo requires -PlatformVideoUrl with the exact approved HTTPS asset."
  }
  $parsed = $null
  if (-not [Uri]::TryCreate($PlatformVideoUrl, [UriKind]::Absolute, [ref]$parsed) -or
      $parsed.Scheme -ne "https" -or $parsed.UserInfo) {
    throw "PlatformVideoUrl must be one absolute HTTPS URL without embedded credentials."
  }
  Set-VercelValue "ENTERPRISE_SOLUTIONS_VIDEO_APPROVED" "false" $false
  Set-VercelValue "ENTERPRISE_SOLUTIONS_VIDEO_URL" $parsed.AbsoluteUri $false
  if (-not $ApprovePlatformVideo) {
    Write-Notice "The platform-video URL was stored, but public playback remains disabled because owner approval was not requested."
    return
  }
  Confirm-ExactPhrase "Approve this separately reviewed public platform briefing." "PUBLISH APPROVED VIDEO"
  Set-VercelValue "ENTERPRISE_SOLUTIONS_VIDEO_APPROVED" "true" $false
}

function Invoke-VideoActivation {
  if (-not (Test-Path -LiteralPath $VideoActivationScript)) {
    throw "The merged secure video activation utility is missing."
  }
  Write-Step "Running secure owner-controlled video worker activation."
  & pwsh -NoLogo -NoProfile -ExecutionPolicy Bypass -File $VideoActivationScript -Mode Setup -ComfyUiBaseUrl $ComfyUiBaseUrl
  if ($LASTEXITCODE -ne 0) { throw "Video worker activation failed." }

  if ($StartWorker) {
    Write-Step "Starting the trusted video worker in a separate minimized terminal."
    Start-Process -FilePath "pwsh" -WindowStyle Minimized -ArgumentList @(
      "-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass",
      "-File", "`"$VideoActivationScript`"", "-Mode", "Run",
      "-ComfyUiBaseUrl", "`"$ComfyUiBaseUrl`""
    ) | Out-Null
  }
}

function Test-HttpEndpoint([string]$Name, [string]$Url, [int[]]$ExpectedStatus = @(200)) {
  try {
    $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 45 -MaximumRedirection 5
    return [ordered]@{ name = $Name; url = $Url; ok = $response.StatusCode -in $ExpectedStatus; status = $response.StatusCode; expectedStatus = $ExpectedStatus }
  }
  catch {
    $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
    return [ordered]@{ name = $Name; url = $Url; ok = $status -in $ExpectedStatus; status = $status; expectedStatus = $ExpectedStatus; error = $_.Exception.Message }
  }
}

function Environment-State([string[]]$Names) {
  return @($Names | ForEach-Object {
    [ordered]@{
      name = $_
      configured = $script:ProductionEnvironment.ContainsKey($_) -and
        -not [string]::IsNullOrWhiteSpace([string]$script:ProductionEnvironment[$_])
      enabled = $script:ProductionEnvironment.ContainsKey($_) -and
        [string]$script:ProductionEnvironment[$_] -eq "true"
    }
  })
}

function Invoke-ProductionAudit {
  Write-Step "Auditing production routes, schedules, video configuration, and social readiness."
  $routes = @(
    Test-HttpEndpoint "Public home" "$ProductionAlias/"
    Test-HttpEndpoint "Services" "$ProductionAlias/services"
    Test-HttpEndpoint "Direct database readiness" "$ProductionAlias/api/v1/production/health"
    Test-HttpEndpoint "Social Command Center" "$ProductionAlias/app/command-center/social-media"
    Test-HttpEndpoint "Content and Video Studio" "$ProductionAlias/app/command-center/social-media/content-studio"
    Test-HttpEndpoint "TokMetric" "$ProductionAlias/app/command-center/tokmetric"
    Test-HttpEndpoint "Enterprise Solutions" "$ProductionAlias/enterprise-solutions"
    Test-HttpEndpoint "Private social video library" "$ProductionAlias/app/social-media/video"
    Test-HttpEndpoint "Video readiness authorization boundary" "$ProductionAlias/api/video/readiness" @(401, 403)
    Test-HttpEndpoint "Video library authorization boundary" "$ProductionAlias/api/video/library?workspaceId=owner-flow-audit" @(401, 403)
  )

  $videoNames = @(
    "VIDEO_RENDER_DISPATCH_MODE", "COMFYUI_WORKFLOW_JSON", "COMFYUI_PROMPT_NODE_ID",
    "VIDEO_RENDER_CALLBACK_SECRET", "VIDEO_RENDER_STORAGE_URL", "VIDEO_RENDER_STORAGE_KEY",
    "VIDEO_RENDER_STORAGE_AUTH_ORIGIN", "VIDEO_ASSET_ALLOWED_ORIGINS",
    "ENTERPRISE_SOLUTIONS_VIDEO_URL", "ENTERPRISE_SOLUTIONS_VIDEO_APPROVED"
  )
  $orchestratorNames = @(
    "CONTENT_ORCHESTRATOR_WORKSPACE_ID", "CONTENT_ORCHESTRATOR_ACTOR_ID",
    "CONTENT_ORCHESTRATOR_CRON_SECRET", "CONTENT_ORCHESTRATOR_NEXTDOOR_LOCAL_CONTEXT"
  )
  $socialNames = @(
    "SOCIAL_TOKEN_ENCRYPTION_KEY", "SOCIAL_OAUTH_STATE_SECRET",
    "META_SOCIAL_OAUTH_ENABLED", "X_SOCIAL_OAUTH_ENABLED", "NEXTDOOR_OAUTH_ENABLED",
    "LINKEDIN_SOCIAL_OAUTH_ENABLED", "YOUTUBE_SOCIAL_OAUTH_ENABLED",
    "TOKMETRIC_TIKTOK_OAUTH_ENABLED"
  )
  $gateNames = @(
    "SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED", "META_SOCIAL_PUBLISHING_ENABLED",
    "X_SOCIAL_PUBLISHING_ENABLED", "NEXTDOOR_PUBLISHING_ENABLED",
    "LINKEDIN_SOCIAL_PUBLISHING_ENABLED", "YOUTUBE_PUBLISHING_ENABLED",
    "TOKMETRIC_LIVE_PUBLISHING_ENABLED", "INDEED_JOB_PUBLISHING_ENABLED"
  )

  $report = [ordered]@{
    generatedAt = (Get-Date).ToUniversalTime().ToString("o")
    repository = [ordered]@{
      root = $RepoRoot
      commit = (& git -C $RepoRoot rev-parse HEAD).Trim()
      branch = (& git -C $RepoRoot branch --show-current).Trim()
      expectedCommit = $ExpectedCommit
      clean = @(& git -C $RepoRoot status --porcelain).Count -eq 0
    }
    schedule = [ordered]@{
      dailyContentUtc = "12:00"
      endpoint = "/api/social-media/orchestrator/daily/process"
      minimumTikTokDrafts = 20
      externalPublishingScheduled = $false
    }
    routes = $routes
    video = Environment-State $videoNames
    orchestrator = Environment-State $orchestratorNames
    socialOAuth = Environment-State $socialNames
    publishingGates = Environment-State $gateNames
    manualAccountAuthorizationRequired = $true
    notes = @(
      "The terminal configures systems and opens authorization surfaces; provider consent still occurs in the browser.",
      "Indeed remains disabled unless a genuine vacancy or approved employer update exists.",
      "Daily generation creates drafts and approval requests, not automatic external posts.",
      "Live publishing gates remain false until provider certification evidence is approved.",
      "Private workspace media is never selected automatically for the public enterprise-solutions video.",
      "A locally valid branch is not production evidence; exact-head Preview and production route checks remain required."
    )
  }

  New-Item -ItemType Directory -Force -Path $ReportDirectory | Out-Null
  $report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $ReportPath -Encoding utf8
  $script:CommandResults | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $CommandLogPath -Encoding utf8

  $routes | Format-Table name, status, ok -AutoSize
  Write-Success "Readiness report written to $ReportPath"
  Write-Success "Secret-free command result log written to $CommandLogPath"
  $failedRoutes = @($routes | Where-Object { -not $_.ok })
  if ($failedRoutes.Count -gt 0) {
    if ($Mode -eq "Audit") {
      Write-Notice "$($failedRoutes.Count) production readiness probe(s) failed. Review the report; no repair was attempted."
    }
    else {
      throw "$($failedRoutes.Count) production readiness probe(s) failed after the approved flow. Use the recorded rollback path."
    }
  }
}

function Open-AccountConnections {
  $resolvedWorkspace = $WorkspaceId
  if (-not $resolvedWorkspace -and $script:WorkspaceId) { $resolvedWorkspace = $script:WorkspaceId }
  if (-not $resolvedWorkspace -and $script:ProductionEnvironment.ContainsKey("CONTENT_ORCHESTRATOR_WORKSPACE_ID")) {
    $resolvedWorkspace = [string]$script:ProductionEnvironment["CONTENT_ORCHESTRATOR_WORKSPACE_ID"]
  }
  if ($resolvedWorkspace) {
    Set-Clipboard -Value $resolvedWorkspace
    Write-Success "Workspace ID copied to the clipboard: $resolvedWorkspace"
  } else {
    Write-Notice "No workspace ID was available to copy."
  }

  $urls = @(
    "$ProductionAlias/app/command-center/social-media",
    "$ProductionAlias/app/command-center/tokmetric",
    "$ProductionAlias/app/command-center/social-media/content-studio"
    "$ProductionAlias/app/social-media/video"
  )
  Write-Host ""
  Write-Host "Register these exact callbacks in the provider developer consoles:" -ForegroundColor White
  Write-Host "  Meta:      $ProductionAlias/api/social-media/oauth/meta/callback"
  Write-Host "  X:         $ProductionAlias/api/social-media/oauth/x/callback"
  Write-Host "  Nextdoor:  $ProductionAlias/api/social-media/oauth/nextdoor/callback"
  Write-Host "  LinkedIn:  $ProductionAlias/api/social-media/oauth/linkedin/callback"
  Write-Host "  YouTube:   $ProductionAlias/api/social-media/oauth/youtube/callback"
  Write-Host "  TikTok:    $ProductionAlias/api/tokmetric/oauth/callback"
  Write-Host ""

  if (-not $DoNotOpenBrowser) {
    foreach ($url in $urls) { Start-Process $url | Out-Null }
  }
  Write-Success "Use Social Media Operations for Meta, X, Nextdoor, LinkedIn, and YouTube. Use TokMetric for TikTok."
}

Assert-Windows
Assert-Command "git"
Assert-Command "node"
Assert-Command "pnpm"
Assert-Command "pwsh"
Assert-Command "vercel"
Assert-RepositoryBoundary

$nodeMajor = [int]((& node --version).TrimStart('v').Split('.')[0])
if ($nodeMajor -ne 24) { throw "Node.js 24.x is required; detected $(& node --version)." }
$pnpmMajor = [int]((& pnpm --version).Split('.')[0])
if ($pnpmMajor -ne 10) { throw "pnpm 10.x is required; detected $(& pnpm --version)." }

switch ($Mode) {
  "Connect" {
    Initialize-Vercel
    Open-AccountConnections
  }
  "ActivateVideo" {
    Invoke-VideoActivation
    Initialize-Vercel
    Invoke-ProductionAudit
  }
  "Audit" {
    Initialize-Vercel
    Invoke-DependencyInspection
    Invoke-ProductionAudit
  }
  "Configure" {
    Assert-ProductionChangeApproval
    Initialize-Vercel
    Assert-ExactHeadPreview
    Save-RollbackState
    $config = Read-OwnerConfig
    Configure-Orchestrator $config
    Configure-SocialProviders $config
    Configure-PlatformVideo
    Redeploy-Production
    Initialize-Vercel
    Invoke-ProductionAudit
    Open-AccountConnections
  }
  "Full" {
    Assert-ProductionChangeApproval
    Initialize-Vercel
    Assert-ExactHeadPreview
    Save-RollbackState
    Invoke-LocalVerification
    $config = Read-OwnerConfig
    Configure-Orchestrator $config
    Configure-SocialProviders $config
    Configure-PlatformVideo
    Redeploy-Production
    Invoke-VideoActivation
    Initialize-Vercel
    Invoke-ProductionAudit
    Open-AccountConnections
  }
  "Rollback" {
    Initialize-Vercel
    Invoke-OwnerRollback
    Initialize-Vercel
    Invoke-ProductionAudit
  }
}

Write-Success "The requested GEM owner flow completed for mode '$Mode'."
