@echo off
title RK EVENTRA - Push to GitHub
color 0A
cls
echo ========================================================
echo         RK EVENTRA -- 1-CLICK GITHUB PUSH
echo ========================================================
echo.

:: Navigate to actual project folder
cd /d "c:\Users\R KARTHIKEYAN\Downloads\RK EVENTRA"

echo Current Directory: %cd%
echo.

set /p REPO_URL="Enter your GitHub Repository URL: "

if "%REPO_URL%"=="" (
    echo [!] No URL provided. Cancelled.
    pause
    exit /b
)

echo.
echo [1/3] Configuring Git remote...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%

echo [2/3] Setting branch to master...
git branch -M master

echo [3/3] Pushing all code to GitHub...
git push -u origin master

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo  SUCCESS! All RK Eventra files are now on GitHub!
    echo  Now go to https://vercel.com to deploy in 1 click!
    echo ========================================================
) else (
    echo [!] Push failed or cancelled. Make sure your GitHub URL is correct
    echo     and you have signed in to GitHub.
)
echo.
pause
