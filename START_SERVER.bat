@echo off
title DB Diagram Server - Running on http://localhost:3000
color 0B
cls

echo.
echo ═══════════════════════════════════════════════════════
echo    DB DIAGRAM WEB APP - SERVER STARTING...
echo ═══════════════════════════════════════════════════════
echo.
echo [*] Killing old processes...
taskkill /F /IM node.exe /T >nul 2>&1

echo [*] Starting development server...
echo.
echo ═══════════════════════════════════════════════════════
echo.
echo    ✓ Server will start at: http://localhost:3000
echo.
echo    ✓ Open this URL in your browser
echo.
echo    ✓ UI is now OPTIMIZED for large tables!
echo.
echo    ✓ Shows first 15 columns, scroll for more
echo.
echo ═══════════════════════════════════════════════════════
echo.

npm run dev
