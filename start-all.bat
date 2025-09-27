@echo off
echo ========================================
echo    Starting All SkyZin Services
echo ========================================
echo.
echo This will open 3 terminal windows:
echo 1. Backend Server (Port 5000)
echo 2. Admin Panel (Port 4000) 
echo 3. User Interface (Port 3000)
echo.
echo Make sure all packages are installed first!
echo (Run install-all.bat if you haven't already)
echo.
pause

echo Starting Backend Server...
start "SkyZin Backend" cmd /k "start-backend.bat"
timeout /t 2

echo Starting Admin Panel...
start "SkyZin Admin" cmd /k "start-admin.bat"
timeout /t 2

echo Starting User Interface...
start "SkyZin User" cmd /k "start-user.bat"

echo.
echo ========================================
echo All services are starting up!
echo ========================================
echo.
echo URLs:
echo Backend API: http://localhost:5000
echo Admin Panel: http://localhost:4000
echo User Interface: http://localhost:3000
echo.
echo Close this window or press any key to continue...
pause