@echo off
cd /d "%~dp0"
echo Starting DB Diagram Server...
echo.
echo Server will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.
npm run dev
