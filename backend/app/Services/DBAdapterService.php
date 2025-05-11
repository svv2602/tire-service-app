<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

class DBAdapterService
{
    /**
     * Get the appropriate database connection
     * Always use the default connection (SQLite) for now, since PostgreSQL is not configured correctly
     * 
     * @return \Illuminate\Database\Connection
     */
    public function getConnection()
    {
        // Always use the default connection (SQLite)
        return DB::connection();
    }
    
    /**
     * Get table query builder ensuring compatibility
     * 
     * @param string $table
     * @return \Illuminate\Database\Query\Builder
     */
    public function table($table)
    {
        return $this->getConnection()->table($table);
    }
    
    /**
     * Get service points query builder with compatibility fixes
     * 
     * @param bool $includeInactive Whether to include inactive service points
     * @return \Illuminate\Database\Query\Builder
     */
    public function servicePoints($includeInactive = false)
    {
        $connection = $this->getConnection();
        $query = $connection->table('service_points');
        
        // Add soft delete check if the column exists
        if (Schema::connection($connection->getName())->hasColumn('service_points', 'deleted_at')) {
            $query->whereNull('deleted_at');
        }
        
        // By default, only return active service points
        if (!$includeInactive && Schema::connection($connection->getName())->hasColumn('service_points', 'is_active')) {
            $query->where('is_active', 1);
        }
        
        return $query;
    }
    
    /**
     * Find a service point by ID, ensuring proper type handling
     * 
     * @param mixed $id
     * @return object|null
     */
    public function findServicePoint($id)
    {
        // Convert to integer for consistent comparison
        $intId = (int)$id;
        Log::info('Looking up service point', [
            'original_id' => $id,
            'original_type' => gettype($id),
            'converted_id' => $intId
        ]);
        
        // Use the query builder - always include inactive service points when searching by ID
        return $this->servicePoints(true)
            ->where('id', $intId)
            ->first();
    }
    
    /**
     * Check if a service point exists
     * 
     * @param mixed $id
     * @return bool
     */
    public function servicePointExists($id)
    {
        // Convert to integer for consistent comparison
        $intId = (int)$id;
        
        // Check if it exists - always include inactive service points when checking existence by ID
        return $this->servicePoints(true)
            ->where('id', $intId)
            ->exists();
    }
    
    /**
     * Clean and prepare data for service point operations
     * 
     * @param array $data
     * @return array
     */
    public function prepareServicePointData(array $data)
    {
        $connection = $this->getConnection();
        $result = [];
        
        // Check which columns exist before setting them
        foreach ($data as $key => $value) {
            if (Schema::connection($connection->getName())->hasColumn('service_points', $key)) {
                $result[$key] = $value;
            } else {
                Log::info("Column {$key} doesn't exist in service_points table, skipping");
            }
        }
        
        return $result;
    }
} 