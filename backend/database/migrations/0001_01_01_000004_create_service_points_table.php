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
        Schema::create('service_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained();
            $table->string('name');
            $table->string('region')->nullable();
            $table->string('city')->nullable();
            $table->string('address');
            $table->double('lat')->default(0);
            $table->double('lng')->default(0);
            $table->json('working_hours');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['lat', 'lng']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_points');
    }
};