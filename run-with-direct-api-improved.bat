@echo off
REM Улучшенный скрипт запуска с прямым доступом к API

echo =========================================================
echo Запуск Веб-приложения с прямым доступом к API
echo =========================================================
echo.

REM Проверяем наличие файла .env в папке backend
if not exist "backend\.env" (
    echo ПРЕДУПРЕЖДЕНИЕ: Файл .env не найден в папке backend.
    echo Копируем env_copy в .env...
    copy "backend\env_copy" "backend\.env" > NUL
    
    if %ERRORLEVEL% NEQ 0 (
        echo ОШИБКА: Не удалось скопировать env_copy!
        pause
        exit /b 1
    ) else (
        echo .env файл успешно создан!
    )
)

REM Запуск бэкенда
echo Запуск бэкенда на порту 8000...
start cmd /k "cd backend && echo ЗАПУСК БЭКЕНДА && php artisan config:clear && php artisan cache:clear && php artisan serve --host=127.0.0.1 --port=8000"

echo Ожидание запуска бэкенда...
timeout /T 5 /NOBREAK > NUL

REM Проверка доступности API
echo Проверка доступности API...
curl -s http://127.0.0.1:8000/api/health-check > NUL
if %ERRORLEVEL% NEQ 0 (
    echo Повторная проверка через 3 секунды...
    timeout /T 3 /NOBREAK > NUL
    curl -s http://127.0.0.1:8000/api/partners > NUL
    
    if %ERRORLEVEL% NEQ 0 (
        echo ПРЕДУПРЕЖДЕНИЕ: API пока недоступен. Попытка запуска фронтенда все равно...
    ) else (
        echo API доступен!
    )
) else (
    echo API доступен!
)

REM Запуск фронтенда с прямым доступом к API
echo.
echo Запуск веб-фронтенда с прямым доступом к API (порт 3008)...
start cmd /k "cd web-frontend && echo ЗАПУСК ФРОНТЕНДА && npm start"

echo.
echo =========================================================
echo ИНФОРМАЦИЯ ОБ ОКРУЖЕНИИ:
echo - Бэкенд: http://127.0.0.1:8000
echo - Фронтенд: http://localhost:3008
echo - Режим доступа: ПРЯМОЙ (без использования прокси)
echo =========================================================
echo.
echo Для завершения работы приложения закройте окна с бэкендом и фронтендом.

echo.
echo Проверка подключения к API...
timeout /T 8 /NOBREAK > NUL

echo Запуск тестового скрипта для проверки API...
cd web-frontend
node test-direct-api.js
cd ..

echo.
echo Для завершения нажмите любую клавишу...
pause > NUL
