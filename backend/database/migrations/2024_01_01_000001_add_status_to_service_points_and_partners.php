<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('service_points', function (Blueprint $table) {
            // $table->string('status')->default('работает')->after('is_active');
        });
        Schema::table('partners', function (Blueprint $table) {
            // $table->string('status')->default('работает')->after('is_active');
        });
    }

    public function down()
    {
        Schema::table('service_points', function (Blueprint $table) {
            $table->dropColumn('status');
        });
        Schema::table('partners', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
}; 