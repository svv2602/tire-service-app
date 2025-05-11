<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ServicePoint;

class PopulateAddressColumns extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:populate-address-columns {--force : Force update existing values}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Populate region and city columns from address field';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Populating region and city columns from address field...');
        
        // Get service points
        $query = ServicePoint::query();
        
        // Skip service points that already have region and city unless --force is used
        if (!$this->option('force')) {
            $query->whereNull('region')->orWhereNull('city');
        }
        
        $servicePoints = $query->get();
        
        if ($servicePoints->isEmpty()) {
            $this->info('No service points found to process.');
            return;
        }
        
        $this->info("Found {$servicePoints->count()} service points to process.");
        
        $bar = $this->output->createProgressBar($servicePoints->count());
        $bar->start();
        
        $updated = 0;
        
        foreach ($servicePoints as $servicePoint) {
            $parts = $this->parseAddress($servicePoint->address);
            
            if ($parts) {
                $servicePoint->region = $parts['region'];
                $servicePoint->city = $parts['city'];
                $servicePoint->save();
                $updated++;
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine(2);
        
        $this->info("Populated region and city for $updated service points.");
    }
    
    /**
     * Parse address into region and city components
     *
     * @param string $address
     * @return array|null
     */
    private function parseAddress(string $address)
    {
        // Expect format: Region, City, Address
        $pattern1 = '/^([^,]+),\s*([^,]+),\s*(.+)$/';
        
        // Expect format: City, Address
        $pattern2 = '/^([^,]+),\s*(.+)$/';
        
        if (preg_match($pattern1, $address, $matches)) {
            return [
                'region' => trim($matches[1]),
                'city' => trim($matches[2]),
            ];
        } elseif (preg_match($pattern2, $address, $matches)) {
            $city = trim($matches[1]);
            
            // Special handling for major cities
            if (in_array(strtolower($city), ['москва', 'санкт-петербург'])) {
                return [
                    'region' => $city,
                    'city' => $city,
                ];
            }
            
            return [
                'region' => 'Не указано',
                'city' => $city,
            ];
        }
        
        // Default values if can't parse
        return [
            'region' => 'Не указано',
            'city' => 'Не указано',
        ];
    }
}
