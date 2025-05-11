<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\DBAdapterService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(DBAdapterService::class, function ($app) {
            return new DBAdapterService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
