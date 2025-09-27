@echo off
title SkyZin Backend Server
echo ========================================
echo      Starting SkyZin Backend Server
echo ========================================
echo.
echo Server will run on: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd backend
if not exist node_modules (
    echo Node modules not found! Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
)

echo Starting backend server in development mode...
call npm run dev

pause