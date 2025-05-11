<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Handle preflight OPTIONS requests immediately
        if ($request->isMethod('OPTIONS')) {
            $response = new Response('', 200);
        } else {
            $response = $next($request);
        }
        
        // List of allowed origins
        $allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3008',
            'http://localhost:8080',
            'http://localhost:19000', // Expo
            'http://localhost:19001', // Expo
            'http://localhost:19002', // Expo
            'http://localhost',
            'capacitor://localhost', // For mobile apps
            'https://tyreservice.local',
            'http://localhost:5173', // Vite default
        ];

        // Get the origin from the request
        $origin = $request->header('Origin');
        
        // Only set CORS headers if they haven't been set yet
        if (!$response->headers->has('Access-Control-Allow-Origin')) {
            if ($origin && in_array($origin, $allowedOrigins)) {
                $response->headers->set('Access-Control-Allow-Origin', $origin);
                // Set credentials support when using specific origin
                $response->headers->set('Access-Control-Allow-Credentials', 'true');
            } else {
                // Default when no origin provided or not in allowed list
                $response->headers->set('Access-Control-Allow-Origin', '*');
                // No credentials with wildcard origin (browsers don't allow this)
            }
            
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, X-Token-Auth, Authorization, X-XSRF-TOKEN, X-CSRF-TOKEN');
            $response->headers->set('Access-Control-Max-Age', '86400'); // 24 hours
        }
        
        return $response;
    }
} 