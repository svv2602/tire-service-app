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
            if (!Schema::hasColumn('service_points', 'region')) {
                $table->string('region')->nullable()->after('name');
            }
            if (!Schema::hasColumn('service_points', 'city')) {
                $table->string('city')->nullable()->after('region');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_points', function (Blueprint $table) {
            if (Schema::hasColumn('service_points', 'region')) {
                $table->dropColumn('region');
            }
            if (Schema::hasColumn('service_points', 'city')) {
                $table->dropColumn('city');
            }
        });
    }
};
