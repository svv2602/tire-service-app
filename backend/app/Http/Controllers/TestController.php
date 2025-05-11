<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TestController extends Controller
{
    public function testDb()
    {
        try {
            // Простая проверка подключения к базе данных
            $result = DB::select('SELECT sqlite_version() as version');
            
            // Проверка наличия таблиц
            $tables = DB::select("SELECT name FROM sqlite_master WHERE type='table'");
            
            // Проверка количества записей в таблицах
            $users = DB::table('users')->count();
            $bookings = DB::table('bookings')->count();
            $schedules = DB::table('schedules')->count();
            
            return response()->json([
                'status' => 'success',
                'db_version' => $result[0]->version,
                'tables' => $tables,
                'counts' => [
                    'users' => $users,
                    'bookings' => $bookings,
                    'schedules' => $schedules
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
    
    public function testJson()
    {
        // Простая проверка возвращения JSON
        return response()->json([
            'status' => 'success',
            'message' => 'This is a test JSON response',
            'data' => [
                'name' => 'Test Data',
                'value' => 123
            ]
        ]);
    }
} 