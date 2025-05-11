@echo off
cd backend
php artisan serve --host=localhost --port=3008 --max-header-size=16384 