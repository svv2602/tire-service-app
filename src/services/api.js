/**
 * This file serves as a bridge to ensure both .js and .ts imports work correctly.
 * Some parts of the application might be importing from 'api.js' while others from 'api.ts'.
 * 
 * This file simply re-exports everything from the TypeScript implementation.
 */

import axios from '../utils/axios';
import * as apiExports from './api.ts';

// Создаем собственный экземпляр API с прямым доступом к бэкенду
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Исправленный URL без префикса /api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Re-export default - теперь мы экспортируем локально созданный экземпляр
export default api;

// Re-export all named exports
export const getServicePoints = apiExports.getServicePoints;
export const getServicePointsByCity = apiExports.getServicePointsByCity;
export const getServicePoint = apiExports.getServicePoint;
export const updateServicePoint = apiExports.updateServicePoint;
export const getCities = apiExports.getCities;
export const getRegions = apiExports.getRegions;
export const getAvailableDays = apiExports.getAvailableDays;
export const getAvailableTimeSlots = apiExports.getAvailableTimeSlots;
export const getServices = apiExports.getServices;
export const getServicesByServicePoint = apiExports.getServicesByServicePoint;
export const createAppointment = apiExports.createAppointment;

// Most critical export for booking updates
export const updateBooking = apiExports.updateBooking;
export const generateReliableTimeSlots = apiExports.generateReliableTimeSlots;

// Log to confirm this file is being loaded when JS imports are used
console.log('api.js compatibility layer loaded successfully'); 