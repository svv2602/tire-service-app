<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class ListUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:list';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List all users in the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $users = User::all();
        
        $this->info('Total users: ' . $users->count());
        $this->newLine();
        
        $headers = ['ID', 'Name', 'Email', 'Role', 'Created At'];
        $rows = [];
        
        foreach ($users as $user) {
            $rows[] = [
                $user->id,
                $user->name,
                $user->email,
                $user->role ?? 'N/A',
                $user->created_at,
            ];
        }
        
        $this->table($headers, $rows);
        
        $this->newLine();
        $this->info('Test users for login:');
        
        // List all test users with 'example.com' domain
        $testUserEmails = [
            'admin@example.com',
            'partner@example.com',
            'user@example.com',
            'demo@example.com',
            'admin@tyreservice.com',
            'partner@tyreservice.com',
            'client@tyreservice.com'
        ];
        
        $testUsers = User::whereIn('email', $testUserEmails)->get();
                        
        $testRows = [];
        foreach ($testUsers as $user) {
            $password = strpos($user->email, '@example.com') !== false ? 'password' : 'password123';
            $testRows[] = [
                $user->id,
                $user->name,
                $user->email,
                'Password: ' . $password,
                $user->role ?? 'N/A',
            ];
        }
        
        $this->table(['ID', 'Name', 'Email', 'Password', 'Role'], $testRows);
        
        return Command::SUCCESS;
    }
}
