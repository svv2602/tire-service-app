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
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('service_point_id');
            $table->unsignedInteger('post_number');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_booked')->default(false);
            $table->enum('status', ['available', 'booked', 'completed', 'cancelled'])->default('available');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('service_point_id')->references('id')->on('service_points')->onDelete('cascade');
            
            // Составной индекс для быстрого поиска слотов
            $table->index(['service_point_id', 'date', 'status']);
            // Индекс для поиска по дате
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
