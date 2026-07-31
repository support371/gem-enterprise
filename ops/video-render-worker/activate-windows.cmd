@echo off
setlocal
where pwsh >nul 2>nul
if errorlevel 1 (
  echo PowerShell 7 is required. Install it, then run this launcher again.
  exit /b 1
)
pwsh -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0activate-windows.ps1" %*
exit /b %errorlevel%
