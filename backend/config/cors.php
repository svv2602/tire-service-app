<?php

return [
    'paths' => ['*', 'api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3008',
        'http://localhost:8080',
        'http://localhost:19000',
        'http://localhost:19001',
        'http://localhost:19002',
        'http://localhost',
        'capacitor://localhost',
        'https://tyreservice.local',
        'http://localhost:5173',
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 86400,
    'supports_credentials' => true,
]; 