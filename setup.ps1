# PowerShell script to set up and run the tire service application

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

Write-ColorOutput Green "=== Tire Service Application Setup ==="

# Navigate to backend directory and set up backend
Write-ColorOutput Yellow "Setting up backend..."
cd backend

# Install dependencies
Write-ColorOutput Yellow "Installing backend dependencies..."
composer install

# Copy .env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-ColorOutput Yellow "Creating .env file..."
    Copy-Item .env.example .env
    Write-ColorOutput Yellow "Generating application key..."
    php artisan key:generate
}

# Run database migrations and seeders
Write-ColorOutput Yellow "Setting up database..."
# Run the seed script
.\seed-db.ps1

# Start the backend server
Write-ColorOutput Yellow "Starting the backend server..."
Start-Process powershell -ArgumentList "-Command php artisan serve"

# Navigate to web-frontend directory and set up frontend
Write-ColorOutput Yellow "Setting up web frontend..."
cd ../web-frontend

# Install dependencies
Write-ColorOutput Yellow "Installing frontend dependencies..."
npm install

# Start the frontend development server
Write-ColorOutput Yellow "Starting the frontend development server..."
npm start

Write-ColorOutput Green "=== Setup completed ==="
Write-ColorOutput Yellow "The application should now be running at:"
Write-ColorOutput Yellow "- Backend: http://localhost:8000"
Write-ColorOutput Yellow "- Frontend: http://localhost:3000"
Write-ColorOutput Yellow "Login with admin@tyreservice.com / password" 