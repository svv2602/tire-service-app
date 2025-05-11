@echo off
echo ===== Tire Service Application Launcher =====
echo.

:menu
echo Choose an option:
echo 1. Start backend server
echo 2. Start web frontend
echo 3. Set up database with test data
echo 4. Test custom service posts
echo 5. Start both backend and frontend
echo 6. Exit
echo.

set /p option=Enter option (1-6): 

if "%option%"=="1" goto backend
if "%option%"=="2" goto frontend
if "%option%"=="3" goto database
if "%option%"=="4" goto customPosts
if "%option%"=="5" goto both
if "%option%"=="6" goto end

echo Invalid option. Please try again.
echo.
goto menu

:backend
echo Starting backend server...
cd backend
start cmd /k php artisan serve
cd ..
echo Backend server started at http://localhost:8000
echo.
goto menu

:frontend
echo Starting web frontend...
cd web-frontend
start cmd /k start-app.bat
cd ..
echo Web frontend started
echo.
goto menu

:database
echo Setting up database with test data...
cd backend
call seed-db.ps1
cd ..
echo Database setup complete
echo.
goto menu

:customPosts
echo Testing custom service posts...
cd backend
call test-custom-posts.ps1
cd ..
echo Custom posts test complete
echo.
goto menu

:both
echo Starting both backend and frontend...
cd backend
start cmd /k php artisan serve
cd ..
cd web-frontend
start cmd /k start-app.bat
cd ..
echo Application started:
echo - Backend: http://localhost:8000
echo - Frontend: http://localhost:3000
echo.
goto menu

:end
echo Exiting...
exit 