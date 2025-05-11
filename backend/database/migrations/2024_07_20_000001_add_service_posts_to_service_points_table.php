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
        Schema::table('service_points', function (Blueprint $table) {
            // Add JSON field to store custom service posts with their time durations
            // Each post can have any duration between 5-240 minutes (not limited to predefined intervals)
            $table->json('service_posts')->nullable()->after('service_time_grid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_points', function (Blueprint $table) {
            $table->dropColumn('service_posts');
        });
    }
}; 