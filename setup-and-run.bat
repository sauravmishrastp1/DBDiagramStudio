@echo off
echo ========================================
echo DB Diagram Web App - Setup and Run
echo ========================================
echo.

echo [1/3] Killing any running Node processes...
taskkill /F /IM node.exe /T 2>nul
echo.

echo [2/3] Installing dependencies...
call npm install
echo.

echo [3/3] Starting development server...
echo.
echo ========================================
echo Server will start at http://localhost:3000
echo ========================================
echo.
call npm run dev
