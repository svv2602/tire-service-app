@echo off
setlocal

echo Поиск процесса на порту 3008...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3008 ^| findstr LISTENING') do (
    echo Завершение PID %%a, порт 3008...
    taskkill /PID %%a /F
)

echo Поиск процесса на порту 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Завершение PID %%a, порт 8000...
    taskkill /PID %%a /F
)

echo Готово.
echo Запуск Tire Service Web Application...

echo Запуск фронтенда...
cd web-frontend
start cmd /k "npm start -- --port 3008"
cd ..

echo Запуск бэкенда...
start cmd /k "cd backend && php artisan config:clear && php artisan cache:clear && php artisan serve --host=localhost --port=8000"

echo Обе части приложения запущены.
echo Бэкенд:  http://localhost:8000
echo Фронтенд: http://localhost:3008
echo.
echo Нажмите любую клавишу, чтобы закрыть это окно. Приложения продолжат работать в отдельных терминалах.
pause
