@echo off
title RK EVENTRA - Event Booking Marketplace
color 0E

echo ======================================================================
echo                     RK EVENTRA - PLATFORM STARTER
echo             Your Event. Your Choice. Your Celebration.
echo ======================================================================
echo.

cd /d "C:\Users\R KARTHIKEYAN\Downloads\RK EVENTRA"
echo [1/3] Working Directory set to: %CD%
echo.

echo [2/3] Opening RK Eventra in your browser...
start "" http://localhost:3000
start "" http://localhost:3000/feedback
echo.

echo [3/3] Starting Next.js Development Server...
echo Press Ctrl + C to stop the server anytime.
echo.
npm run dev
pause
