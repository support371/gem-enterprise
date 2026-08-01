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
$script:WorkspaceId = ""

if ($Mode -in @("Configure", "Full")) {
  $defaultConfig = Join-Path $PSScriptRoot "social-providers.local.json"
  $candidate = if ($SocialConfigPath) {
    $SocialConfigPath
  } elseif (Test-Path -LiteralPath $defaultConfig) {
    $defaultConfig
  } else {
    ""
  }

  if ($candidate -and (Test-Path -LiteralPath $candidate -PathType Leaf)) {
    try {
      $ownerConfig = Get-Content -LiteralPath $candidate -Raw | ConvertFrom-Json
      $configuredContext = [string]$ownerConfig.orchestrator.nextdoorLocalContext
      if (
        $configuredContext -match "Replace this sentence" -or
        $configuredContext -match "documented service area"
      ) {
        throw "Replace the example Nextdoor local context with an exact approved locality before running configuration."
      }
    }
    catch {
      throw "Owner configuration preflight failed. $($_.Exception.Message)"
    }
  }

  if (
    $NextdoorLocalContext -match "Replace this sentence" -or
    $NextdoorLocalContext -match "documented service area"
  ) {
    throw "Replace the example Nextdoor local context with an exact approved locality before running configuration."
  }
}

$parameters = @{
  Mode = $Mode
  WorkspaceId = $WorkspaceId
  ServiceActorId = $ServiceActorId
  NextdoorLocalContext = $NextdoorLocalContext
  SocialConfigPath = $SocialConfigPath
  ComfyUiBaseUrl = $ComfyUiBaseUrl
}
if ($SkipLocalVerification) { $parameters.SkipLocalVerification = $true }
if ($StartWorker) { $parameters.StartWorker = $true }
if ($DoNotOpenBrowser) { $parameters.DoNotOpenBrowser = $true }

. (Join-Path $PSScriptRoot "run-all-windows.ps1") @parameters
