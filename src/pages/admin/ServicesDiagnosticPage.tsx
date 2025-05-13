import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Button, CircularProgress, Paper, Divider, 
  Table, TableHead, TableRow, TableCell, TableBody, Alert 
} from '@mui/material';
import axios from '../../utils/axios';

interface Service {
  id: number;
  name: string;
  description?: string;
  status: string;
}

interface ServicePoint {
  id: number;
  name: string;
  services: Service[];
  service_comments: {
    service_id: number;
    comment?: string;
  }[];
}

const ServicesDiagnosticPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [diagnosticResults, setDiagnosticResults] = useState<string[]>([]);

  // Fetch services and service points
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setDiagnosticResults([]);

    try {
      // Fetch services
      const servicesResponse = await axios.get('/api/services');
      const servicesData = servicesResponse.data.data || [];
      setServices(servicesData);      // Fetch service points
      const servicePointsResponse = await axios.get('/api/v2/service-points');
      const servicePointsData = servicePointsResponse.data.data || [];
      setServicePoints(servicePointsData);

      // Initial diagnostics
      const diagnostics = [];
      diagnostics.push(`Found ${servicesData.length} services`);
      diagnostics.push(`Found ${servicePointsData.length} service points`);

      // Check each service point
      for (const sp of servicePointsData) {
        const serviceIds = sp.services?.map((s: any) => typeof s === 'number' ? s : s.id) || [];
        const serviceComments = sp.service_comments || [];
        
        // Check for inconsistencies
        if (serviceIds.length !== serviceComments.length) {
          diagnostics.push(`⚠️ Service point ${sp.id} (${sp.name}): services array (${serviceIds.length}) and service_comments (${serviceComments.length}) have different lengths`);
        }
        
        if (!Array.isArray(serviceComments)) {
          diagnostics.push(`❌ Service point ${sp.id} (${sp.name}): service_comments is not an array`);
        }
      }

      setDiagnosticResults(diagnostics);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  // Test update functionality for a service point
  const testServicePoint = async (servicePointId: number) => {
    try {
      setDiagnosticResults(prev => [...prev, `Testing service point ${servicePointId}...`]);
      
      // Get a service to add
      if (services.length === 0) {
        setDiagnosticResults(prev => [...prev, `❌ No services available to test with`]);
        return;
      }
      
      const testService = services[0];
      setDiagnosticResults(prev => [...prev, `Using service ${testService.id} (${testService.name}) for test`]);
      
      // Create test comment
      const testComment = `Test comment at ${new Date().toISOString()}`;
      
      // Create test payload
      const payload = {
        service_comments: [{ service_id: testService.id, comment: testComment }],
        services: [testService.id]
      };
      
      setDiagnosticResults(prev => [...prev, `Sending test payload: ${JSON.stringify(payload)}`]);
      
    // Make API call
      const response = await axios.put(`/api/v2/service-points/${servicePointId}`, payload);
      
      setDiagnosticResults(prev => [...prev, `API response status: ${response.status}`]);
      setDiagnosticResults(prev => [...prev, `API response data: ${JSON.stringify(response.data)}`]);
      
      // Check debug endpoint to verify data was saved
      setDiagnosticResults(prev => [...prev, `Checking debug endpoint...`]);
      const debugResponse = await axios.get(`/api/v2/debug/service-point/${servicePointId}`);
      
      const debugData = debugResponse.data.data;
      setDiagnosticResults(prev => [...prev, `Debug endpoint response: ${JSON.stringify(debugData.service_comments)}`]);
      
      // Check if our test comment was saved
      const savedComment = debugData.service_comments.find((sc: any) => sc.service_id === testService.id);
      if (savedComment) {
        if (savedComment.comment === testComment) {
          setDiagnosticResults(prev => [...prev, `✅ TEST PASSED: Comment was saved correctly!`]);
        } else {
          setDiagnosticResults(prev => [
            ...prev, 
            `❌ TEST FAILED: Comment was not saved correctly!`,
            `Expected: ${testComment}`,
            `Actual: ${savedComment.comment}`
          ]);
        }
      } else {
        setDiagnosticResults(prev => [...prev, `❌ TEST FAILED: Service was not found in service_comments!`]);
      }
      
      // Refresh data
      fetchData();
      
    } catch (error: any) {
      console.error('Error testing service point:', error);
      setDiagnosticResults(prev => [...prev, `❌ ERROR: ${error.message}`]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Services Diagnostic Tool
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={fetchData}
          disabled={isLoading}
        >
          Refresh Data
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Services ({services.length})
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map(service => (
                  <TableRow key={service.id}>
                    <TableCell>{service.id}</TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.description || '-'}</TableCell>
                    <TableCell>{service.status === 'работает' ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Service Points ({servicePoints.length})
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Services Count</TableCell>
                  <TableCell>Service Comments Count</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {servicePoints.map(sp => (
                  <TableRow key={sp.id}>
                    <TableCell>{sp.id}</TableCell>
                    <TableCell>{sp.name}</TableCell>
                    <TableCell>{sp.services?.length || 0}</TableCell>
                    <TableCell>{sp.service_comments?.length || 0}</TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => testServicePoint(sp.id)}
                      >
                        Test
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Diagnostic Results
            </Typography>
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {diagnosticResults.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
              {diagnosticResults.length === 0 && 'No diagnostic results yet.'}
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default ServicesDiagnosticPage; 