<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ServicePoint;
use Illuminate\Support\Facades\DB;

class ParseAddressFields extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:parse-address-fields {--force : Force update even if fields are already populated}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Parse address field into region, city and address fields';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting address parsing...');
        
        // Get all service points that need parsing
        $query = ServicePoint::query();
        
        // Skip service points that already have region and city unless --force is used
        if (!$this->option('force')) {
            $query->whereNull('region')->orWhereNull('city');
        }
        
        $servicePoints = $query->get();
        
        $this->info("Found {$servicePoints->count()} service points to process");
        
        $bar = $this->output->createProgressBar($servicePoints->count());
        $bar->start();
        
        $updated = 0;
        $skipped = 0;
        
        foreach ($servicePoints as $servicePoint) {
            // Parse the address field
            $parts = $this->parseAddress($servicePoint->address);
            
            if ($parts) {
                $servicePoint->region = $parts['region'];
                $servicePoint->city = $parts['city'];
                $servicePoint->save();
                $updated++;
            } else {
                $skipped++;
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine(2);
        
        $this->info("Parsing completed:");
        $this->info("- Updated: $updated service points");
        $this->info("- Skipped: $skipped service points");
        
        return Command::SUCCESS;
    }
    
    /**
     * Parse an address string into region, city and address components
     *
     * @param string $address The full address string
     * @return array|null An array with keys 'region', 'city' or null if parsing failed
     */
    private function parseAddress(string $address)
    {
        // Common regions in Russia (you can expand this list)
        $commonRegions = [
            'Москва' => 'г. Москва',
            'Московская область' => 'Московская область',
            'Санкт-Петербург' => 'г. Санкт-Петербург',
            'Ленинградская область' => 'Ленинградская область',
            'Краснодарский край' => 'Краснодарский край',
            'Свердловская область' => 'Свердловская область',
            'Новосибирская область' => 'Новосибирская область',
            'Республика Татарстан' => 'Республика Татарстан',
            'Нижегородская область' => 'Нижегородская область',
            'Челябинская область' => 'Челябинская область',
            'Самарская область' => 'Самарская область',
            'Ростовская область' => 'Ростовская область',
            'Пермский край' => 'Пермский край',
            'Республика Башкортостан' => 'Республика Башкортостан',
            'Воронежская область' => 'Воронежская область',
            'Волгоградская область' => 'Волгоградская область',
            'Красноярский край' => 'Красноярский край',
            'Омская область' => 'Омская область',
            'Тюменская область' => 'Тюменская область',
            'Ставропольский край' => 'Ставропольский край',
            'Саратовская область' => 'Саратовская область',
            'Тульская область' => 'Тульская область',
            'Кемеровская область' => 'Кемеровская область',
            'Иркутская область' => 'Иркутская область',
            'Ярославская область' => 'Ярославская область',
            'Белгородская область' => 'Белгородская область',
            'Калининградская область' => 'Калининградская область',
            'Хабаровский край' => 'Хабаровский край',
            'Владимирская область' => 'Владимирская область',
            'Тверская область' => 'Тверская область',
            'Томская область' => 'Томская область',
            'Ивановская область' => 'Ивановская область',
            'Оренбургская область' => 'Оренбургская область',
            'Приморский край' => 'Приморский край',
            'Рязанская область' => 'Рязанская область',
            'Пензенская область' => 'Пензенская область',
            'Липецкая область' => 'Липецкая область',
            'Астраханская область' => 'Астраханская область',
            'Ульяновская область' => 'Ульяновская область',
        ];
        
        // Default pattern to match the most common Russian address format
        // Expecting format: [Region], [City], [Street Address]
        if (preg_match('/^([^,]+),\s*([^,]+),\s*(.+)$/', $address, $matches)) {
            return [
                'region' => trim($matches[1]),
                'city' => trim($matches[2]),
            ];
        }
        
        // Try to match format: [City], [Street Address]
        if (preg_match('/^([^,]+),\s*(.+)$/', $address, $matches)) {
            $city = trim($matches[1]);
            
            // For major cities like Moscow and St. Petersburg, set both region and city the same
            if (in_array($city, ['Москва', 'Санкт-Петербург'])) {
                return [
                    'region' => "г. $city",
                    'city' => $city,
                ];
            }
            
            return [
                'region' => 'Не указано', // Default "Not specified"
                'city' => $city,
            ];
        }
        
        // Cannot parse the address
        $this->warn("Could not parse address: $address");
        return null;
    }
}
