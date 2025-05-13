import axios from 'axios';

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3008';

// Test direct connectivity with CORS
export const testCorsConnection = async () => {
  try {
    console.log('Testing direct connection to backend...');
    const response = await fetch(`${API_URL}/api/ping`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Ping successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('CORS connectivity test failed:', error);
    return { success: false, error };
  }
};

// Test all required API endpoints
export const testAllEndpoints = async () => {
  const results = {
    ping: { success: false, data: null, error: null },
    servicePoints: { success: false, data: null, error: null },
    regions: { success: false, data: null, error: null },
  };
  
  // Test 1: Ping endpoint
  try {
    console.log('Testing ping endpoint...');
    const pingResponse = await axios.get(`${API_URL}/api/ping`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    results.ping.success = true;
    results.ping.data = pingResponse.data;
  } catch (error: any) {
    console.error('Ping endpoint test failed:', error);
    results.ping.error = error.message;
  }
  
  // Test 2: Service Points endpoint
  try {
    console.log('Testing service points endpoint...');
    const servicePointsResponse = await axios.get(`${API_URL}/api/v2/service-points`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    results.servicePoints.success = true;
    results.servicePoints.data = servicePointsResponse.data;
  } catch (error: any) {
    console.error('Service points endpoint test failed:', error);
    results.servicePoints.error = error.message;
  }
  
  // Test 3: Regions endpoint
  try {
    console.log('Testing regions endpoint...');
    const regionsResponse = await axios.get(`${API_URL}/api/v2/regions`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    results.regions.success = true;
    results.regions.data = regionsResponse.data;
  } catch (error: any) {
    console.error('Regions endpoint test failed:', error);
    results.regions.error = error.message;
  }
  
  return results;
};

// Test with native browser fetch API
export const testWithFetch = async () => {
  try {
    console.log('Testing with native fetch API...');
    const response = await fetch(`${API_URL}/api/v2/service-points`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Fetch successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Native fetch test failed:', error);
    return { success: false, error };
  }
};

// Test with different content types
export const testWithDifferentContentTypes = async () => {
  try {
    console.log('Testing with different content types...');
    const response = await fetch(`${API_URL}/api/v2/service-points`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': '*/*',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Different content type test successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Different content type test failed:', error);
    return { success: false, error };
  }
}; 