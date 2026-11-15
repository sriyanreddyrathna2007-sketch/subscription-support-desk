@echo off
title SupportDesk AI - All-In-One Unified Server
echo ========================================================
echo       SupportDesk AI - Unified Web Application
echo ========================================================
echo.
echo Starting backend API and frontend SPA on port 8000 ...
echo.
echo Local PC:    http://localhost:8000
echo Phone/LAN:   http://192.168.0.103:8000
echo.

cd /d "%~dp0backend"
start http://localhost:8000

"C:\Users\sriya\AppData\Local\Programs\Python\Python312\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000
pause
