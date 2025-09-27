@echo off
echo ========================================
echo    SkyZin - Installing All Packages
echo ========================================
echo.

echo [1/4] Installing root dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [3/4] Installing admin dependencies...
cd ..\admin
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ERROR: Failed to install admin dependencies
    pause
    exit /b 1
)

echo.
echo [4/4] Installing user dependencies...
cd ..\user
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ERROR: Failed to install user dependencies
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo     All packages installed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Run start-backend.bat to start the backend server
echo 2. Run start-admin.bat to start the admin panel
echo 3. Run start-user.bat to start the user interface
echo.
echo Or use start-all.bat to start all services at once
echo.
pause