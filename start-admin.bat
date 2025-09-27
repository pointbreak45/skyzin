@echo off
title SkyZin Admin Panel
echo ========================================
echo       Starting SkyZin Admin Panel
echo ========================================
echo.
echo Admin panel will run on: http://localhost:4000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd admin
if not exist node_modules (
    echo Node modules not found! Installing dependencies...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo ERROR: Failed to install admin dependencies
        pause
        exit /b 1
    )
)

echo Starting admin panel in development mode...
call npm run dev

pause