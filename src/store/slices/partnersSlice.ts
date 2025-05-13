import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import { simpleFetch } from '../../utils/simpleFetch';
import minimalApiClient from '../../utils/minimalApiClient';
// Импортируем directApiClient для прямого доступа к API
import directApiClient from '../../utils/directApi';

export interface Partner {
  id: number;
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  company_name?: string; // Some API responses use snake_case
  contact_person?: string; // Added for API compatibility
  address?: string; // Added to match PartnersPage form
  created_at?: string;
  updated_at?: string;
  servicePoints?: any[];
  status?: 'active' | 'inactive';
}

interface PartnersState {
  items: Partner[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PartnersState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchPartners = createAsyncThunk(
  'partners/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching partners with direct API client');
      
      try {
        // Пробуем с прямым доступом к бэкенду - обходим проблемы с прокси
        const response = await directApiClient.get('/api/partners');
        console.log('Direct API response:', response.data);
        const partners = response.data?.partners || [];
        
        console.log(`Fetched ${partners.length} partners with direct API`);
        return partners;
      } catch (directError) {
        console.error('Error with direct API client, trying minimal API client:', directError);
      
        try {
          // Try with minimal API client as fallback
          const partners = await minimalApiClient.get<Partner[]>('/api/partners');
          
          console.log(`Fetched ${partners.length} partners`);
          return partners;
        } catch (minimalError) {
          console.error('Error with minimal API client for partners, trying axios:', minimalError);
          
          try {
            // Fall back to axios if needed
            const response = await axios.get('/api/partners');
            const partners = response.data?.data || [];
            
            console.log(`Fetched ${partners.length} partners with axios`);
            return partners;
          } catch (axiosError) {
            console.error('Error fetching partners with axios, trying direct fetch:', axiosError);
            
            // Fall back to simplified fetch as a last resort
            try {
              const data = await simpleFetch<any>('/api/partners');
              return data.data || [];
            } catch (fetchError) {
              console.error('All API attempts failed:', fetchError);
              throw fetchError;
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching partners:', error);
      return rejectWithValue(error.message || 'Failed to fetch partners');
    }
  }
);

export const updatePartnerStatus = createAsyncThunk(
  'partners/updateStatus',
  async ({ id, status }: { id: number; status: Partner['status'] }, { rejectWithValue }) => {
    try {
      // Use PATCH endpoint that's handled by the controller's update method
      const response = await directApiClient.patch(`/api/partners/${id}`, { status: status });
      
      // Log the response for debugging
      console.log('updatePartnerStatus response:', response.data);
      
      // Check if the response has a partner property (new API format)
      if (response.data.partner) {
        return response.data.partner;
      }
      // If it's directly the data property (another API format)
      if (response.data.data) {
        return response.data.data;
      }
      // Default to the response data directly if none of the above formats match
      return response.data;
    } catch (error: any) {
      console.error('Error updating partner status:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Ошибка при обновлении статуса партнера');
    }
  }
);

export const createPartner = createAsyncThunk(
  'partners/create',
  async (partner: Omit<Partner, 'id'>, { rejectWithValue }) => {
    try {
      const response = await directApiClient.post('/api/partners', partner);
      
      // Check if the response has a data property containing the created partner
      if (response.data.data) {
        return response.data.data;
      }
      // Check if the response has a partner property
      if (response.data.partner) {
        return response.data.partner;
      }
      // If it has an id, it's likely the partner object directly
      if (response.data.id) {
        return response.data;
      }
      
      // Log unexpected response and return an empty object to avoid errors
      console.error('Unexpected response format from createPartner:', response.data);
      return {};
    } catch (error: any) {
      console.error('Error creating partner:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Ошибка при создании партнера');
    }
  }
);

export const updatePartner = createAsyncThunk(
  'partners/update',
  async ({ id, data }: { id: number; data: Partial<Partner> }, { rejectWithValue }) => {
    try {
      const response = await directApiClient.put(`/api/partners/${id}`, data);
      
      // Check if the response has a partner property
      if (response.data.partner) {
        return response.data.partner;
      }
      // Check if the response has a data property
      if (response.data.data) {
        return response.data.data;
      }
      // If it has an id, it's likely the partner object directly
      if (response.data.id) {
        return response.data;
      }
      
      // Default to the entire response data if we can't identify the structure
      console.log('Using default response format for updatePartner:', response.data);
      return { id, ...data, ...response.data };
    } catch (error: any) {
      console.error('Error updating partner:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Ошибка при обновлении партнера');
    }
  }
);

export const deletePartner = createAsyncThunk(
  'partners/delete',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      const response = await directApiClient.delete(`/api/partners/${id}`);
      
      // Log success message and deleted service points count if available
      console.log('Partner deleted successfully', {
        id,
        deletedServicePointsCount: response?.data?.deleted_service_points_count || 0
      });
      
      if (response?.data?.deleted_service_points_count) {
        // If service points were deleted on the backend, refresh the service points
        dispatch({ type: 'servicePoints/refreshRequested' });
      }
      
      return id;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Ошибка при удалении партнера';
      return rejectWithValue(errorMessage);
    }
  }
);

const partnersSlice = createSlice({
  name: 'partners',
  initialState,
  reducers: {
    clearPartnersError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchPartners
      .addCase(fetchPartners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPartners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchPartners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || action.error.message || 'Ошибка загрузки партнеров';
      })
      
      // Обработка updatePartnerStatus
      .addCase(updatePartnerStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePartnerStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(partner => partner.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updatePartnerStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || action.error.message || 'Ошибка обновления статуса партнера';
      })
      
      // Обработка createPartner
      .addCase(createPartner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPartner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.push(action.payload);
      })
      .addCase(createPartner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || action.error.message || 'Ошибка создания партнера';
      })
      
      // Обработка updatePartner
      .addCase(updatePartner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePartner.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(partner => partner.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updatePartner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || action.error.message || 'Ошибка обновления партнера';
      })
      
      // Обработка deletePartner
      .addCase(deletePartner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePartner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter(partner => partner.id !== action.payload);
      })
      .addCase(deletePartner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || action.error.message || 'Ошибка удаления партнера';
      });
  },
});

export const { clearPartnersError } = partnersSlice.actions;
export default partnersSlice.reducer;