<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ServicePoint;
use App\Models\Service;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FixServicePointData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fix:service-point-data {id? : The ID of the service point to fix} {--all : Fix all service points}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix service point relationships and ensure services are correctly attached';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== Service Point Relationship Repair Tool ===');

        if ($id = $this->argument('id')) {
            $this->fixServicePoint($id);
        } elseif ($this->option('all')) {
            $this->fixAllServicePoints();
        } else {
            $this->info('Please specify either a service point ID or use --all to fix all service points.');
            $this->listServicePoints();
        }
    }

    /**
     * List all service points for user reference
     */
    private function listServicePoints()
    {
        $this->info("\nListing all service points:");
        
        $servicePoints = ServicePoint::all();
        
        if ($servicePoints->isEmpty()) {
            $this->error('No service points found in the database!');
            return;
        }
        
        $headers = ['ID', 'Name', 'Partner ID', 'Services Count', 'Status'];
        $rows = [];
        
        foreach ($servicePoints as $point) {
            $rows[] = [
                $point->id,
                $point->name,
                $point->partner_id,
                $point->services()->count(),
                $point->is_active ? 'Active' : 'Inactive'
            ];
        }
        
        $this->table($headers, $rows);
        $this->info("\nUsage examples:");
        $this->line("- Fix specific service point: php artisan fix:service-point-data 1");
        $this->line("- Fix all service points: php artisan fix:service-point-data --all");
    }

    /**
     * Fix a specific service point
     */
    private function fixServicePoint($id)
    {
        $this->info("\nFIXING SERVICE POINT #$id");
        
        // Find the service point
        $servicePoint = ServicePoint::find($id);
        
        if (!$servicePoint) {
            $this->error("Service point with ID $id not found!");
            return;
        }
        
        $this->info("Found service point: " . $servicePoint->name);
        
        // Step 1: Check for raw data in the database
        $this->info("\nStep 1: Checking pivot table data...");
        $pivotData = DB::table('service_point_services')
            ->where('service_point_id', $servicePoint->id)
            ->get();
            
        if ($pivotData->isEmpty()) {
            $this->warn("No service relationships found in pivot table.");
            
            // Check if we should create some test data
            if ($this->confirm('Would you like to add a test service to this service point?')) {
                $this->addTestService($servicePoint);
            }
            
            return;
        } else {
            $this->info("Found " . $pivotData->count() . " service relationships in pivot table.");
            
            // Display the pivot data
            $headers = ['service_point_id', 'service_id', 'comment', 'created_at', 'updated_at'];
            $rows = [];
            
            foreach ($pivotData as $record) {
                $row = [];
                foreach ($headers as $field) {
                    $row[] = property_exists($record, $field) ? $record->$field : 'N/A';
                }
                $rows[] = $row;
            }
            
            $this->table($headers, $rows);
        }
        
        // Step 2: Check if the services are being loaded correctly
        $this->info("\nStep 2: Testing relationship loading...");
        $loadedServices = $servicePoint->services;
        
        if ($loadedServices->isEmpty()) {
            $this->error("Services relationship is not loading properly!");
            $this->info("This suggests an issue with the relationship definition or eager loading.");
            
            // Check if we need to repair the relationship
            if ($this->confirm('Would you like to attempt to repair the relationship?')) {
                $this->repairServicePointRelationship($servicePoint, $pivotData);
            }
            
            return;
        } else {
            $this->info("<fg=green>Success!</> Services loaded correctly: " . $loadedServices->count() . " services found.");
            
            // Display the services that were loaded
            $headers = ['ID', 'Name', 'Comment'];
            $rows = [];
            
            foreach ($loadedServices as $service) {
                $rows[] = [
                    $service->id,
                    $service->name,
                    $service->pivot->comment ?? '<empty>'
                ];
            }
            
            $this->table($headers, $rows);
        }
        
        // Step 3: Verify and repair any inconsistencies
        $this->info("\nStep 3: Verifying data consistency...");
        $this->verifyServiceData($servicePoint, $pivotData, $loadedServices);
    }

    /**
     * Fix all service points
     */
    private function fixAllServicePoints()
    {
        $this->info("\nFIXING ALL SERVICE POINTS");
        
        $servicePoints = ServicePoint::all();
        
        if ($servicePoints->isEmpty()) {
            $this->error('No service points found in the database!');
            return;
        }
        
        $this->info("Found " . $servicePoints->count() . " service points. Processing each one...\n");
        
        $bar = $this->output->createProgressBar($servicePoints->count());
        $bar->start();
        
        $results = [];
        
        foreach ($servicePoints as $servicePoint) {
            // Check pivot table data
            $pivotData = DB::table('service_point_services')
                ->where('service_point_id', $servicePoint->id)
                ->get();
                
            $loadedServices = $servicePoint->services;
            
            // Simple check if the counts match
            $pivotCount = $pivotData->count();
            $loadedCount = $loadedServices->count();
            
            $status = 'OK';
            
            if ($pivotCount !== $loadedCount) {
                $status = 'FIXED';
                $this->repairServicePointRelationship($servicePoint, $pivotData, false);
            }
            
            $results[] = [
                $servicePoint->id,
                $servicePoint->name,
                $pivotCount,
                $loadedCount,
                $status
            ];
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->line("\n");
        
        // Show results
        $this->info("\nFix results:");
        $this->table(['ID', 'Name', 'Pivot Records', 'Loaded Services', 'Status'], $results);
    }

    /**
     * Verify service data consistency and repair if needed
     */
    private function verifyServiceData($servicePoint, $pivotData, $loadedServices)
    {
        // Compare the counts
        $pivotCount = $pivotData->count();
        $loadedCount = $loadedServices->count();
        
        if ($pivotCount !== $loadedCount) {
            $this->error("Data inconsistency: Pivot table has $pivotCount records, but relationship loaded $loadedCount services!");
            
            if ($this->confirm('Would you like to repair this inconsistency?')) {
                $this->repairServicePointRelationship($servicePoint, $pivotData);
            }
            
            return;
        }
        
        // Compare the specific services and comments
        $mismatches = [];
        
        foreach ($pivotData as $pivotRecord) {
            $serviceId = $pivotRecord->service_id;
            
            // Find this service in the loaded services
            $loadedService = $loadedServices->firstWhere('id', $serviceId);
            
            if (!$loadedService) {
                $mismatches[] = [
                    'service_id' => $serviceId,
                    'issue' => 'Service exists in pivot table but not loaded in relationship',
                    'pivot_comment' => $pivotRecord->comment ?? null
                ];
                continue;
            }
            
            // Compare comments
            $pivotComment = $pivotRecord->comment;
            $loadedComment = $loadedService->pivot->comment;
            
            if ($pivotComment !== $loadedComment) {
                $mismatches[] = [
                    'service_id' => $serviceId,
                    'issue' => 'Comment mismatch',
                    'pivot_comment' => $pivotComment,
                    'loaded_comment' => $loadedComment
                ];
            }
        }
        
        if (count($mismatches) > 0) {
            $this->error("Found " . count($mismatches) . " mismatches in service data!");
            
            foreach ($mismatches as $mismatch) {
                $this->line("\nMismatch for Service ID: " . $mismatch['service_id']);
                $this->line("Issue: " . $mismatch['issue']);
                
                if (isset($mismatch['pivot_comment'])) {
                    $this->line("Pivot Comment: " . ($mismatch['pivot_comment'] ?? '<null>'));
                }
                
                if (isset($mismatch['loaded_comment'])) {
                    $this->line("Loaded Comment: " . ($mismatch['loaded_comment'] ?? '<null>'));
                }
            }
            
            if ($this->confirm('Would you like to repair these mismatches?')) {
                $this->repairServicePointRelationship($servicePoint, $pivotData);
            }
            
            return;
        }
        
        $this->info("<fg=green>All service data is consistent!</> No issues found.");
    }

    /**
     * Repair service point relationships
     */
    private function repairServicePointRelationship($servicePoint, $pivotData, $verbose = true)
    {
        if ($verbose) {
            $this->info("\nRepairing service point relationship...");
        }
        
        try {
            // Start a transaction to ensure all operations succeed or fail together
            DB::beginTransaction();
            
            // Step 1: Detach all services
            $servicePoint->services()->detach();
            
            if ($verbose) {
                $this->info("Detached all existing services.");
            }
            
            // Step 2: Re-attach all services with their comments
            foreach ($pivotData as $record) {
                $serviceId = $record->service_id;
                $comment = $record->comment;
                
                // Ensure the service exists
                $service = Service::find($serviceId);
                if (!$service) {
                    if ($verbose) {
                        $this->warn("Service ID $serviceId not found - skipping.");
                    }
                    continue;
                }
                
                // Attach with the original comment
                $servicePoint->services()->attach($serviceId, [
                    'comment' => $comment,
                    'created_at' => $record->created_at,
                    'updated_at' => now()
                ]);
                
                if ($verbose) {
                    $this->info("Re-attached service ID $serviceId with comment: " . ($comment ?? '<null>'));
                }
            }
            
            // Commit the transaction
            DB::commit();
            
            if ($verbose) {
                $this->info("<fg=green>Repair completed successfully!</>");
                
                // Verify the fix
                $this->info("\nVerifying fix...");
                $reloadedServices = $servicePoint->fresh()->services;
                $this->info("Services loaded after fix: " . $reloadedServices->count());
                
                // Display the services that were loaded
                $headers = ['ID', 'Name', 'Comment'];
                $rows = [];
                
                foreach ($reloadedServices as $service) {
                    $rows[] = [
                        $service->id,
                        $service->name,
                        $service->pivot->comment ?? '<empty>'
                    ];
                }
                
                $this->table($headers, $rows);
            }
            
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollBack();
            
            if ($verbose) {
                $this->error("Error during repair: " . $e->getMessage());
            }
            
            // Log the error for debugging
            Log::error("Error repairing service point #{$servicePoint->id}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Add a test service to a service point
     */
    private function addTestService($servicePoint)
    {
        $this->info("\nAdding a test service to service point #{$servicePoint->id}...");
        
        // Find a service that's not already attached
        $existingServiceIds = $servicePoint->services->pluck('id')->toArray();
        $service = Service::whereNotIn('id', $existingServiceIds)->first();
        
        if (!$service) {
            $this->error("No available services found to add.");
            return;
        }
        
        $this->info("Selected service: ID={$service->id}, Name={$service->name}");
        
        $testComment = "Test comment added at " . now()->toDateTimeString();
        
        try {
            // Attach the service with a comment
            $servicePoint->services()->attach($service->id, ['comment' => $testComment]);
            
            $this->info("<fg=green>Service attached successfully!</>");
            
            // Verify the attachment
            $this->info("\nVerifying attachment...");
            $reloadedServicePoint = ServicePoint::find($servicePoint->id);
            $reloadedServices = $reloadedServicePoint->services;
            
            $attachedService = $reloadedServices->firstWhere('id', $service->id);
            
            if ($attachedService) {
                $this->info("<fg=green>Service found in relationship after attachment!</>");
                $this->line("Comment value: " . ($attachedService->pivot->comment ?? '<empty>'));
            } else {
                $this->error("Service was not found in relationship after attachment!");
                
                // Check the pivot table directly
                $pivotRecord = DB::table('service_point_services')
                    ->where('service_point_id', $servicePoint->id)
                    ->where('service_id', $service->id)
                    ->first();
                    
                if ($pivotRecord) {
                    $this->info("Found record in pivot table:");
                    $this->line("service_point_id: " . $pivotRecord->service_point_id);
                    $this->line("service_id: " . $pivotRecord->service_id);
                    $this->line("comment: " . ($pivotRecord->comment ?? '<null>'));
                } else {
                    $this->error("No record found in pivot table either!");
                }
            }
            
        } catch (\Exception $e) {
            $this->error("Error adding test service: " . $e->getMessage());
        }
    }
}
