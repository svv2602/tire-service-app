/**
 * Service Point Status Fixer
 * 
 * This script checks and fixes all service points in the database:
 * 1. Ensures all points have is_active=true
 * 2. Normalizes status values to one of: active, suspended, closed
 * 3. Logs information about the fixes applied
 * 
 * Usage: node fix-service-points.js [check|fix]
 * - check: Only check and report issues without making changes (default)
 * - fix: Check and apply fixes to the database
 */

const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:8000';
const API_TOKEN = process.env.API_TOKEN || ''; // Set this if your API requires auth

// Status mapping for backward compatibility
const STATUS_MAPPING = {
  // New status format (English)
  'active': 'active',
  'suspended': 'suspended',
  'closed': 'closed',
  // Legacy Russian status format
  'работает': 'active',
  'приостановлена': 'suspended',
  'закрыта': 'closed',
  // Numeric values
  '0': 'active',
  '1': 'suspended',
  '2': 'closed'
};

// Normalize status to standard format
function normalizeStatus(status) {
  return STATUS_MAPPING[status] || 'active';
}

// Function to check all service points
async function checkServicePoints() {
  try {
    console.log(`\n===== CHECKING ALL SERVICE POINTS =====`);
    
    // Get all service points including inactive ones
    const response = await axios.get(`${API_URL}/api/v2/service-points`, {
      params: { all_statuses: true },
      headers: API_TOKEN ? { 'Authorization': `Bearer ${API_TOKEN}` } : {}
    });
    
    const data = response.data?.data || [];
    console.log(`Found ${data.length} service points\n`);
    
    // Statistics
    let issues = {
      isActiveIssues: 0,
      statusIssues: 0,
      bothIssues: 0,
      noIssues: 0
    };
    
    let statusCounts = {
      active: 0,
      suspended: 0,
      closed: 0,
      other: 0
    };
    
    // Check each point
    for (const point of data) {
      const normalizedStatus = normalizeStatus(point.status);
      const hasStatusIssue = normalizedStatus !== point.status;
      const hasIsActiveIssue = point.is_active !== true;
      
      // Count status types
      if (normalizedStatus === 'active') statusCounts.active++;
      else if (normalizedStatus === 'suspended') statusCounts.suspended++;
      else if (normalizedStatus === 'closed') statusCounts.closed++;
      else statusCounts.other++;
      
      // Count issues
      if (hasStatusIssue && hasIsActiveIssue) issues.bothIssues++;
      else if (hasStatusIssue) issues.statusIssues++;
      else if (hasIsActiveIssue) issues.isActiveIssues++;
      else issues.noIssues++;
      
      // Log issues
      if (hasStatusIssue || hasIsActiveIssue) {
        console.log(`Issue with Point #${point.id} (${point.name})`);
        if (hasStatusIssue) {
          console.log(`  - Status issue: "${point.status}" should be "${normalizedStatus}"`);
        }
        if (hasIsActiveIssue) {
          console.log(`  - is_active issue: ${point.is_active} should be true`);
        }
        console.log('');
      }
    }
    
    // Summary
    console.log(`===== SUMMARY =====`);
    console.log(`Total Points: ${data.length}`);
    console.log(`Status Counts:`);
    console.log(`  - active: ${statusCounts.active}`);
    console.log(`  - suspended: ${statusCounts.suspended}`);
    console.log(`  - closed: ${statusCounts.closed}`);
    console.log(`  - other: ${statusCounts.other}`);
    console.log(`\nIssues Found:`);
    console.log(`  - Points with both issues: ${issues.bothIssues}`);
    console.log(`  - Points with only status issues: ${issues.statusIssues}`);
    console.log(`  - Points with only is_active issues: ${issues.isActiveIssues}`);
    console.log(`  - Points with no issues: ${issues.noIssues}`);
    
    return {
      points: data,
      issues
    };
  } catch (error) {
    console.error('Error checking service points:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Function to fix a service point
async function fixServicePoint(point) {
  try {
    const normalizedStatus = normalizeStatus(point.status);
    const needsFix = normalizedStatus !== point.status || point.is_active !== true;
    
    if (!needsFix) {
      return { id: point.id, fixed: false, message: 'No issues' };
    }
    
    console.log(`Fixing Point #${point.id} (${point.name})...`);
    
    // Prepare data for update
    const updateData = {
      status: normalizedStatus,
      is_active: true
    };
    
    // Update the point
    const response = await axios.put(
      `${API_URL}/api/v2/service-points/${point.id}`, 
      updateData,
      {
        headers: API_TOKEN ? { 
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        } : {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    const updatedPoint = response.data?.data || response.data;
    
    // Check if fix was successful
    const success = updatedPoint.status === normalizedStatus && updatedPoint.is_active === true;
    
    if (success) {
      console.log(`  ✅ Fixed successfully`);
      if (point.status !== normalizedStatus) {
        console.log(`  - Status changed: "${point.status}" → "${normalizedStatus}"`);
      }
      if (point.is_active !== true) {
        console.log(`  - is_active changed: ${point.is_active} → true`);
      }
    } else {
      console.log(`  ❌ Fix failed`);
      console.log(`  - Returned status: "${updatedPoint.status}"`);
      console.log(`  - Returned is_active: ${updatedPoint.is_active}`);
    }
    
    return { 
      id: point.id, 
      fixed: success, 
      beforeStatus: point.status,
      afterStatus: updatedPoint.status,
      beforeIsActive: point.is_active,
      afterIsActive: updatedPoint.is_active,
      message: success ? 'Fixed successfully' : 'Fix failed'
    };
  } catch (error) {
    console.error(`Error fixing Point #${point.id}:`, error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return { 
      id: point.id, 
      fixed: false, 
      error: error.message,
      message: 'Error during fix' 
    };
  }
}

// Function to fix all service points
async function fixAllServicePoints() {
  const { points, issues } = await checkServicePoints();
  
  if (issues.isActiveIssues === 0 && issues.statusIssues === 0 && issues.bothIssues === 0) {
    console.log('\n✅ All service points are correctly configured! No fixes needed.');
    return;
  }
  
  console.log('\n===== FIXING SERVICE POINTS =====');
  
  // Ask for confirmation before proceeding with fixes
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(`Do you want to fix ${issues.isActiveIssues + issues.statusIssues + issues.bothIssues} service points? (y/n) `, async (answer) => {
      rl.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('Fix operation cancelled.');
        resolve();
        return;
      }
      
      console.log('Starting fix operation...\n');
      
      const results = {
        success: 0,
        failed: 0,
        details: []
      };
      
      // Fix each point with issues
      for (const point of points) {
        const normalizedStatus = normalizeStatus(point.status);
        const needsFix = normalizedStatus !== point.status || point.is_active !== true;
        
        if (needsFix) {
          const result = await fixServicePoint(point);
          results.details.push(result);
          
          if (result.fixed) {
            results.success++;
          } else {
            results.failed++;
          }
          
          // Small delay between requests to avoid overwhelming the server
          await new Promise(r => setTimeout(r, 500));
        }
      }
      
      // Final summary
      console.log('\n===== FIX SUMMARY =====');
      console.log(`Total points processed: ${results.success + results.failed}`);
      console.log(`Successfully fixed: ${results.success}`);
      console.log(`Failed to fix: ${results.failed}`);
      
      resolve(results);
    });
  });
}

// Main function
async function main() {
  console.log('SERVICE POINT FIXER');
  console.log('==================');
  console.log(`API URL: ${API_URL}`);
  console.log(`Mode: ${process.argv[2] || 'check'}`);
  
  if (process.argv[2] === 'fix') {
    await fixAllServicePoints();
  } else {
    await checkServicePoints();
    console.log('\nTo fix issues, run with: node fix-service-points.js fix');
  }
}

// Run the script
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 