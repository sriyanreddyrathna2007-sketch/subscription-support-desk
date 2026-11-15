@echo off
setlocal
title SupportDesk AI - Push to GitHub
echo ========================================================
echo       SupportDesk AI - Push to GitHub Helper
echo ========================================================
echo.

set "GIT_CMD=C:\Users\sriya\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"
if not exist "%GIT_CMD%" set "GIT_CMD=git"

cd /d "%~dp0"

echo Current Git Status:
"%GIT_CMD%" status --short
echo.

echo --------------------------------------------------------
echo 1. Create a NEW empty repository on https://github.com/new
echo    (Do NOT check 'Initialize with README', '.gitignore', or 'License')
echo 2. Copy your repository HTTPS URL.
echo    Example: https://github.com/YOUR_USERNAME/subscription-support-desk.git
echo --------------------------------------------------------
echo.

set /p REPO_URL="Enter your GitHub Repository URL: "

if "%REPO_URL%"=="" (
    echo [ERROR] No URL provided. Aborting.
    pause
    exit /b 1
)

echo.
echo Configuring remote origin to: %REPO_URL%
"%GIT_CMD%" remote remove origin 2>nul
"%GIT_CMD%" remote add origin "%REPO_URL%"
"%GIT_CMD%" branch -M main

echo.
echo Pushing project to GitHub (branch: main)...
"%GIT_CMD%" push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo  SUCCESS! Your project is now live on GitHub!
    echo ========================================================
) else (
    echo.
    echo [NOTICE] Push encountered an issue. If GitHub prompted for login or personal access token, ensure you are authenticated.
)

echo.
pause
