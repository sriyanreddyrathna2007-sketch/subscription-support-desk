# SupportDesk AI - Push to GitHub Helper
param (
    [string]$RepoUrl
)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       SupportDesk AI - Push to GitHub Helper" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$gitCmd = "C:\Users\sriya\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"
if (-not (Test-Path $gitCmd)) {
    $gitCmd = "git"
}

Set-Location -Path $PSScriptRoot

if (-not $RepoUrl) {
    Write-Host "1. Create a NEW empty repository on https://github.com/new" -ForegroundColor Yellow
    Write-Host "   (Leave README, .gitignore, and License UNCHECKED)" -ForegroundColor DarkGray
    Write-Host "2. Copy your repo URL (e.g. https://github.com/username/subscription-support-desk.git)" -ForegroundColor Yellow
    Write-Host ""
    $RepoUrl = Read-Host "Paste your GitHub Repository URL"
}

if (-not $RepoUrl) {
    Write-Host "[ERROR] No URL provided. Aborting." -ForegroundColor Red
    return
}

Write-Host "`nSetting remote origin to: $RepoUrl..." -ForegroundColor Green
& $gitCmd remote remove origin 2>$null
& $gitCmd remote add origin $RepoUrl
& $gitCmd branch -M main

Write-Host "Pushing main branch to GitHub..." -ForegroundColor Green
& $gitCmd push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host " SUCCESS! Your full Support Desk project is on GitHub!" -ForegroundColor White
    Write-Host "========================================================" -ForegroundColor Green
} else {
    Write-Host "`n[NOTE] If authentication failed, ensure you have GitHub CLI or a Personal Access Token configured." -ForegroundColor Yellow
}
