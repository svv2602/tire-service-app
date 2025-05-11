<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PartnerController;
use App\Http\Controllers\ServicePointController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\AuthController;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;

Route::get('/', function () {
    return view('welcome');
});

// Super simple direct login with no middleware
Route::post('/direct-login', function (\Illuminate\Http\Request $request) {
    $email = $request->input('email');
    $password = $request->input('password');
    
    // Log attempt for debugging
    \Illuminate\Support\Facades\Log::info('Direct login attempt', [
        'email' => $email,
        'password_length' => strlen($password),
        'ip' => $request->ip(),
        'user_agent' => $request->header('User-Agent'),
        'current_directory' => getcwd(),
        'database_name' => \Illuminate\Support\Facades\DB::connection()->getDatabaseName(),
        'users_table_exists' => \Illuminate\Support\Facades\DB::getSchemaBuilder()->hasTable('users')
    ]);
    
    // Try a raw DB query first
    $rawUser = \Illuminate\Support\Facades\DB::table('users')->whereRaw('LOWER(email) = ?', [strtolower($email)])->first();
    \Illuminate\Support\Facades\Log::info('Raw user query result', [
        'user_found' => !is_null($rawUser),
        'user_data' => $rawUser ? json_encode($rawUser) : 'null'
    ]);
    
    // First try case-sensitive query with Eloquent
    $user = \App\Models\User::where('email', $email)->first();
    
    // If not found with exact case, try case-insensitive query
    if (!$user && $rawUser) {
        $user = \App\Models\User::find($rawUser->id);
        \Illuminate\Support\Facades\Log::info('Found user with case-insensitive match', [
            'provided_email' => $email,
            'actual_email' => $user->email
        ]);
    }
    
    // For debugging - log all users in the system
    $allUsers = \App\Models\User::all(['id', 'email', 'role'])->toArray();
    \Illuminate\Support\Facades\Log::info('All users in system:', [
        'count' => count($allUsers),
        'users' => $allUsers
    ]);
    
    if (!$user) {
        \Illuminate\Support\Facades\Log::warning('Direct login failed - user not found', [
            'email' => $email,
            'all_users_count' => \App\Models\User::count()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'User not found',
            'debug' => [
                'error_type' => 'user_not_found',
                'provided_email' => $email,
                'all_emails_in_db' => \App\Models\User::pluck('email')->toArray()
            ]
        ], 401);
    }
    
    $passwordStart = substr($password, 0, 2) . '...';
    $hashedStart = substr($user->password, 0, 15) . '...';
    $passwordIsValid = \Illuminate\Support\Facades\Hash::check($password, $user->password);
    
    // Log password check details
    \Illuminate\Support\Facades\Log::info('Password check', [
        'user_id' => $user->id,
        'is_valid' => $passwordIsValid,
        'input_preview' => $passwordStart,
        'hash_preview' => $hashedStart
    ]);
    
    if (!$passwordIsValid) {
        \Illuminate\Support\Facades\Log::warning('Direct login failed - invalid password', [
            'email' => $email,
            'user_id' => $user->id
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials',
            'debug' => [
                'error_type' => 'invalid_password',
                'provided_password_start' => $passwordStart,
                'hash_start' => $hashedStart,
                'password_provided' => !empty($password)
            ]
        ], 401);
    }
    
    // Create token directly
    $token = $user->createToken('direct-token')->plainTextToken;
    
    \Illuminate\Support\Facades\Log::info('Direct login successful', [
        'email' => $email,
        'user_id' => $user->id,
        'role' => $user->role,
        'token_preview' => substr($token, 0, 10) . '...'
    ]);
    
    return response()->json([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role
        ]
    ]);
})->withoutMiddleware(['web']);

// Diagnostic route to check CORS
Route::options('/api/login', function () {
    return response('', 200);
});

