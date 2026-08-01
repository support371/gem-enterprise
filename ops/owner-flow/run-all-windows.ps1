[CmdletBinding()]
param(
  [ValidateSet("Audit", "Configure", "ActivateVideo", "Connect", "Full")]
  [string]$Mode = "Full",
  [string]$WorkspaceId = "",
  [string]$ServiceActorId = "",
  [string]$NextdoorLocalContext = "",
  [string]$SocialConfigPath = "",
  [string]$ComfyUiBaseUrl = "http://127.0.0.1:8188",
  [switch]$SkipLocalVerification,
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
$script:ProductionEnvironment = @{}

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
  if ($null -eq $InputValue) {
    & $File @Arguments
  }
  else {
    $InputValue | & $File @Arguments
  }
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: $File $($Arguments -join ' ')"
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
  & pnpm dlx vercel@latest whoami *> $null
  if ($LASTEXITCODE -ne 0) {
    Invoke-Native "pnpm" @("dlx", "vercel@latest", "login")
  }

  $temporaryFile = Join-Path ([IO.Path]::GetTempPath()) ("gem-owner-env-{0}.tmp" -f [Guid]::NewGuid())
  try {
    Invoke-Native "pnpm" @(
      "dlx", "vercel@latest", "env", "pull", $temporaryFile,
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
  $arguments = @("dlx", "vercel@latest", "env", "add", $Name, "production", "--force")
  if ($Sensitive) { $arguments += "--sensitive" } else { $arguments += "--no-sensitive" }
  Invoke-Native "pnpm" $arguments $Value
  $script:ProductionEnvironment[$Name] = $Value
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
    Write-Step "Installing locked dependencies."
    Invoke-Native "pnpm" @("install", "--frozen-lockfile")
    Write-Step "Running schema, claims, lint, TypeScript, tests, and production build."
    Invoke-Native "pnpm" @("run", "verify")
  }
  finally {
    Pop-Location
  }
}

function Redeploy-Production {
  Write-Step "Redeploying the currently serving canonical production artifact."
  Invoke-Native "pnpm" @("dlx", "vercel@latest", "redeploy", $ProductionAlias, "--yes")
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

function Test-HttpEndpoint([string]$Name, [string]$Url) {
  try {
    $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 45 -MaximumRedirection 5
    return [ordered]@{ name = $Name; url = $Url; ok = $true; status = $response.StatusCode }
  }
  catch {
    $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
    return [ordered]@{ name = $Name; url = $Url; ok = $false; status = $status; error = $_.Exception.Message }
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
    Test-HttpEndpoint "Social Command Center" "$ProductionAlias/app/command-center/social-media"
    Test-HttpEndpoint "Content and Video Studio" "$ProductionAlias/app/command-center/social-media/content-studio"
    Test-HttpEndpoint "TokMetric" "$ProductionAlias/app/command-center/tokmetric"
  )

  $videoNames = @(
    "VIDEO_RENDER_DISPATCH_MODE", "COMFYUI_WORKFLOW_JSON", "COMFYUI_PROMPT_NODE_ID",
    "VIDEO_RENDER_CALLBACK_SECRET", "VIDEO_RENDER_STORAGE_URL", "VIDEO_RENDER_STORAGE_KEY",
    "VIDEO_RENDER_STORAGE_AUTH_ORIGIN", "VIDEO_ASSET_ALLOWED_ORIGINS"
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
      "Live publishing gates remain false until provider certification evidence is approved."
    )
  }

  New-Item -ItemType Directory -Force -Path $ReportDirectory | Out-Null
  $report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $ReportPath -Encoding utf8

  $routes | Format-Table name, status, ok -AutoSize
  Write-Success "Readiness report written to $ReportPath"
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
    Invoke-LocalVerification
    Invoke-ProductionAudit
  }
  "Configure" {
    Initialize-Vercel
    $config = Read-OwnerConfig
    Configure-Orchestrator $config
    Configure-SocialProviders $config
    Redeploy-Production
    Initialize-Vercel
    Invoke-ProductionAudit
    Open-AccountConnections
  }
  "Full" {
    Initialize-Vercel
    Invoke-LocalVerification
    $config = Read-OwnerConfig
    Configure-Orchestrator $config
    Configure-SocialProviders $config
    Redeploy-Production
    Invoke-VideoActivation
    Initialize-Vercel
    Invoke-ProductionAudit
    Open-AccountConnections
  }
}

Write-Success "The requested GEM owner flow completed for mode '$Mode'."
