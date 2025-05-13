import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import { ServicePoint, WorkingHours } from '../../types';

interface ServicePointsState {
  items: ServicePoint[];
  isLoading: boolean;
  error: string | null;
  regions: string[];
  cities: string[];
  selectedRegion: string | null;
  selectedCity: string | null;
  filteredItems: ServicePoint[];
}

const initialState: ServicePointsState = {
  items: [],
  isLoading: false,
  error: null,
  regions: [],
  cities: [],
  selectedRegion: null,
  selectedCity: null,
  filteredItems: []
};

export const fetchServicePoints = createAsyncThunk(
  'servicePoints/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v2/service-points', {
        params: { include_inactive: true }
      });
      return response.data?.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось загрузить сервисные точки');
    }
  }
);

export const updateServicePoint = createAsyncThunk(
  'servicePoints/update',
  async ({ id, data }: { id: number; data: Partial<ServicePoint> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/v2/service-points/${id}`, data);
      return response.data?.data || response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось обновить сервисную точку');
    }
  }
);

export const createServicePoint = createAsyncThunk(
  'servicePoints/create',
  async (data: Partial<ServicePoint>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/v2/service-points', data);
      return response.data?.data || response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось создать сервисную точку');
    }
  }
);

export const deleteServicePoint = createAsyncThunk(
  'servicePoints/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/v2/service-points/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось удалить сервисную точку');
    }
  }
);

export const fetchRegions = createAsyncThunk(
  'servicePoints/fetchRegions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v2/regions');
      return response.data?.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось загрузить регионы');
    }
  }
);

export const fetchCitiesByRegion = createAsyncThunk(
  'servicePoints/fetchCitiesByRegion',
  async (region: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/v2/cities`, {
        params: { region }
      });
      return response.data?.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось загрузить города');
    }
  }
);

export const fetchFilteredServicePoints = createAsyncThunk(
  'servicePoints/fetchFilteredServicePoints',
  async ({ region, city }: { region?: string; city?: string }, { rejectWithValue }) => {
    try {
      const params: any = {};
      if (region) params.region = region;
      if (city) params.city = city;
      
      const response = await axios.get('/api/v2/service-points/filter', { params });
      return response.data?.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось загрузить отфильтрованные сервисные точки');
    }
  }
);

export const toggleServicePointActiveStatus = createAsyncThunk(
  'servicePoints/toggleStatus',
  async ({ id, makeActive }: { id: number; makeActive: boolean }, { rejectWithValue }) => {
    try {
      // Вместо передачи только статуса, будем логировать полный запрос для отладки
      console.log('Sending status update request for service point:', id, 'makeActive:', makeActive);
      
      const requestData = {
        status: makeActive ? 'работает' : 'приостановлена'
      };
      
      console.log('Request data:', requestData);
      
      const response = await axios.put(`/api/v2/service-points/${id}`, requestData);
      
      console.log('Status update response:', response.data);
      
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('Error updating service point status:', error);
      return rejectWithValue(error.message || 'Не удалось изменить статус точки');
    }
  }
);

const servicePointsSlice = createSlice({
  name: 'servicePoints',
  initialState,
  reducers: {
    setSelectedRegion: (state, action: PayloadAction<string | null>) => {
      state.selectedRegion = action.payload;
      state.selectedCity = null; // Сбрасываем выбранный город при смене региона
    },
    setSelectedCity: (state, action: PayloadAction<string | null>) => {
      state.selectedCity = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServicePoints.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServicePoints.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchServicePoints.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateServicePoint.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(createServicePoint.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteServicePoint.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(fetchRegions.fulfilled, (state, action) => {
        state.regions = action.payload;
      })
      .addCase(fetchCitiesByRegion.fulfilled, (state, action) => {
        state.cities = action.payload;
      })
      .addCase(fetchFilteredServicePoints.fulfilled, (state, action) => {
        state.filteredItems = action.payload;
      })
      .addCase(toggleServicePointActiveStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  }
});

export const { setSelectedRegion, setSelectedCity } = servicePointsSlice.actions;
export default servicePointsSlice.reducer;