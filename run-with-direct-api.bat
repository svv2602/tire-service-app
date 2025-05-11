@echo off
echo Starting the Tire Service Web Application with Direct API Access...

echo Starting backend server on port 8000...
start cmd /k "cd d:\coding\mobi\backend && php artisan config:clear && php artisan cache:clear && php artisan serve --host=127.0.0.1 --port=8000"

echo Waiting for backend to initialize...
timeout /T 5 /NOBREAK > NUL

echo Testing API connection...
curl -s http://127.0.0.1:8000/api/partners > NUL
if %ERRORLEVEL% EQU 0 (
    echo API test successful! Backend is running.
) else (
    echo API test failed! Please check backend server.
    pause
    exit /b 1
)

echo Starting web frontend...
start cmd /k "cd d:\coding\mobi\web-frontend && npm start"

echo Both backend and frontend applications have been started.
echo Backend is running at http://127.0.0.1:8000
echo Frontend is running at http://localhost:3008
echo API direct access is configured (bypassing proxy)

echo.
echo Press any key to close this window. The applications will continue running.
echo To stop the applications close their respective command windows.
pause
