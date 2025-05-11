@echo off
echo Starting the Tire Service Web Application...

REM Очищаем порты, если они заняты
echo Clearing ports...
start cmd /c "netstat -ano | findstr :8000 | findstr LISTENING && echo Stopping process on port 8000... && FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') DO taskkill /F /PID %%P"
timeout /T 2 /NOBREAK >NUL

echo Starting backend server on port 8000...
start cmd /k "cd d:\coding\mobi\backend && php artisan config:clear && php artisan cache:clear && php artisan serve --host=localhost --port=8000 --max-header-size=32768 --max-request-size=32768"

echo Starting web frontend...
start cmd /k "cd d:\coding\mobi\web-frontend && npm start"

echo Both backend and frontend applications have been started.
echo Backend is running at http://localhost:8000
echo Frontend is running at http://localhost:3000
echo API proxy is configured from frontend to backend

echo.
echo Press any key to close this window. The applications will continue running.
echo To stop the applications close their respective command windows.
pause
