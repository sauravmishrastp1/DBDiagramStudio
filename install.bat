@echo off
cd /d "%~dp0"
echo Installing dependencies...
npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo.
echo Dependencies installed successfully!
echo You can now run: npm run dev
echo.
pause
