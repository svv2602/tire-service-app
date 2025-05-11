<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration addresses the issue with time columns in the schedules table.
     * Our seeders use a 'time' column but the schema has 'start_time' and 'end_time'.
     */
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            // Add time column
            $table->time('time')->nullable()->after('date');
            
            // Make start_time and end_time nullable
            $table->time('start_time')->nullable()->change();
            $table->time('end_time')->nullable()->change();
            
            // Remove is_booked as it's redundant with status
            if (Schema::hasColumn('schedules', 'is_booked')) {
                $table->dropColumn('is_booked');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            // Drop the time column
            $table->dropColumn('time');
            
            // Make start_time and end_time required again
            $table->time('start_time')->nullable(false)->change();
            $table->time('end_time')->nullable(false)->change();
            
            // Add is_booked back if it was removed
            if (!Schema::hasColumn('schedules', 'is_booked')) {
                $table->boolean('is_booked')->default(false)->after('end_time');
            }
        });
    }
}; 