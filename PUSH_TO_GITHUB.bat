@echo off
title RK EVENTRA - Push to GitHub
color 0A
cls
echo ========================================================
echo         RK EVENTRA -- PUSHING TO GITHUB
echo ========================================================
echo.
cd /d "c:\Users\R KARTHIKEYAN\Downloads\RK EVENTRA"
echo Target Repository: https://github.com/tnkarthitnkarthi3-sys/RK-EVENTRA.git
echo.
echo [1/2] Setting branch to master...
git branch -M master

echo.
echo [2/2] Pushing all files to GitHub...
echo (If a GitHub Sign-In browser popup opens, click "Sign in with your browser")
echo.
git push -u origin master

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo  SUCCESS! All RK Eventra files are now pushed to GitHub!
    echo  Check your repo: https://github.com/tnkarthitnkarthi3-sys/RK-EVENTRA
    echo ========================================================
) else (
    echo [!] Push failed or cancelled.
)
echo.
pause
