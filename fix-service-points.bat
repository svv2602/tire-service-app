@echo off
echo SERVICE POINTS FIXER
echo ====================
echo.
echo This script will fix all service points in the database to ensure:
echo 1. All points have is_active=true
echo 2. All status values are normalized (active, suspended, closed)
echo.
echo Available modes:
echo - check: Only check and report issues (default)
echo - fix: Check and apply fixes to the database
echo.

set MODE=%1
if "%MODE%"=="" set MODE=check

echo Starting in %MODE% mode...
echo.

cd web-frontend
node fix-service-points.js %MODE%

echo.
echo Script finished. Press any key to exit.
pause > nul 