import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import { simpleFetch } from '../../utils/simpleFetch';
import minimalApiClient from '../../utils/minimalApiClient';

export interface Service {
  id: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

interface ServicesState {
  items: Service[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ServicesState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchServices = createAsyncThunk(
  'services/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching services with minimal API client');
      
      try {
        // Try with minimal API client - most reliable approach
        const servicesData = await minimalApiClient.get<Service[]>('/api/services');
        
        console.log(`Found ${servicesData.length} services via minimal API client`);
        
        // Sort services by name
        servicesData.sort((a: Service, b: Service) => a.name.localeCompare(b.name));
        
        return servicesData;
      } catch (minimalError) {
        console.error('Error with minimal API client for services, trying axios:', minimalError);
        
        // First try with axios instance
        try {
          const response = await axios.get('/api/services');
          console.log('Services API response from axios:', response.data);
          
          // Extract data based on response format
          let servicesData = [];
          if (response.data && response.data.data) {
            console.log('Using response.data.data format');
            servicesData = response.data.data;
          } else if (response.data && response.data.status === 'success' && response.data.data) {
            console.log('Using response.data.status.data format');
            servicesData = response.data.data;
          } else if (Array.isArray(response.data)) {
            console.log('Using direct array format');
            servicesData = response.data;
          } else {
            throw new Error('Unexpected API response format');
          }
          
          console.log(`Found ${servicesData.length} services from axios`);
          
          // Sort services by name
          servicesData.sort((a: Service, b: Service) => a.name.localeCompare(b.name));
          
          return servicesData;
        } catch (axiosError) {
          console.error('Error with axios, trying direct fetch:', axiosError);
          
          // Try with simplified fetch utility
          try {
            const data = await simpleFetch<any>('/api/services');
            const servicesData = data.data || [];
            
            console.log(`Found ${servicesData.length} services from simpleFetch`);
            
            // Sort services by name
            servicesData.sort((a: Service, b: Service) => a.name.localeCompare(b.name));
            
            return servicesData;
          } catch (fetchError) {
            console.error('All fetch attempts failed. Last error:', fetchError);
            throw fetchError;
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch services:', error);
      return rejectWithValue(error.message || 'Failed to fetch services');
    }
  }
);

export const createService = createAsyncThunk(
  'services/create',
  async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/services', service);
      
      // Handle different API response formats
      const serviceData = response.data.data || response.data;
      
      return serviceData;
    } catch (error: any) {
      console.error('Failed to create service:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create service');
    }
  }
);

export const updateService = createAsyncThunk(
  'services/update',
  async ({ id, data }: { id: number; data: Partial<Service> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/services/${id}`, data);
      
      // Handle different API response formats
      const serviceData = response.data.data || response.data;
      
      return serviceData;
    } catch (error: any) {
      console.error('Failed to update service:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update service');
    }
  }
);

export const deleteService = createAsyncThunk(
  'services/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/services/${id}`);
      return id;
    } catch (error: any) {
      console.error('Failed to delete service:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete service');
    }
  }
);

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch services';
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.items.push(action.payload);
        // Re-sort the array after adding a new item
        state.items.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(updateService.fulfilled, (state, action) => {
        const index = state.items.findIndex(service => service.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        // Re-sort the array after updating an item
        state.items.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.items = state.items.filter(service => service.id !== action.payload);
      });
  },
});

export default servicesSlice.reducer; 