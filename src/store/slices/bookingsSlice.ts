import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import { updateBooking as apiUpdateBooking } from '../../services/api';
import { Booking, StatusChange } from '../../types';
import minimalApiClient from '../../utils/minimalApiClient';
import directApiClient from '../../utils/directApi';

interface BookingsState {
  items: Booking[];
  selectedBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  items: [],
  selectedBooking: null,
  isLoading: false,
  error: null,
};

export const fetchBookings = createAsyncThunk('bookings/fetchAll', async (_, { rejectWithValue }) => {
  try {
    console.log('Fetching bookings with direct API client');
      try {
      // Пробуем сначала с directApiClient
      const response = await directApiClient.get('/api/bookings');
      console.log('Direct API response for bookings:', response);
      
      // Get the data based on the response format
      let bookingsData: any[] = [];
      if (response.data?.bookings) {
        bookingsData = response.data.bookings;
      } else if (Array.isArray(response.data)) {
        bookingsData = response.data;
      } else if (response.data?.data) {
        bookingsData = response.data.data;
      } else {
        console.log('Using response data directly:', response.data);
        bookingsData = response.data || [];
      }
    
      console.log(`Fetched ${bookingsData.length} bookings with direct API client`);
      return bookingsData;
    } catch (directError) {
      console.error('Error fetching bookings with direct API client, trying minimalApiClient:', directError);
      
      try {        // Пробуем с minimalApiClient
        const bookingsData = await minimalApiClient.get<any[]>('/api/bookings');
        console.log(`Fetched ${bookingsData.length} bookings with minimal API client`);
        return bookingsData;
      } catch (minimalError) {
        console.error('Error fetching bookings with minimal API client, trying axios:', minimalError);          // В качестве запасного варианта используем axios с прямым доступом к API
        const response = await axios.get('/api/bookings');
        // Get the data based on the response format
        let axiosBookingsData: any[] = [];
        if (response.data.bookings) {
          axiosBookingsData = response.data.bookings;
        } else if (Array.isArray(response.data)) {
          axiosBookingsData = response.data;
        } else if (response.data.data) {
          axiosBookingsData = response.data.data;
        } else {
          console.error('Unexpected API response format:', response.data);
          axiosBookingsData = [];
        }
        
        // Log the raw bookings data for debugging
        console.log('Raw bookings data from API:', JSON.stringify(axiosBookingsData, null, 2));
        
        // Transform the data to match the expected format for the frontend
        const normalizedBookings = axiosBookingsData.map((booking: any) => {
          // Extract the time from timeSlot if available, otherwise return a default
          const time = booking.timeSlot ? booking.timeSlot.split(' - ')[0] : (booking.time || '00:00');
          
          // Create a normalized booking object that handles all field name variations
          return {
            id: booking.id,
            // Handle client name field variations
            clientName: booking.clientName || booking.full_name || booking.customer_name || 'Unknown',
            // Handle phone field variations
            phone: booking.phone || booking.customer_phone || '',
            // Handle car number field variations
            carNumber: booking.carNumber || booking.car_number || booking.vehicle_number || booking.license_plate || '',
            // Handle vehicle brand field variations
            vehicleBrand: booking.vehicleBrand || booking.vehicle_brand || booking.car_brand || '',
            // Handle vehicle type field variations
            vehicleType: booking.vehicleType || booking.vehicle_type || booking.car_type || '',
            // Handle date and time
            date: booking.date || booking.appointment_date || '',
            time: booking.time || booking.appointment_time || time,
            // Handle status
            status: booking.status || booking.booking_status || booking.appointment_status || 'pending',
            // Handle service point ID
            servicePointId: booking.servicePointId || booking.service_point_id || 0,
            // Include any other fields that might be needed
            ...booking
          };
        });
        
        console.log('Normalized bookings for Redux store:', normalizedBookings);
        return normalizedBookings;
      }
    }

  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
});

export const fetchBookingDetails = createAsyncThunk(
  'bookings/fetchDetails',
  async (id: number) => {
    try {
      // Используем directApiClient для прямого доступа к API
      const [bookingResponse, historyResponse] = await Promise.all([
        directApiClient.get(`/api/bookings/${id}`),
        directApiClient.get(`/api/bookings/${id}/history`),
      ]);
      
      // Handle booking response
      let bookingData;
      if (bookingResponse.data.booking) {
        bookingData = bookingResponse.data.booking;
      } else if (bookingResponse.data.data) {
        bookingData = bookingResponse.data.data;
      } else if (bookingResponse.data && bookingResponse.data.id) {
        bookingData = bookingResponse.data;
      } else {
        console.error('Unexpected booking response format:', bookingResponse.data);
        bookingData = {};
      }
      
      // Handle history response
      let historyData;
      if (historyResponse.data.history) {
        historyData = historyResponse.data.history;
      } else if (historyResponse.data.data) {
        historyData = historyResponse.data.data;
      } else if (Array.isArray(historyResponse.data)) {
        historyData = historyResponse.data;
      } else {
        console.error('Unexpected history response format:', historyResponse.data);
        historyData = [];
      }
      
      // Transform the data to match the expected format for the frontend
      const time = bookingData.timeSlot ? bookingData.timeSlot.split(' - ')[0] : '00:00';
      
      return {
        ...bookingData,
        clientName: bookingData.clientName || bookingData.full_name || 'Unknown',
        time: bookingData.time || time,
        statusHistory: historyData,
      };
    } catch (error) {
      console.error(`Error fetching booking details for id ${id}:`, error);
      throw error;
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  'bookings/updateStatus',
  async ({ id, status }: { id: number; status: string }) => {    // Используем directApiClient для прямого доступа к API
    const response = await directApiClient.patch(`/api/bookings/${id}`, { status });
    return response.data;
  }
);

export const updateBooking = createAsyncThunk(
  'bookings/updateBooking',
  async (booking: {
    id: number,
    clientName?: string,
    phone?: string,
    date?: string,
    time?: string,
    carNumber?: string,
    vehicleBrand?: string,
    vehicleType?: string,
    status?: string,
    servicePointId?: number,
    // Поля бэкенда могут прийти напрямую
    full_name?: string, 
    car_number?: string,
    service_point_id?: number,
    vehicle_brand?: string,
    vehicle_type?: string,
    // Флаги обработки ошибок
    _fromApi?: boolean,
    _saveError?: boolean,
    _errorDetails?: string
  }, { rejectWithValue }) => {
    try {
      console.log('bookingsSlice: updateBooking thunk called with data:', JSON.stringify(booking, null, 2));
      
      // Проверяем флаги ошибок от API
      if (booking._saveError) {
        console.warn('bookingsSlice: Обнаружен флаг ошибки сохранения API, используем локальные данные');
        console.warn('bookingsSlice: Подробности ошибки:', booking._errorDetails);
        
        // Удаляем технические флаги перед сохранением в Redux
        // Используем деструктуризацию для создания чистой копии, исключив служебные поля
        const { _fromApi, _saveError, _errorDetails, ...cleanBooking } = booking;
        
        return cleanBooking;
      }
      
      // Log more details about the actual data type for ID and servicePointId
      console.log('bookingsSlice: ID type check:', {
        rawId: booking.id,
        idType: typeof booking.id,
        asNumber: Number(booking.id),
        isNaN: isNaN(Number(booking.id))
      });
      console.log('bookingsSlice: ServicePointId type check:', {
        rawId: booking.servicePointId,
        idType: typeof booking.servicePointId,
        asNumber: Number(booking.servicePointId),
        isNaN: booking.servicePointId !== undefined ? isNaN(Number(booking.servicePointId)) : 'undefined'
      });
      
      // Validate required fields - проверяем как в формате фронтенда, так и в формате бэкенда
      const hasRequiredFields = (
        // Имя клиента
        (booking.clientName || booking.full_name) &&
        // Телефон
        booking.phone &&
        // Номер автомобиля
        (booking.carNumber || booking.car_number) &&
        // Дата
        booking.date &&
        // Время
        booking.time &&
        // ID точки обслуживания (может быть равен 0, поэтому проверяем на undefined/null)
        (booking.servicePointId !== undefined && booking.servicePointId !== null) || 
        (booking.service_point_id !== undefined && booking.service_point_id !== null)
      );
      
      if (!hasRequiredFields) {
        console.error(`bookingsSlice: Missing required fields in booking data`);
        return rejectWithValue('Отсутствуют обязательные поля в данных записи');
      }
      
      // Универсальное преобразование данных с учетом обоих форматов полей
      const validatedBooking = {
        id: Number(booking.id),
        clientName: String(booking.clientName || booking.full_name || ''),
        phone: String(booking.phone || ''),
        carNumber: String(booking.carNumber || booking.car_number || ''),
        vehicleBrand: booking.vehicleBrand || booking.vehicle_brand || '',
        vehicleType: booking.vehicleType || booking.vehicle_type || '',
        date: String(booking.date || ''),
        time: String(booking.time || ''),
        status: booking.status || 'pending',
        servicePointId: Number(booking.servicePointId ?? booking.service_point_id),
        
        // Дублируем поля в формате бэкенда
        full_name: String(booking.clientName || booking.full_name || ''),
        car_number: String(booking.carNumber || booking.car_number || ''),
        service_point_id: Number(booking.servicePointId ?? booking.service_point_id),
        vehicle_brand: booking.vehicleBrand || booking.vehicle_brand || '',
        vehicle_type: booking.vehicleType || booking.vehicle_type || ''
      };
      
      console.log('bookingsSlice: Передаем в API функцию данные:', 
        JSON.stringify(validatedBooking, null, 2));
      
      try {
        // Вызываем API-функцию для обновления записи
        console.log('bookingsSlice: Вызываем API функцию updateBooking...');
        const response = await apiUpdateBooking(validatedBooking.id, validatedBooking);
        
        console.log('bookingsSlice: Получен ответ от API:', 
          response ? JSON.stringify(response, null, 2) : 'Нет данных в ответе');
        
        // Если ответ пустой, используем валидированные данные как результат
        if (!response) {
          console.warn('bookingsSlice: API вернул пустой ответ, используем исходные данные');
          // Явно сообщаем, что используем локальные данные
          window.alert('Сохранение записи: сервер вернул пустой ответ, но изменения могли быть применены. Обновите страницу для проверки.');
          
          // Используем валидированные данные для обновления UI
          return {
            id: validatedBooking.id,
            clientName: validatedBooking.clientName,
            phone: validatedBooking.phone,
            carNumber: validatedBooking.carNumber,
            vehicleBrand: validatedBooking.vehicleBrand,
            vehicleType: validatedBooking.vehicleType,
            date: validatedBooking.date,
            time: validatedBooking.time,
            status: validatedBooking.status,
            servicePointId: validatedBooking.servicePointId
          };
        }
        
        // Создаем результирующий объект только с полями, необходимыми для UI
        const result = {
          id: response.id || validatedBooking.id,
          clientName: validatedBooking.clientName,
          phone: validatedBooking.phone,
          carNumber: validatedBooking.carNumber,
          vehicleBrand: validatedBooking.vehicleBrand,
          vehicleType: validatedBooking.vehicleType,
          date: validatedBooking.date,
          time: validatedBooking.time,
          status: response.status || validatedBooking.status,
          servicePointId: validatedBooking.servicePointId
        };
        
        console.log('bookingsSlice: Возвращаем данные для обновления UI:', 
          JSON.stringify(result, null, 2));
        
        return result;
      } catch (apiError: any) {
        console.error('bookingsSlice: Ошибка вызова API:', apiError.message);
        
        // Проверяем наличие сообщения об ошибке в ответе
        if (apiError.response?.data?.message) {
          console.error('bookingsSlice: Сообщение об ошибке от сервера:', apiError.response.data.message);
          return rejectWithValue(apiError.response.data.message);
        } else if (apiError.message) {
          return rejectWithValue(apiError.message);
        }
        
        // Если конкретной ошибки нет, возвращаем данные для UI
        console.warn('bookingsSlice: Возвращаем локальные данные для UI');
        
        // Возвращаем объект только с полями, необходимыми для UI
        return {
          id: validatedBooking.id,
          clientName: validatedBooking.clientName,
          phone: validatedBooking.phone,
          carNumber: validatedBooking.carNumber,
          vehicleBrand: validatedBooking.vehicleBrand,
          vehicleType: validatedBooking.vehicleType,
          date: validatedBooking.date,
          time: validatedBooking.time,
          status: validatedBooking.status,
          servicePointId: validatedBooking.servicePointId
        };
      }
    } catch (error: any) {
      console.error(`bookingsSlice: Необработанная ошибка:`, error);
      return rejectWithValue(error.message || 'Ошибка обновления записи');
    }
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchBookings
      .addCase(fetchBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка загрузки записей';
      })
      // Обработка fetchBookingDetails
      .addCase(fetchBookingDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookingDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedBooking = action.payload;
        // Обновляем запись в общем списке
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(fetchBookingDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка загрузки деталей записи';
      })
      // Обработка updateBookingStatus
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(booking => booking.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedBooking?.id === action.payload.id) {
          state.selectedBooking = action.payload;
        }
      })
      // Обработка updateBooking
      .addCase(updateBooking.fulfilled, (state, action) => {
        // Ищем индекс существующей записи
        const index = state.items.findIndex(booking => booking.id === action.payload.id);
        
        console.log(`bookingsSlice: обновление записи в store, индекс ${index}, данные:`, 
          JSON.stringify(action.payload, null, 2));
        
        if (index !== -1) {
          // Создаем новый объект записи с обновленными данными
          const updatedBooking: Booking = {
            // Сначала берем оригинальные поля из существующей записи
            ...state.items[index],
            // Затем перезаписываем их новыми значениями
            id: Number(action.payload.id),
            clientName: String(action.payload.clientName),
            phone: String(action.payload.phone),
            carNumber: String(action.payload.carNumber),
            date: String(action.payload.date),
            time: String(action.payload.time),
            status: String(action.payload.status),
            servicePointId: Number(action.payload.servicePointId),
            // Для опциональных полей используем условную перезапись
            ...(action.payload.vehicleBrand !== undefined && { vehicleBrand: String(action.payload.vehicleBrand) }),
            ...(action.payload.vehicleType !== undefined && { vehicleType: String(action.payload.vehicleType) })
          };
          
          // Обновляем запись в массиве
          state.items[index] = updatedBooking;
          console.log('bookingsSlice: запись обновлена в списке, результат:', updatedBooking);
        } else {
          console.warn(`bookingsSlice: запись с ID=${action.payload.id} не найдена в списке, добавляем`);
          // Добавляем запись, если она не найдена в списке
          const newBooking: Booking = {
            id: Number(action.payload.id),
            clientName: String(action.payload.clientName),
            phone: String(action.payload.phone),
            carNumber: String(action.payload.carNumber),
            date: String(action.payload.date),
            time: String(action.payload.time),
            status: String(action.payload.status),
            servicePointId: Number(action.payload.servicePointId),
            // Для опциональных полей проверяем наличие
            ...(action.payload.vehicleBrand !== undefined && { vehicleBrand: String(action.payload.vehicleBrand) }),
            ...(action.payload.vehicleType !== undefined && { vehicleType: String(action.payload.vehicleType) })
          };
          
          state.items.push(newBooking);
        }
        
        // Обновляем выбранную запись, если она соответствует обновляемой
        if (state.selectedBooking?.id === action.payload.id) {
          // Создаем новый объект для выбранной записи
          const updatedSelectedBooking: Booking = {
            // Сначала берем оригинальные поля из существующей записи
            ...state.selectedBooking,
            // Затем перезаписываем их новыми значениями
            id: Number(action.payload.id),
            clientName: String(action.payload.clientName),
            phone: String(action.payload.phone),
            carNumber: String(action.payload.carNumber),
            date: String(action.payload.date),
            time: String(action.payload.time),
            status: String(action.payload.status),
            servicePointId: Number(action.payload.servicePointId),
            // Для опциональных полей используем условную перезапись
            ...(action.payload.vehicleBrand !== undefined && { vehicleBrand: String(action.payload.vehicleBrand) }),
            ...(action.payload.vehicleType !== undefined && { vehicleType: String(action.payload.vehicleType) })
          };
          
          state.selectedBooking = updatedSelectedBooking;
          console.log('bookingsSlice: выбранная запись обновлена');
        }
      });
  },
});

export const { clearSelectedBooking } = bookingsSlice.actions;
export default bookingsSlice.reducer;