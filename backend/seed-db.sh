#!/bin/bash
# Script to refresh and seed the database

# Print colored output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Tire Service Database Setup ===${NC}"
echo -e "${YELLOW}Starting database migration and seeding...${NC}"

# Run migrations with fresh (drop all tables and re-run migrations)
echo -e "${YELLOW}Refreshing database...${NC}"
php artisan migrate:fresh
echo -e "${GREEN}Database refreshed successfully${NC}"

# Run seeders to populate with test data
echo -e "${YELLOW}Seeding database with test data...${NC}"
php artisan db:seed
echo -e "${GREEN}Database seeded successfully${NC}"

# Run migration status to verify
echo -e "${YELLOW}Checking migration status...${NC}"
php artisan migrate:status

echo -e "${GREEN}=== Database setup complete ===${NC}"
echo -e "${YELLOW}You can now use the application with test data${NC}"
echo -e "${YELLOW}Admin credentials: admin@tyreservice.com / password${NC}" 