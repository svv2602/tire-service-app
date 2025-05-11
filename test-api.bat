@echo off
REM Скрипт для запуска комплексного тестирования API

echo Запуск комплексного тестирования API...

REM Проверяем, что API сервер запущен
echo Проверка доступности API...
curl -s http://127.0.0.1:8000/api/partners > NUL
if %ERRORLEVEL% NEQ 0 (
    echo ОШИБКА: API на порту 8000 недоступен!
    echo Пожалуйста, запустите бэкенд с помощью скрипта run-backend.bat
    pause
    exit /b 1
)

echo API доступен! Выполняем тесты...

REM Запускаем тестовый скрипт
cd web-frontend
node test-api-comprehensive.js

echo.
echo Тестирование завершено.
pause
