@echo off
title RK EVENTRA - Live Internet Publisher
color 0B
cls
echo ========================================================
echo         RK EVENTRA -- LIVE PUBLIC LINK GENERATOR
echo ========================================================
echo.
echo [1/2] Checking local dev server...
netstat -ano | findstr :3000 >nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] Server is not running. Starting RK Eventra server in background...
    cd /d "c:\Users\R KARTHIKEYAN\Downloads\RK EVENTRA"
    start /min "RK Eventra Server" cmd /c "npm run dev"
    timeout /t 5 >nul
) else (
    echo [OK] RK Eventra server is already active on port 3000.
)

echo.
echo [2/2] Generating instant Public HTTPS link for Internet access...
echo.
echo ========================================================
echo  Your Public URL will appear below:
echo  Share this URL with anyone on mobile / PC to visit!
echo ========================================================
echo.
cd /d "c:\Users\R KARTHIKEYAN\Downloads\RK EVENTRA"
call npx --yes localtunnel --port 3000
pause
