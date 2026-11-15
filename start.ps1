# SupportDesk AI One-Click Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "      SupportDesk AI - Unified Web Application" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting unified full-stack application on port 8000 ..." -ForegroundColor Green
Write-Host "PC Access:    http://localhost:8000" -ForegroundColor Yellow
Write-Host "Phone Access: http://192.168.0.103:8000 (connected to same Wi-Fi)" -ForegroundColor Yellow
Write-Host ""

Start-Process "http://localhost:8000"

$pythonPath = "C:\Users\sriya\AppData\Local\Programs\Python\Python312\python.exe"
Set-Location -Path "$PSScriptRoot\backend"
& $pythonPath -m uvicorn app.main:app --host 0.0.0.0 --port 8000
