<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|array  ...$roles
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Для тестов пропускаем проверку в определенных случаях
        if (app()->environment('testing') && $request->header('X-Skip-Role-Check')) {
            return $next($request);
        }
        
        if (!Auth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 401);
        }

        $user = Auth::user();
        
        // Логируем для отладки
        if (app()->environment('local', 'testing')) {
            Log::info('CheckRole middleware', [
                'roles_required' => $roles,
                'user_role' => $user->role,
                'is_authorized' => empty($roles) || in_array($user->role, $roles),
                'path' => $request->path()
            ]);
        }
        
        if (empty($roles) || in_array($user->role, $roles)) {
            return $next($request);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Forbidden',
            'required_roles' => $roles,
            'your_role' => $user->role
        ], 403);
    }
} 