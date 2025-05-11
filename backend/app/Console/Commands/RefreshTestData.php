<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class RefreshTestData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:refresh-test-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Refreshes the database with Ukrainian test data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting database refresh with Ukrainian test data...');

        // Fresh migrations
        $this->info('Refreshing migrations...');
        $this->newLine();
        Artisan::call('migrate:fresh', ['--force' => true]);
        $this->info(Artisan::output());

        // Seed the database
        $this->info('Seeding database with Ukrainian test data...');
        $this->newLine();
        Artisan::call('db:seed', ['--force' => true]);
        $this->info(Artisan::output());

        $this->newLine();
        $this->info('✅ Database has been refreshed with Ukrainian test data!');
        $this->info('User credentials:');
        $this->table(
            ['Role', 'Email', 'Password'],
            [
                ['Admin', 'admin@tyreservice.ua', 'password'],
                ['Partner', 'partner1@tyreservice.ua', 'password'],
                ['Partner', 'partner2@tyreservice.ua', 'password'],
                ['Partner', 'partner3@tyreservice.ua', 'password'],
                ['Client', 'client1@gmail.com', 'password'],
            ]
        );

        return Command::SUCCESS;
    }
} 