import { WorkingHours, ServiceWithComment, ServicePost, ServicePointStatus } from './index';

export interface ServicePoint {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  region?: string | null;
  city?: string | null;
  partner_id: number;
  phone?: string;
  description?: string;
  contact_info?: string;
  notes?: string;
  num_posts: number;
  service_time_grid?: string;
  price_list_path?: string;
  services?: Array<number | { id: number; name: string }>;
  service_comments?: ServiceWithComment[];
  service_posts?: ServicePost[];
  working_hours: WorkingHours;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  _client_generated?: boolean;
  status?: ServicePointStatus;
} 