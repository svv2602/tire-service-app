<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasColumn('service_point_photos', 'deleted_at')) {
            Schema::table('service_point_photos', function (Blueprint $table) {
                $table->softDeletes();
            });
        }
    }

    public function down()
    {
        if (Schema::hasColumn('service_point_photos', 'deleted_at')) {
            Schema::table('service_point_photos', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};