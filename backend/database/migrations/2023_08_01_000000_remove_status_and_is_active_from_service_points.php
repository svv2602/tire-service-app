<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemoveStatusAndIsActiveFromServicePoints extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('service_points', function (Blueprint $table) {
            $table->dropColumn('status');
            $table->dropColumn('is_active');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('service_points', function (Blueprint $table) {
            $table->string('status')->default('работает')->after('notes');
            $table->boolean('is_active')->default(true)->after('status');
        });
    }
} 