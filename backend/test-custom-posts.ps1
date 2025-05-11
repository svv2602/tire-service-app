# PowerShell script to test custom service posts

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

Write-ColorOutput Yellow "=== Testing Custom Service Posts ==="
Write-ColorOutput Yellow "Running seeder for custom service posts..."

# Run the custom seeder
php artisan db:seed --class=CustomServicePostsSeeder

Write-ColorOutput Green "=== Custom posts testing complete ==="
Write-ColorOutput Yellow "You can now test the custom duration posts in the application" 