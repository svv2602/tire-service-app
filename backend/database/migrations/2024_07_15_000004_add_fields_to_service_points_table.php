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
            $table->text('description')->nullable()->after('working_hours');
            $table->text('contact_info')->nullable()->after('description');
            $table->text('notes')->nullable()->after('contact_info');
            $table->boolean('is_active')->default(true)->after('notes');
            $table->integer('num_posts')->default(1)->after('is_active');
            $table->json('service_time_grid')->nullable()->after('num_posts');
            $table->string('price_list_path')->nullable()->after('service_time_grid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_points', function (Blueprint $table) {
            $table->dropColumn([
                'description',
                'contact_info',
                'notes',
                'is_active',
                'num_posts',
                'service_time_grid',
                'price_list_path'
            ]);
        });
    }
}; 