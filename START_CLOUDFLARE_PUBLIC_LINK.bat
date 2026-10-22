@echo off
title RK EVENTRA - Cloudflare Live Internet Publisher
color 0A
cls
echo ========================================================
echo       RK EVENTRA -- 100%% DIRECT LIVE PUBLIC LINK
echo               (NO PASSWORDS - NO IP CHECK)
echo ========================================================
echo.
echo [1/2] Checking if RK Eventra local server is running...
netstat -ano | findstr :3000 >nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] Server starting in background...
    cd /d "c:\Users\R KARTHIKEYAN\Downloads\RK EVENTRA"
    start /min "RK Eventra Server" cmd /c "npm run dev"
    timeout /t 5 >nul
) else (
    echo [OK] RK Eventra local server is active on port 3000!
)

echo.
echo [2/2] Connecting to Cloudflare Global Edge Network...
echo.
echo ========================================================
echo  LOOK BELOW FOR YOUR LIVE HTTPS URL:
echo  (Copy and send it to ANYONE in the world to visit!)
echo ========================================================
echo.
cd /d "c:\Users\R KARTHIKEYAN\Downloads\RK EVENTRA"
cloudflared tunnel --url http://localhost:3000
pause
