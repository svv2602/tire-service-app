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
        Schema::table('bookings', function (Blueprint $table) {
            // Add service_point_id column with foreign key
            $table->unsignedBigInteger('service_point_id')->after('client_id');
            $table->foreign('service_point_id')->references('id')->on('service_points');
            
            // Add vehicle information columns
            $table->string('vehicle_brand')->nullable()->after('car_number');
            $table->string('vehicle_type')->nullable()->after('vehicle_brand');
            
            // Add notes column
            $table->text('notes')->nullable()->after('vehicle_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Drop foreign key first
            $table->dropForeign(['service_point_id']);
            
            // Drop columns
            $table->dropColumn('service_point_id');
            $table->dropColumn('vehicle_brand');
            $table->dropColumn('vehicle_type');
            $table->dropColumn('notes');
        });
    }
}; 