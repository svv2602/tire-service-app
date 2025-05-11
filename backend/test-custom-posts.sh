#!/bin/bash
# Script to test custom service posts

# Print colored output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Testing Custom Service Posts ===${NC}"
echo -e "${YELLOW}Running seeder for custom service posts...${NC}"

# Run the custom seeder
php artisan db:seed --class=CustomServicePostsSeeder

echo -e "${GREEN}=== Custom posts testing complete ===${NC}"
echo -e "${YELLOW}You can now test the custom duration posts in the application${NC}" 