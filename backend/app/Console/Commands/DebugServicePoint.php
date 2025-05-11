<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ServicePoint;
use App\Models\Service;
use Illuminate\Support\Facades\DB;

class DebugServicePoint extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'debug:service-point {id? : The ID of the service point to debug} {--deep : Run deep diagnostics}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Debug service point services and attachments';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== Service Point Debug Tool ===');

        // Check if ID is provided
        if ($id = $this->argument('id')) {
            // Debug specific service point
            $this->debugServicePoint($id);
        } else {
            // List all service points
            $this->listServicePoints();
        }
    }

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
        $this->info("\nUse 'php artisan debug:service-point {id}' to debug a specific service point");
    }

    private function debugServicePoint($id)
    {
        $this->info("\nDebugging service point with ID: $id");
        
        // Find the service point
        $servicePoint = ServicePoint::find($id);
        
        if (!$servicePoint) {
            $this->error("Service point with ID $id not found!");
            return;
        }
        
        // Basic info
        $this->info("\n-- Basic Information --");
        $this->line("ID: {$servicePoint->id}");
        $this->line("Name: {$servicePoint->name}");
        $this->line("Partner ID: {$servicePoint->partner_id}");
        $this->line("Is Active: " . ($servicePoint->is_active ? 'Yes' : 'No'));
        
        // Model relationships
        $this->info("\n-- Model Attributes --");
        $this->line("Fillable Attributes: " . implode(', ', $servicePoint->getFillable()));
        
        // Check withPivot in relationship definition
        try {
            $reflection = new \ReflectionMethod($servicePoint, 'services');
            $methodContent = file_get_contents($reflection->getFileName());
            $startLine = $reflection->getStartLine() - 1;
            $endLine = $reflection->getEndLine() - 1;
            $methodSource = implode("\n", array_slice(file($reflection->getFileName()), $startLine, $endLine - $startLine + 1));
            
            $this->info("\n-- Relationship Definition Check --");
            $this->line("services() method definition:");
            $this->line($methodSource);
            
            $hasWithPivot = str_contains($methodSource, 'withPivot');
            $this->line("\nIncludes withPivot?: " . ($hasWithPivot ? '<fg=green>Yes</>' : '<fg=red>No</>'));
            
            if ($hasWithPivot) {
                $hasCommentPivot = str_contains($methodSource, 'comment');
                $this->line("Includes 'comment' in withPivot?: " . ($hasCommentPivot ? '<fg=green>Yes</>' : '<fg=red>No</>'));
            }
        } catch (\Exception $e) {
            $this->error("Failed to analyze relationship definition: " . $e->getMessage());
        }
        
        // Debug attached services
        $this->info("\n-- Attached Services --");
        $services = $servicePoint->services;
        
        if ($services->isEmpty()) {
            $this->warn("No services attached to this service point");
        } else {
            $this->line("Service count: " . $services->count());
            
            $headers = ['ID', 'Name', 'Comment'];
            $rows = [];
            
            foreach ($services as $service) {
                $rows[] = [
                    $service->id,
                    $service->name,
                    $service->pivot->comment ?? '<empty>'
                ];
            }
            
            $this->table($headers, $rows);
        }
        
        // Direct database query
        $this->info("\n-- Raw Pivot Table Data --");
        $pivotData = DB::table('service_point_services')
            ->where('service_point_id', $servicePoint->id)
            ->get();
            
        if ($pivotData->isEmpty()) {
            $this->warn("No records found in pivot table for this service point");
        } else {
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
        
        // Check if deep diagnostics was requested
        if ($this->option('deep')) {
            $this->runDeepDiagnostics($servicePoint);
        }
    }
    
    private function runDeepDiagnostics($servicePoint)
    {
        $this->info("\n== DEEP DIAGNOSTICS ==");
        
        // Test direct attachment
        $this->info("\n-- Testing Direct Service Attachment --");
        
        // Get a service that's not already attached
        $existingServiceIds = $servicePoint->services->pluck('id')->toArray();
        $service = Service::whereNotIn('id', $existingServiceIds)->first();
        
        if (!$service) {
            $this->warn("No available service for testing attachment");
            return;
        }
        
        $this->line("Testing with service: ID={$service->id}, Name={$service->name}");
        
        // Record count before
        $beforeCount = DB::table('service_point_services')
            ->where('service_point_id', $servicePoint->id)
            ->count();
        $this->line("Pivot records before: $beforeCount");
        
        // Test attaching with comment
        $testComment = "Test comment at " . now()->toDateTimeString();
        $this->line("Attaching service with comment: '$testComment'");
        
        try {
            // Try to attach
            $servicePoint->services()->attach($service->id, ['comment' => $testComment]);
            $this->info("<fg=green>Successfully attached service</>");
            
            // Verify the attachment
            $afterCount = DB::table('service_point_services')
                ->where('service_point_id', $servicePoint->id)
                ->count();
            $this->line("Pivot records after: $afterCount");
            
            // Check if record was created
            if ($afterCount > $beforeCount) {
                $this->info("<fg=green>Record count increased - attachment successful</>");
            } else {
                $this->error("Record count did not change! Attachment may have failed");
            }
            
            // Check if comment was saved
            $pivotRecord = DB::table('service_point_services')
                ->where('service_point_id', $servicePoint->id)
                ->where('service_id', $service->id)
                ->first();
                
            if ($pivotRecord) {
                $this->line("Saved comment: " . ($pivotRecord->comment ?? '<empty>'));
                $commentSaved = $pivotRecord->comment === $testComment;
                $this->line("Comment saved correctly?: " . ($commentSaved ? '<fg=green>Yes</>' : '<fg=red>No</>'));
            }
            
            // Clean up
            $this->line("\nCleaning up test data...");
            $servicePoint->services()->detach($service->id);
            $this->info("Test service detached");
            
        } catch (\Exception $e) {
            $this->error("Exception during service attachment test: " . $e->getMessage());
        }
    }
}
