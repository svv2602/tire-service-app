<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('service_points', 'deleted_at')) {
            Schema::table('service_points', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Only add the deleted_at column to schedules if the table exists
        if (Schema::hasTable('schedules') && !Schema::hasColumn('schedules', 'deleted_at')) {
            Schema::table('schedules', function (Blueprint $table) {
                $table->softDeletes();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We don't want to drop these columns if we roll back
        // as they should exist in the original schema
    }
}; 