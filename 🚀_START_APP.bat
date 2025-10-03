@echo off
title DB Diagram Web App - Server Running
color 0A
cls
echo.
echo ╔════════════════════════════════════════════════════╗
echo ║                                                    ║
echo ║         DB DIAGRAM WEB APP - STARTING...          ║
echo ║                                                    ║
echo ╚════════════════════════════════════════════════════╝
echo.
echo.

cd /d "%~dp0"

echo [√] Checking dependencies...
if not exist "node_modules" (
    echo [!] Installing dependencies...
    call npm install
    echo.
)

echo [√] Starting development server...
echo.
echo ════════════════════════════════════════════════════
echo.
echo     ✓ Server URL: http://localhost:3000
echo.
echo     ✓ Open this URL in your browser
echo.
echo     ✓ Press Ctrl+C to stop the server
echo.
echo ════════════════════════════════════════════════════
echo.
echo.

call npm run dev

pause
