<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Аутентификация пользователя и выдача токена.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function login(Request $request)
    {
        Log::info('Login request received', [
            'email' => $request->email,
            'user_agent' => $request->header('User-Agent'),
            'origin' => $request->header('Origin'),
            'csrf' => $request->header('X-CSRF-TOKEN'),
            'request_method' => $request->method(),
            'content_type' => $request->header('Content-Type'),
            'accept' => $request->header('Accept'),
            'ip' => $request->ip()
        ]);

        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            // Check if user exists with detailed logging
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                Log::warning('User not found', [
                    'email' => $request->email,
                    'all_users_count' => User::count()
                ]);
                
                return response()->json([
                    'message' => 'Пользователь не найден',
                    'errors' => ['email' => ['Пользователь не найден']],
                    'debug_info' => [
                        'error_type' => 'user_not_found',
                        'user_email' => $request->email,
                        'timestamp' => now()->toDateTimeString()
                    ]
                ], 401);
            }

            // Log before password check for debugging
            Log::info('User found, checking password', [
                'user_id' => $user->id,
                'password_provided' => !empty($request->password),
                'password_length' => strlen($request->password)
            ]);

            if (!Hash::check($request->password, $user->password)) {
                Log::warning('Invalid password', [
                    'email' => $request->email,
                    'user_id' => $user->id,
                    'password_start' => substr($request->password, 0, 2) . '...',
                    'hash_start' => substr($user->password, 0, 15) . '...'
                ]);
                
                return response()->json([
                    'message' => 'Неверный пароль',
                    'errors' => ['password' => ['Неверный пароль']],
                    'debug_info' => [
                        'error_type' => 'invalid_password',
                        'user_id' => $user->id,
                        'timestamp' => now()->toDateTimeString()
                    ]
                ], 401);
            }

            // Delete previous tokens if needed
            if ($request->has('remove_old_tokens') && $request->remove_old_tokens) {
                $user->tokens()->delete();
                Log::info('Removed old tokens', ['user_id' => $user->id]);
            } else if ($user->tokens()->count() > 20) {
                // Cleanup old tokens if there are too many
                $user->tokens()->orderBy('created_at')->limit($user->tokens()->count() - 20)->delete();
                Log::info('Cleaned up old tokens', ['user_id' => $user->id]);
            }

            // Create token for user
            $token = $user->createToken('auth-token')->plainTextToken;
            
            Log::info('Authentication successful', [
                'user_id' => $user->id, 
                'role' => $user->role,
                'token_prefix' => Str::substr($token, 0, 10) . '...'
            ]);

            return response()->json([
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ]
            ]);
        } catch (ValidationException $e) {
            Log::error('Validation error', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Ошибка валидации',
                'errors' => $e->errors(),
                'debug_info' => [
                    'error_type' => 'validation_error',
                    'timestamp' => now()->toDateTimeString()
                ]
            ], 422);
        } catch (\Exception $e) {
            Log::error('Login error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'class' => get_class($e),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            
            return response()->json([
                'message' => 'Ошибка при аутентификации: ' . $e->getMessage(),
                'debug_info' => [
                    'error_type' => 'exception',
                    'exception_class' => get_class($e),
                    'timestamp' => now()->toDateTimeString()
                ]
            ], 500);
        }
    }

    /**
     * Выход из системы.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            Log::info('Logout successful', ['user_id' => $request->user()->id]);

            return response()->json(['message' => 'Выход выполнен успешно']);
        } catch (\Exception $e) {
            Log::error('Logout error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Ошибка при выходе: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получение данных текущего пользователя.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function user(Request $request)
    {
        try {
            Log::info('User data request', ['user_id' => $request->user()->id]);
            
            return response()->json([
                'user' => [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('User data error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Ошибка при получении данных: ' . $e->getMessage()
            ], 500);
        }
    }
} 