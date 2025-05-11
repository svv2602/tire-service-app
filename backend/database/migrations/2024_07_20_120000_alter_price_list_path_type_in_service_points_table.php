<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('service_points', function (Blueprint $table) {
            $table->text('price_list_path')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('service_points', function (Blueprint $table) {
            $table->string('price_list_path')->nullable()->change();
        });
    }
};
