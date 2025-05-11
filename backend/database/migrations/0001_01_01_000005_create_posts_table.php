<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePostsTable extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('service_point_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('post_number');
            $table->integer('slot_duration');
            $table->timestamps();

            $table->foreign('service_point_id')->references('id')->on('service_points')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
}