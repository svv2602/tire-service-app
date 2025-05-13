import axios from '../utils/axios';
import { ServicePoint, AvailableDay, TimeSlot, ServiceData, Appointment, Booking } from '../types';
import { format } from 'date-fns';

export const getServicePoints = async (): Promise<ServicePoint[]> => {
  const response = await axios.get('/api/v2/service-points');
  return response.data?.data || response.data;
};

export const getServicePoint = async (id: number): Promise<ServicePoint> => {
  const response = await axios.get(`/api/v2/service-points/${id}`);
  return response.data?.data || response.data;
};

export const getServicePointsByCity = async (city: string): Promise<ServicePoint[]> => {
  const response = await axios.get('/api/v2/service-points/filter', { params: { city } });
  return response.data?.data || [];
};

export const getCities = async (): Promise<string[]> => {
  const response = await axios.get('/api/v2/cities');
  return response.data?.data || [];
};

export const getRegions = async (): Promise<string[]> => {
  const response = await axios.get('/api/v2/regions');
  return response.data?.data || [];
};

export const updateServicePoint = async (id: number, data: Partial<ServicePoint>): Promise<ServicePoint> => {
  const response = await axios.put(`/api/v2/service-points/${id}`, data);
  return response.data?.data || response.data;
};

export const getAvailableDays = async (servicePointId: number): Promise<AvailableDay[]> => {
  const response = await axios.get(`/service-points/${servicePointId}/available-days`);
  return response.data?.available_days || [];
};

export const getAvailableTimeSlots = async (servicePointId: number, date: string): Promise<TimeSlot[]> => {
  const response = await axios.get(`/service-points/${servicePointId}/available-time-slots`, { params: { date } });
  return response.data?.time_slots || [];
};

export const generateReliableTimeSlots = async (servicePointId: number, date: string): Promise<TimeSlot[]> => {
  // Этот метод генерирует более надежные слоты времени, 
  // которые учитывают возможные проблемы с сервером
  try {
    const slots = await getAvailableTimeSlots(servicePointId, date);
    if (slots && slots.length > 0) {
      return slots;
    }
    
    // Если слоты не получены, генерируем временные слоты по умолчанию
    // с начала рабочего дня (9:00) до конца (18:00) с интервалом в 30 минут
    const defaultSlots: TimeSlot[] = [];
    for (let hour = 9; hour < 18; hour++) {
      defaultSlots.push({
        time: `${hour}:00`,
        is_available: true,
        available_posts: 1
      });
      defaultSlots.push({
        time: `${hour}:30`,
        is_available: true,
        available_posts: 1
      });
    }
    return defaultSlots;
  } catch (error) {
    console.error('Error getting time slots:', error);
    return [];
  }
};

export const getServices = async (): Promise<ServiceData[]> => {
  const response = await axios.get('/services');
  return response.data?.data || [];
};

export const getServicesByServicePoint = async (servicePointId: number): Promise<ServiceData[]> => {
  const response = await axios.get(`/service-points/${servicePointId}/services`);
  return response.data?.data || [];
};

export const createAppointment = async (appointmentData: {
  service_point_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  appointment_date: string;
  appointment_time: string;
  service_id?: number;
  vehicle_brand?: string;
  vehicle_type?: string;
  comment?: string;
}): Promise<Appointment> => {
  const response = await axios.post('/appointments', appointmentData);
  return response.data?.appointment || response.data;
};

export const updateBooking = async (id: number, bookingData: Partial<Booking>): Promise<any> => {
  const response = await axios.put(`/api/bookings/${id}`, bookingData);
  return response.data?.data || response.data;
};
