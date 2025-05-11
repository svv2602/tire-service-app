#!/bin/bash

# Change to the project directory
cd backend

# Show what we're doing
echo "=== Refreshing database with Ukrainian test data ==="
echo

# First migrate fresh to reset the database
echo "Step 1: Running fresh migrations..."
php artisan migrate:fresh --force

# Run all migrations to add the service_point_id and time columns
echo
echo "Step 2: Running additional migrations for columns..."
echo "  - Adding service_point_id and vehicle fields to bookings table"
echo "  - Adding time column to schedules table"
php artisan migrate --force

# Finally seed the database
echo
echo "Step 3: Seeding the database with Ukrainian test data..."
php artisan db:seed --force

echo
echo "✅ Database has been refreshed with Ukrainian test data." 