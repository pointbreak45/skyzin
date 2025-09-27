@echo off
title SkyZin User Interface
echo ========================================
echo      Starting SkyZin User Interface
echo ========================================
echo.
echo User interface will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd user
if not exist node_modules (
    echo Node modules not found! Installing dependencies...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo ERROR: Failed to install user interface dependencies
        pause
        exit /b 1
    )
)

echo Starting user interface in development mode...
call npm run dev

pause