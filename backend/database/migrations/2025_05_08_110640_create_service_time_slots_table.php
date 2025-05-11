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
        Schema::create('service_time_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_point_id')->constrained('service_points')->onDelete('cascade');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('day_of_week'); // monday, tuesday, etc.
            $table->boolean('is_available')->default(true);
            $table->integer('max_appointments')->default(1); // количество доступных слотов в это время
            $table->timestamps();
            
            // Индекс для быстрого поиска доступных слотов
            $table->index(['service_point_id', 'day_of_week', 'is_available']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_time_slots');
    }
};
