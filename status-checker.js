const axios = require('axios');

const API_URL = 'http://localhost:8000';

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

// Function to fetch a service point and examine its properties
async function examineServicePoint(id) {
  try {
    console.log(`\n===== EXAMINING SERVICE POINT #${id} =====`);
    const response = await axios.get(`${API_URL}/api/v2/service-points/${id}`, {
      params: {
        all_statuses: true
      },
      timeout: 10000
    });
    
    const data = response.data?.data || response.data;
    console.log('SUCCESS ✅ Got service point data');
    
    // Normalize status
    const normalizedStatus = normalizeStatus(data.status);
    
    // Detailed examination of the status fields
    console.log('\nSTATUS FIELDS:');
    console.log(`Raw status: "${data.status}" (${typeof data.status})`);
    console.log(`Normalized status: "${normalizedStatus}" (${typeof normalizedStatus})`);
    console.log(`is_active: ${data.is_active} (${typeof data.is_active})`);
    
    if (data.is_active !== true) {
      console.log('⚠️ WARNING: is_active should always be true');
    }
    
    // Status explanation
    console.log('\nSTATUS MEANING:');
    switch(normalizedStatus) {
      case 'active':
        console.log('Point is ACTIVE and serving customers');
        break;
      case 'suspended':
        console.log('Point is SUSPENDED temporarily');
        break;
      case 'closed':
        console.log('Point is CLOSED permanently');
        break;
      default:
        console.log(`Unknown status: ${normalizedStatus}`);
    }
    
    // Full data dump for debugging
    console.log('\nFULL DATA STRUCTURE:');
    console.log(JSON.stringify(data, null, 2));
    
    // Return with normalized status and is_active always true
    return {
      ...data,
      status: normalizedStatus,
      is_active: true
    };
  } catch (error) {
    console.error(`ERROR ❌ Examining service point #${id}`);
    console.error('Status:', error.response?.status);
    console.error('Message:', error.message);
    console.error('Response data:', error.response?.data);
    return null;
  }
}

// Function to attempt updating a service point status
async function testStatusUpdate(id, newStatus) {
  try {
    console.log(`\n===== UPDATING SERVICE POINT #${id} TO "${newStatus}" =====`);
    
    // First check the current status
    const before = await examineServicePoint(id);
    
    console.log(`\nSending status update request with is_active=true...`);
    // Try the update with the status field and is_active=true
    const response = await axios.put(`${API_URL}/api/v2/service-points/${id}`, {
      status: newStatus,
      is_active: true // Always set is_active to true
    }, {
      timeout: 10000
    });
    
    console.log('UPDATE RESPONSE:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    // Check status after update
    console.log('\nChecking service point after update:');
    const after = await examineServicePoint(id);
    
    console.log('\nSTATUS CHANGE SUMMARY:');
    console.log(`Before: status="${before?.status}", is_active=${before?.is_active}`);
    console.log(`After:  status="${after?.status}", is_active=${after?.is_active}`);
    console.log(`Status change: ${before?.status !== after?.status ? '✅' : '❌'}`);
    
    if (after?.is_active !== true) {
      console.log(`⚠️ WARNING: is_active is not true after update (${after?.is_active})`);
    }
    
    return response.data;
  } catch (error) {
    console.error(`ERROR ❌ Updating service point #${id}`);
    console.error('Status:', error.response?.status);
    console.error('Message:', error.message);
    console.error('Response data:', error.response?.data);
    return null;
  }
}

// Execute the tests
async function runTests() {
  // Get service point ID from command line or use default
  const id = process.argv[2] ? parseInt(process.argv[2]) : 1;
  
  // Check if we should run a specific type of test
  const testType = process.argv[3] || 'all';
  
  if (testType === 'examine' || testType === 'all') {
    await examineServicePoint(id);
  }
  
  if (testType === 'status' || testType === 'all') {
    // Test setting to suspended
    await testStatusUpdate(id, 'suspended');
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test setting back to active
    await testStatusUpdate(id, 'active');
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test setting to closed
    await testStatusUpdate(id, 'closed');
  }
}

console.log('SERVICE POINT STATUS DIAGNOSTIC TOOL');
console.log('===================================');
console.log('Usage: node status-checker.js [id] [examine|status|all]');
console.log('Default: Tests all scenarios on service point #1');
console.log('\nNOTE: is_active will ALWAYS be set to true in all operations');

runTests().catch(err => {
  console.error('Unhandled error:', err);
}); 