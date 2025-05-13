@echo off
echo Starting the web frontend application...

echo Checking for package.json...
if not exist package.json (
    echo Error: package.json not found in %CD%
    echo Make sure you are in the web-frontend directory
    pause
    exit /b 1
)

echo Installing dependencies...
call npm install

echo Starting the development server...
call npm start

pause 