#!/bin/bash
# Script to set up and run the tire service application

# Print colored output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Tire Service Application Setup ===${NC}"

# Navigate to backend directory and set up backend
echo -e "${YELLOW}Setting up backend...${NC}"
cd backend

# Install dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
composer install

# Copy .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Generating application key...${NC}"
    php artisan key:generate
fi

# Run database migrations and seeders
echo -e "${YELLOW}Setting up database...${NC}"
# Make the seed script executable and run it
chmod +x seed-db.sh
./seed-db.sh

# Start the backend server
echo -e "${YELLOW}Starting the backend server...${NC}"
php artisan serve > /dev/null 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}Backend server started with PID: $BACKEND_PID${NC}"

# Navigate to web-frontend directory and set up frontend
echo -e "${YELLOW}Setting up web frontend...${NC}"
cd ../web-frontend

# Install dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install

# Start the frontend development server
echo -e "${YELLOW}Starting the frontend development server...${NC}"
npm start

# Cleanup function
cleanup() {
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID
    exit 0
}

# Set up trap to catch interrupts and clean up
trap cleanup SIGINT SIGTERM

echo -e "${GREEN}=== Setup completed ===${NC}"
echo -e "${YELLOW}The application should now be running at:${NC}"
echo -e "${YELLOW}- Backend: http://localhost:8000${NC}"
echo -e "${YELLOW}- Frontend: http://localhost:3000${NC}"
echo -e "${YELLOW}Login with admin@tyreservice.com / password${NC}" 