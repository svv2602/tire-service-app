@echo off
echo === Refreshing database with Ukrainian test data ===
echo.

cd backend

echo Step 1: Running fresh migrations...
php artisan migrate:fresh --force
echo.

echo Step 2: Running additional migrations for columns...
echo   - Adding service_point_id and vehicle fields to bookings table
echo   - Adding time column to schedules table
php artisan migrate --force
echo.

echo Step 3: Seeding the database with Ukrainian test data...
php artisan db:seed --force
echo.

echo === Database refresh completed ===
echo.
echo Your database has been successfully refreshed with Ukrainian test data.
echo.
pause 