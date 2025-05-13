const axios = require('axios');

// Использование правильного URL для API
const API_URL = 'http://localhost:8000';

// Test both endpoint versions
async function testEndpoints() {
  console.log('Testing API endpoints for service points...');
  
  try {
    console.log('Attempt 1: Testing /api/service-points with include_inactive=true');
    const response1 = await axios.get(`${API_URL}/api/service-points`, {
      params: { 
        include_inactive: true,
        all_statuses: true
      },
      timeout: 10000
    });
    console.log('SUCCESS ✅ /api/service-points');
    console.log('Status:', response1.status);
    console.log('Data count:', response1.data?.data?.length || 'No data object');
  } catch (error) {
    console.error('ERROR ❌ /api/service-points');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.message);
    console.error('Response data:', error.response?.data);
  }

  try {
    console.log('\nAttempt 2: Testing /api/v2/service-points with include_inactive=true');
    const response2 = await axios.get(`${API_URL}/api/v2/service-points`, {
      params: { 
        include_inactive: true,
        all_statuses: true
      },
      timeout: 10000
    });
    console.log('SUCCESS ✅ /api/v2/service-points');
    console.log('Status:', response2.status);
    console.log('Data count:', response2.data?.data?.length || 'No data object');
  } catch (error) {
    console.error('ERROR ❌ /api/v2/service-points');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.message);
    console.error('Response data:', error.response?.data);
  }

  // Test specific endpoint for updating service point status
  const testId = 1; // Use a real ID that exists in your system
  
  try {
    console.log('\nAttempt 3: Testing PUT to /api/service-points/{id} to update status');
    const response3 = await axios.put(`${API_URL}/api/service-points/${testId}`, {
      status: 'работает'
    }, {
      timeout: 10000
    });
    console.log('SUCCESS ✅ PUT /api/service-points/${testId}');
    console.log('Status:', response3.status);
    console.log('Updated data:', response3.data);
  } catch (error) {
    console.error('ERROR ❌ PUT /api/service-points/${testId}');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.message);
    console.error('Response data:', error.response?.data);
  }

  try {
    console.log('\nAttempt 4: Testing PUT to /api/v2/service-points/{id} to update status');
    const response4 = await axios.put(`${API_URL}/api/v2/service-points/${testId}`, {
      status: 'работает'
    }, {
      timeout: 10000
    });
    console.log('SUCCESS ✅ PUT /api/v2/service-points/${testId}');
    console.log('Status:', response4.status);
    console.log('Updated data:', response4.data);
  } catch (error) {
    console.error('ERROR ❌ PUT /api/v2/service-points/${testId}');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.message);
    console.error('Response data:', error.response?.data);
  }
}

testEndpoints(); 