// Test route for server status
Route::get('/ping', function () {
    return response()->json([
        'status' => 'ok', 
        'time' => now()->toDateTimeString(),
        'server' => 'Laravel ' . app()->version(),
    ]);
});

// Маршрут для CSRF-токена
Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);

// Маршруты авторизации - важно разместить их ДО группы api
Route::post('api/login', [AuthController::class, 'login']);
Route::post('api/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('api/user', [AuthController::class, 'user'])->middleware('auth:sanctum');

Route::prefix('api')->group(function () {
    // Removed partner resource route to avoid conflicts with PartnerTestController
    Route::resource('service-points', ServicePointController::class);
    Route::resource('posts', PostController::class);
    Route::resource('schedules', ScheduleController::class);
    // Removed BookingController resource route to avoid conflicts with BookingTestController
});

// Add login-create route that will create user if they don't exist
Route::post('/login-create', function (\Illuminate\Http\Request $request) {
    $email = $request->input('email');
    $password = $request->input('password');
    
    // Log attempt for debugging
    \Illuminate\Support\Facades\Log::info('Login-create attempt', [
        'email' => $email,
        'password_length' => strlen($password),
        'ip' => $request->ip(),
    ]);
    
    // Try to find the user first
    $user = \App\Models\User::where('email', $email)->first();
    
    if (!$user) {
        // If user doesn't exist, create them
        \Illuminate\Support\Facades\Log::info('Creating new user for login-create', [
            'email' => $email
        ]);
        
        $user = \App\Models\User::create([
            'name' => 'Auto Created User',
            'email' => $email,
            'password' => \Illuminate\Support\Facades\Hash::make($password),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
        
        // Create token for the new user
        $token = $user->createToken('auto-created-token')->plainTextToken;
        
        \Illuminate\Support\Facades\Log::info('User created and logged in', [
            'user_id' => $user->id,
            'email' => $user->email
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'User created and logged in',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role
            ],
            'was_created' => true
        ]);
    }
    
    // User exists, check password
    $passwordIsValid = \Illuminate\Support\Facades\Hash::check($password, $user->password);
    
    if (!$passwordIsValid) {
        \Illuminate\Support\Facades\Log::warning('Login-create failed - invalid password', [
            'email' => $email,
            'user_id' => $user->id
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials',
            'debug' => [
                'error_type' => 'invalid_password',
            ]
        ], 401);
    }
    
    // Create token for existing user
    $token = $user->createToken('login-create-token')->plainTextToken;
    
    \Illuminate\Support\Facades\Log::info('Login-create successful for existing user', [
        'user_id' => $user->id,
        'email' => $user->email
    ]);
    
    return response()->json([
        'success' => true,
        'message' => 'Login successful',
        'token' => $token,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role
        ],
        'was_created' => false
    ]);
})->withoutMiddleware(['web']);

// Add debug route to show request information
Route::post('/debug-request', function (\Illuminate\Http\Request $request) {
    return response()->json([
        'method' => $request->method(),
        'url' => $request->fullUrl(),
        'path' => $request->path(),
        'query' => $request->query(),
        'headers' => $request->headers->all(),
        'body' => $request->all(),
        'ip' => $request->ip(),
        'user_agent' => $request->header('User-Agent'),
    ]);
});

// Add test login endpoint for debugging
Route::get('/test-login-with-admin', function () {
    // Get admin user
    $user = \App\Models\User::where('email', 'admin@example.com')->first();
    
    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Test admin user not found'
        ], 404);
    }
    
    // Create token directly
    $token = $user->createToken('test-token')->plainTextToken;
    
    return response()->json([
        'success' => true,
        'message' => 'Test login successful',
        'token' => $token,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role
        ]
    ]);
});

// Административные маршруты
Route::prefix('admin')->group(function () {
    Route::get('/test-api', [App\Http\Controllers\Admin\ApiTestController::class, 'index'])->name('admin.test-api');
});

// Add a catch-all route at the end to handle React router paths
Route::fallback(function () {
    return view('welcome');
});
