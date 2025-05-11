<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Checking database connection...\n";

try {
    $db = app('db');
    $pdo = $db->connection()->getPdo();
    
    echo "Connection successful!\n";
    echo "Database: " . $db->connection()->getDatabaseName() . "\n";
    
    // Try to query for users
    $usersCount = $db->table('users')->count();
    echo "Found {$usersCount} users in database\n";
    
    $users = $db->table('users')->get(['id', 'email', 'role']);
    echo "Users in database:\n";
    foreach ($users as $user) {
        echo "- ID: {$user->id}, Email: {$user->email}, Role: {$user->role}\n";
    }
    
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\nDone.\n"; 