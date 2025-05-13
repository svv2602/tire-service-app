export interface ServicePoint {
  id: number;
  name: string;
  address: string;
  region?: string;
  city?: string;
  working_hours: WorkingHours;
  lat: number;
  lng: number;
  partner_id: number;
  total_posts?: number;
  description?: string;
  contact_info?: string;
  notes?: string;
  num_posts: number;
  service_time_grid?: string;
  price_list_path?: string;
  services?: Array<number | { id: number; name: string }>;
  service_comments?: ServiceWithComment[];
  service_posts?: ServicePost[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  images?: FileInfo[];
  price_lists?: FileInfo[];
  status?: ServicePointStatus;
}

export interface WorkingHours {
  monday: WorkingHoursDay | string;
  tuesday: WorkingHoursDay | string;
  wednesday: WorkingHoursDay | string;
  thursday: WorkingHoursDay | string;
  friday: WorkingHoursDay | string;
  saturday: WorkingHoursDay | string;
  sunday: WorkingHoursDay | string | 'closed';
}

export interface WorkingHoursDay {
  open: string;
  close: string;
}

export interface TimeSlot {
  time: string;
  is_available: boolean;
  available_posts?: number;
}

export interface AvailableDay {
  date: string;
  day_name: string;
  day_number: number;
  month_name: string;
  year: number;
}

export interface ServiceData {
  id: number;
  name: string;
  description?: string;
}

export interface Appointment {
  id: number;
  service_point_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  appointment_date: string;
  appointment_time: string;
  service_id?: number;
  vehicle_brand?: string;
  vehicle_type?: VehicleType;
  status: AppointmentStatus;
  comment?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type VehicleType = 'passenger' | 'light_truck' | 'suv' | 'off_road';

export const vehicleTypeOptions = [
  { value: 'passenger', label: 'Легковой' },
  { value: 'light_truck', label: 'Легкогрузовой' },
  { value: 'suv', label: 'SUV' },
  { value: 'off_road', label: 'Внедорожник' }
];

// Тип для бронирований в системе
export interface Booking {
  id: number;
  clientName: string;
  phone: string;
  carNumber: string;
  vehicleBrand?: string;
  vehicleType?: string;
  date: string;
  time: string;
  status: string;
  servicePointId: number;
  statusHistory?: StatusChange[];
}

export interface StatusChange {
  id: number;
  status: string;
  timestamp: string;
  userId: number;
  userName: string;
}

export interface ServicePost {
  id?: number;
  name: string;
  service_time_minutes: number;
}

export interface ServiceWithComment {
  service_id: number;
  comment?: string;
}

export interface FileInfo {
  path: string;
  url?: string;
  name?: string;
}

export type ServicePointStatus = 'working' | 'suspended' | 'closed';