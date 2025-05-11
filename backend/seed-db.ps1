# PowerShell script to refresh and seed the database

# Print colored output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Yellow "=== Tire Service Database Setup ==="
Write-ColorOutput Yellow "Starting database migration and seeding..."

# Run migrations with fresh (drop all tables and re-run migrations)
Write-ColorOutput Yellow "Refreshing database..."
php artisan migrate:fresh
Write-ColorOutput Green "Database refreshed successfully"

# Run seeders to populate with test data
Write-ColorOutput Yellow "Seeding database with test data..."
php artisan db:seed
Write-ColorOutput Green "Database seeded successfully"

# Run migration status to verify
Write-ColorOutput Yellow "Checking migration status..."
php artisan migrate:status

Write-ColorOutput Green "=== Database setup complete ==="
Write-ColorOutput Yellow "You can now use the application with test data"
Write-ColorOutput Yellow "Admin credentials: admin@tyreservice.com / password" 