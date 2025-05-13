import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import {
  fetchServicePoints,
  createServicePoint,
  updateServicePoint,
  deleteServicePoint,
  fetchRegions,
  fetchCitiesByRegion,
  setSelectedRegion,
  setSelectedCity,
} from '../../store/slices/servicePointsSlice';
import { fetchPartners } from '../../store/slices/partnersSlice';
import { fetchServices } from '../../store/slices/servicesSlice';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Grid,
  Autocomplete,
  InputAdornment,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  CloudUpload as UploadIcon,
  Description as FileIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  AccessTime as TimeIcon,
  ArrowDownward,
  ArrowUpward,
} from '@mui/icons-material';
import { WorkingHours, ServiceWithComment, WorkingHoursDay, ServicePointStatus } from '../../types';
import PhotoGalleryUploader from '../../components/ui/PhotoGalleryUploader';
import FileUploader from '../../components/ui/FileUploader';
import axios from '../../utils/axios';

const defaultWorkingHours: WorkingHours = {
  monday: { open: '09:00', close: '18:00' },
  tuesday: { open: '09:00', close: '18:00' },
  wednesday: { open: '09:00', close: '18:00' },
  thursday: { open: '09:00', close: '18:00' },
  friday: { open: '09:00', close: '18:00' },
  saturday: { open: '10:00', close: '16:00' },
  sunday: 'выходной',
};

interface FileInfo {
  path: string;
  url?: string;
  name?: string;
  file?: File;
  id?: string | number;
}

interface FileWithPreview extends File {
  preview?: string;
}

interface FormData {
  name: string;
  address: string;
  region: string;
  city: string;
  partner_id: number;
  working_hours: WorkingHours;
  images: Array<FileWithPreview | FileInfo>;
  price_lists: Array<FileWithPreview | FileInfo>;
  service_posts: Array<{
    name: string;
    service_time_minutes: number;
    start: string;
    end: string;
  }>;
  description: string;
  notes: string;
  contact_info: string;
  services: number[];
  service_comments: Array<ServiceWithComment>;
  status: ServicePointStatus;
}

const initialForm: FormData = {
  name: '',
  address: '',
  region: '',
  city: '',
  partner_id: 0,
  working_hours: defaultWorkingHours,
  images: [],
  price_lists: [],
  service_posts: [
    { name: 'Пост 1', service_time_minutes: 40, start: '09:00', end: '18:00' },
  ],
  description: '',
  notes: '',
  contact_info: '',
  services: [],
  service_comments: [],
  status: 'working',
};

const ServicePointsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: servicePoints, isLoading, error, regions, cities } = useSelector((state: RootState) => state.servicePoints);
  const { items: partners } = useSelector((state: RootState) => state.partners || { items: [] });
  const { items: servicesList } = useSelector((state: RootState) => state.services || { items: [] });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setRegion] = useState<string>('');
  const [selectedCity, setCity] = useState<string>('');
  const [selectedPartner, setSelectedPartner] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ServicePointStatus | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSchedule, setExpandedSchedule] = useState<number | null>(null);
  
  // Sorting state
  const [sortField, setSortField] = useState<'city' | null>('city');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    dispatch(fetchServicePoints());
    dispatch(fetchPartners());
    dispatch(fetchServices());
    dispatch(fetchRegions());
    
    // Also fetch all cities when the component loads
    fetchAllCities();
  }, [dispatch]);

  useEffect(() => {
    if (selectedRegion) {
      dispatch(fetchCitiesByRegion(selectedRegion));
    } else {
      // If no region is selected, fetch all cities
      fetchAllCities();
    }
  }, [selectedRegion, dispatch]);

  // Function to fetch all cities
  const fetchAllCities = () => {
    console.log('Fetching all cities');
    // Use Axios directly to get all cities
    axios.get('/api/v2/cities')
      .then(response => {
        const citiesData = response.data?.data || [];
        console.log('All cities fetched:', citiesData);
        // Manually update the cities in the store
        dispatch({ 
          type: 'servicePoints/fetchCitiesByRegion/fulfilled',
          payload: citiesData
        });
      })
      .catch(error => {
        console.error('Failed to fetch all cities:', error);
      });
  };

  // Apply filters effect - remove this since we're filtering client-side
  useEffect(() => {
    // Log filter changes to help with debugging
    console.log('Filter values updated:', {
      region: selectedRegion,
      city: selectedCity,
      partner: selectedPartner,
      status: selectedStatus
    });
  }, [selectedRegion, selectedCity, selectedPartner, selectedStatus]);

  // Filter the service points based on all criteria
  const filteredServicePoints = servicePoints.filter(sp => {
    // Search query filter
    const matchesSearch = searchQuery === '' || 
      sp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Region/Oblast filter
    const matchesRegion = selectedRegion === '' || sp.region === selectedRegion;
    
    // City filter
    const matchesCity = selectedCity === '' || sp.city === selectedCity;
    
    // Partner filter
    const matchesPartner = !selectedPartner || sp.partner_id === selectedPartner;
    
    // Status filter
    const matchesStatus = selectedStatus === '' || sp.status === selectedStatus;
    
    return matchesSearch && matchesRegion && matchesCity && matchesPartner && matchesStatus;
  });
  
  // Apply sorting
  const sortedServicePoints = [...filteredServicePoints].sort((a, b) => {
    if (sortField === 'city') {
      const cityA = (a.city || '').toLowerCase();
      const cityB = (b.city || '').toLowerCase();
      
      return sortDirection === 'asc' 
        ? cityA.localeCompare(cityB)
        : cityB.localeCompare(cityA);
    }
    
    return 0; // Default no sorting
  });
  
  // Log filtered results for debugging
  useEffect(() => {
    console.log(`Filtered service points: ${filteredServicePoints.length} of ${servicePoints.length}`);
  }, [filteredServicePoints.length, servicePoints.length]);

  // Find partner name by ID
  const getPartnerName = (partnerId: number) => {
    const partner = partners.find(p => p.id === partnerId);
    return partner ? (partner.company_name || partner.name) : 'Неизвестный партнер';
  };

  // Format schedule for display
  const formatSchedule = (workingHours: WorkingHours) => {
    // Защита от null/undefined
    if (!workingHours) {
      return 'Нет данных о графике работы';
    }

    const dayMap: Record<string, string> = {
      monday: 'Пн',
      tuesday: 'Вт',
      wednesday: 'Ср',
      thursday: 'Чт',
      friday: 'Пт',
      saturday: 'Сб',
      sunday: 'Вс'
    };
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as (keyof WorkingHours)[];
    
    return days.map(day => {
      const daySchedule = workingHours[day];
      const dayShort = dayMap[day];
      
      // Если расписание отсутствует или это строка (выходной)
      if (!daySchedule || typeof daySchedule === 'string') {
        return `${dayShort}: выходной`;
      } 
      
      // Проверяем наличие свойств open и close
      if (daySchedule && typeof daySchedule === 'object' && daySchedule.open && daySchedule.close) {
        return `${dayShort}: ${daySchedule.open}-${daySchedule.close}`;
      }
      
      // Запасной вариант, если структура неожиданная
      return `${dayShort}: не задано`;
    }).join(', ');
  };
  
  // Toggle expanded schedule for a service point
  const toggleSchedule = (id: number) => {
    setExpandedSchedule(expandedSchedule === id ? null : id);
  };

  // Format a single day's schedule
  const formatDay = (day: string, schedule: WorkingHoursDay | string | null | undefined) => {
    const dayMap: Record<string, string> = {
      monday: 'Понедельник',
      tuesday: 'Вторник',
      wednesday: 'Среда',
      thursday: 'Четверг',
      friday: 'Пятница',
      saturday: 'Суббота',
      sunday: 'Воскресенье'
    };
    
    // Если расписание отсутствует или это строка (выходной)
    if (!schedule || typeof schedule === 'string') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
          <Typography variant="body2">{dayMap[day]}</Typography>
          <Typography variant="body2">выходной</Typography>
        </Box>
      );
    }
    
    // Проверяем наличие свойств open и close
    if (schedule && typeof schedule === 'object' && schedule.open && schedule.close) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
          <Typography variant="body2">{dayMap[day]}</Typography>
          <Typography variant="body2">{schedule.open} - {schedule.close}</Typography>
        </Box>
      );
    }
    
    // Запасной вариант, если структура неожиданная
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
        <Typography variant="body2">{dayMap[day]}</Typography>
        <Typography variant="body2">не задано</Typography>
      </Box>
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setRegion('');
    setCity('');
    setSelectedPartner(null);
    setSelectedStatus('');
  };

  const handleOpen = (sp?: any) => {
    if (sp) {
      let services = sp.services || [];
      let service_comments = sp.service_comments || [];
      if ((!services || services.length === 0) && service_comments && service_comments.length > 0) {
        services = service_comments.map((sc: any) => sc.service_id);
      }
      if ((!service_comments || service_comments.length === 0) && services && services.length > 0) {
        service_comments = services.map((id: number) => ({ service_id: id, comment: '' }));
      }
      
      // Убедимся, что service_posts всегда является массивом
      let servicePosts = [];
      if (sp.service_posts && Array.isArray(sp.service_posts) && sp.service_posts.length > 0) {
        servicePosts = sp.service_posts;
      } else {
        servicePosts = [
          { name: 'Пост 1', service_time_minutes: 40, start: '09:00', end: '18:00' },
        ];
      }
      
      // Normalize working hours to ensure all days have correct format
      const normalizedWorkingHours = { ...defaultWorkingHours };
      if (sp.working_hours) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as (keyof WorkingHours)[];
        
        days.forEach(day => {
          if (sp.working_hours && sp.working_hours[day] !== undefined) {
            // Preserve the string value for day off or use the time object as is
            if (typeof sp.working_hours[day] === 'string') {
              // В бэкэнде могут быть разные строковые значения, но мы используем единое 'выходной'
              normalizedWorkingHours[day] = 'выходной';
            } else if (typeof sp.working_hours[day] === 'object' && sp.working_hours[day] !== null) {
              // Проверяем, что объект содержит свойства open и close
              const daySchedule = sp.working_hours[day] as WorkingHoursDay;
              if (daySchedule && typeof daySchedule === 'object' && daySchedule.open && daySchedule.close) {
                normalizedWorkingHours[day] = daySchedule;
              } else {
                // Если объект неполный, используем значения по умолчанию
                normalizedWorkingHours[day] = defaultWorkingHours[day];
              }
            } else {
              // Если значение null или другой непредвиденный тип, используем выходной
              normalizedWorkingHours[day] = 'выходной';
            }
          }
        });
      }
      
      // Обрабатываем прайс-листы и изображения
      let images = sp.images || [];
      let price_lists = sp.price_lists || [];
      
      // Убедимся, что price_lists корректно загружены и включают все необходимые поля
      console.log('Original price_lists from API:', price_lists);
      
      // Добавляем оригинальное имя к файлам, если оно есть
      price_lists = price_lists.map((file: any, index: number) => {
        // Формируем правильный URL для файла
        let fileUrl = '';
        if (file.url) {
          // Используем существующий URL
          fileUrl = file.url;
        } else if (file.path) {
          // Создаем URL из пути
          if (file.path.startsWith('http://') || file.path.startsWith('https://')) {
            // Если уже полный URL
            fileUrl = file.path;
          } else {
            // Если относительный путь, добавляем /storage/ в начале
            fileUrl = `/storage/${file.path.replace(/^\/storage\//, '')}`;
          }
        }

        return {
          ...file,
          id: file.id || `file-${index}-${Date.now()}`,
          name: file.name || (file.path ? file.path.split('/').pop() : 'unknown'),
          original_name: file.original_name || file.name || (file.path ? file.path.split('/').pop() : 'unknown'),
          // Убедимся, что URL присутствует
          url: fileUrl
        };
      });
      
      console.log('Loading images:', images);
      console.log('Processed price lists for form:', price_lists);
      
      // Также проверим, есть ли price_list_path в сервисной точке 
      if (sp.price_list_path && (!price_lists || price_lists.length === 0)) {
        console.log('Found price_list_path but no price_lists array:', sp.price_list_path);
        try {
          // Если есть строка price_list_path, но нет массива price_lists, попробуем преобразовать
          const paths = JSON.parse(sp.price_list_path);
          if (Array.isArray(paths)) {
            price_lists = paths.map((path, index) => {
              // Формируем правильный URL для файла
              let fileUrl = '';
              if (path.startsWith('http://') || path.startsWith('https://')) {
                fileUrl = path;
              } else {
                fileUrl = `/storage/${path.replace(/^\/storage\//, '')}`;
              }
              
              const filename = path.split('/').pop();
              
              return {
                path,
                url: fileUrl,
                name: filename,
                original_name: filename,
                id: `file-path-${index}-${Date.now()}`
              };
            });
            console.log('Created price_lists from price_list_path:', price_lists);
          }
        } catch (e) {
          console.error('Failed to parse price_list_path:', e);
        }
      }
      
      setEditId(sp.id);
      setForm({
        name: sp.name || '',
        address: sp.address || '',
        region: sp.region || '',
        city: sp.city || '',
        partner_id: sp.partner_id ? Number(sp.partner_id) : 0,
        working_hours: normalizedWorkingHours,
        images: images,
        price_lists: price_lists,
        service_posts: servicePosts,
        description: sp.description || '',
        notes: sp.notes || '',
        contact_info: sp.contact_info || '',
        services,
        service_comments,
        status: sp.status || 'working',
      });
    } else {
      setEditId(null);
      setForm(initialForm);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setForm(initialForm);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleStatusChange = (event: any) => {
    const newStatus = event.target.value as ServicePointStatus;
    setForm({ ...form, status: newStatus });
    
    // If editing an existing service point, also update status directly for testing
    if (editId) {
      console.log(`Direct status update test: Setting service point #${editId} status to ${newStatus}`);
      
      // Use direct axios call with corrected route
      axios.patch(`/api/v2/service-points/${editId}/status`, { status: newStatus })
        .then(response => {
          console.log('Direct status update successful:', response.data);
          // Refresh the service points list
          dispatch(fetchServicePoints());
        })
        .catch(error => {
          console.error('Direct status update failed:', error);
        });
    }
  };

  const handleWorkingHoursChange = (
    day: keyof WorkingHours,
    field: 'open' | 'close' | 'status',
    value: string
  ) => {
    setForm(prev => {
      // Если меняем статус дня
      if (field === 'status') {
        // Если выбран "выходной", заменяем объект строкой
        if (value === 'выходной') {
          return {
      ...prev,
      working_hours: {
        ...prev.working_hours,
              [day]: 'выходной'
            }
          };
        } else {
          // Если выбран "рабочий", создаем объект с временем работы
          return {
            ...prev,
            working_hours: {
              ...prev.working_hours,
              [day]: { 
                open: '09:00', 
                close: '18:00' 
              }
            }
          };
        }
      }
      
      // Для изменения времени работы (open/close)
      if (typeof prev.working_hours[day] === 'object') {
        return {
          ...prev,
          working_hours: {
            ...prev.working_hours,
            [day]: {
              ...(prev.working_hours[day] as WorkingHoursDay),
              [field]: value
            }
          }
        };
      }
      
      // Если день был выходным, но мы пытаемся изменить время, сначала делаем его рабочим
      return {
        ...prev,
        working_hours: {
          ...prev.working_hours,
          [day]: {
            open: field === 'open' ? value : '09:00',
            close: field === 'close' ? value : '18:00'
          }
        }
      };
    });
  };

  const handlePostChange = (idx: number, field: string, value: any) => {
    setForm(prev => {
      // Проверяем, что service_posts - это массив
      const service_posts = Array.isArray(prev.service_posts) 
        ? [...prev.service_posts] 
        : [{ name: 'Пост 1', service_time_minutes: 40, start: '09:00', end: '18:00' }];
      
      // Обновляем соответствующий пост
      if (idx >= 0 && idx < service_posts.length) {
        service_posts[idx] = { ...service_posts[idx], [field]: value };
      }
      
      return {
      ...prev,
        service_posts
      };
    });
  };

  const handleAddPost = () => {
    setForm(prev => {
      // Проверка на массив
      const service_posts = Array.isArray(prev.service_posts) 
        ? [...prev.service_posts] 
        : [];
        
      return {
      ...prev,
      service_posts: [
          ...service_posts,
          { name: `Пост ${service_posts.length + 1}`, service_time_minutes: 40, start: '09:00', end: '18:00' },
        ]
      };
    });
  };

  const handleRemovePost = (idx: number) => {
    setForm(prev => {
      // Проверка на массив
      if (!Array.isArray(prev.service_posts) || prev.service_posts.length <= 1) {
        return prev; // Если это не массив или в нем только один элемент, не меняем state
      }
      
      return {
      ...prev,
        service_posts: prev.service_posts.filter((_: any, i: number) => i !== idx)
      };
    });
  };

  function addMinutes(time: string, mins: number) {
    const [h, m] = time.split(':').map(Number);
    const date = new Date(0, 0, 0, h, m + mins);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  function timeToMinutes(time?: string) {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  function minutesToTime(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  function calculateSlots(posts: any[]) {
    if (!posts || !Array.isArray(posts) || !posts.length) return {};
    
    // Проверяем, что посты есть и они содержат start и end
    const validPosts = posts.filter(p => p && p.start && p.end);
    if (!validPosts.length) return {};

    // Найти минимальное время начала и максимальное время конца среди всех постов
    let minStart = Math.min(...validPosts.map(p => timeToMinutes(p.start)));
    let maxEnd = Math.max(...validPosts.map(p => timeToMinutes(p.end)));

    const slots: Record<string, number> = {};
    // Шаг 5 минут
    for (let mins = minStart; mins <= maxEnd; mins += 5) {
      const time = minutesToTime(mins);
      let count = 0;
      validPosts.forEach(post => {
        const postStart = timeToMinutes(post.start);
        const postEnd = timeToMinutes(post.end);
        const interval = Number(post.service_time_minutes);
        // Слот для поста начинается, если (mins - postStart) % interval === 0 и слот полностью помещается в рабочее время поста
        if (
          mins >= postStart &&
          mins + interval <= postEnd + 0.1 &&
          (mins - postStart) % interval === 0
        ) {
          count++;
        }
      });
      if (count > 0) slots[time] = count;
    }
    return slots;
  }

  const slotsPreview = calculateSlots(Array.isArray(form.service_posts) ? form.service_posts : []);

  const handleServiceSelect = (event: any) => {
    const selectedIds = event.target.value;
    setForm((prev: typeof initialForm) => ({
      ...prev,
      services: selectedIds,
      service_comments: selectedIds.map((id: number) => {
        const existing = prev.service_comments.find((sc: any) => sc.service_id === id);
        return existing || { service_id: id, comment: '' };
      }),
    }));
  };

  const handleServiceCommentChange = (serviceId: number, value: string) => {
    setForm((prev: typeof initialForm) => ({
      ...prev,
      service_comments: prev.service_comments.map((sc: any) =>
        sc.service_id === serviceId ? { ...sc, comment: value } : sc
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (form.images.length > 10) throw new Error('Maximum 10 images allowed');
      if (form.price_lists.length > 3) throw new Error('Maximum 3 price lists allowed');
      
      // Check only File objects for extension
      const invalidFiles = form.price_lists.filter(f => 
        f instanceof File && 
        !/\.(pdf|xls|xlsx)$/i.test(f.name)
      );
      if (invalidFiles.length > 0) {
        throw new Error('Only PDF, XLS, XLSX files allowed');
      }

      // Create object with data for text fields
      const payload: any = {
        name: form.name,
        address: form.address,
        region: form.region,
        city: form.city,
        partner_id: Number(form.partner_id) || 0,
        working_hours: form.working_hours,
        description: form.description || '',
        notes: form.notes || '',
        contact_info: form.contact_info || '',
        num_posts: Array.isArray(form.service_posts) ? form.service_posts.length : 0,
        status: form.status || 'working',
        service_posts: form.service_posts,
        services: form.services,
        service_comments: form.service_comments
      };

      console.log('Payload preparing to send:', payload);
      console.log('Status value being sent:', payload.status);

      if (editId) {
        console.log('Updating service point:', editId);
        
        // Improved file detection logic
        const newImages = form.images.filter(file => file instanceof File);
        const newPriceLists = form.price_lists.filter(file => {
          // Check if it's a raw File object
          if (file instanceof File) {
            return true;
          }
          // Check if it has a file property (from our FileInfo interface)
          if (file && 'file' in file && file.file instanceof File) {
            return true;
          }
          return false;
        });
        
        const hasNewFiles = newImages.length > 0 || newPriceLists.length > 0;

        if (hasNewFiles) {
          console.log('New files detected, using FormData for file upload');
          
          // Create FormData for file uploads specifically
          const filesFormData = new FormData();
          
          // Add images to FormData
          if (newImages.length > 0) {
            console.log(`Adding ${newImages.length} new images`);
            newImages.forEach((file: any, index: number) => {
              if (file instanceof File) {
                filesFormData.append('images[]', file);
                console.log(`Added image: ${file.name}`);
              }
            });
          }
          
          // Add price lists to FormData
          if (newPriceLists.length > 0) {
            console.log(`Adding ${newPriceLists.length} new price lists`);
            newPriceLists.forEach((fileInfo: any, index: number) => {
              let fileToUpload: File | null = null;
              
              // Handle different possible formats
              if (fileInfo instanceof File) {
                fileToUpload = fileInfo;
              } else if (fileInfo && 'file' in fileInfo && fileInfo.file instanceof File) {
                fileToUpload = fileInfo.file;
              }
              
              if (fileToUpload) {
                filesFormData.append('price_lists[]', fileToUpload);
                console.log(`Added price list: ${fileToUpload.name}`);
              }
            });
          }
          
          // Upload files first
          try {
            console.log('Sending file upload request');
            const uploadResponse = await axios.post(`/api/v2/service-points/${editId}/files`, filesFormData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            console.log('Files upload response:', uploadResponse.data);
            
            // Обновляем UI после успешной загрузки файлов
            if (uploadResponse.data.status === 'success' && uploadResponse.data.data) {
              // Если загрузили новые прайс-листы, обновим их в форме
              if (uploadResponse.data.data.price_lists && uploadResponse.data.data.price_lists.length > 0) {
                const serverPriceLists = uploadResponse.data.data.price_lists.map((item: any) => {
                  // Формируем правильный URL для файла
                  let fileUrl = '';
                  if (item.url) {
                    fileUrl = item.url;
                  } else if (item.path) {
                    if (item.path.startsWith('http://') || item.path.startsWith('https://')) {
                      fileUrl = item.path;
                    } else {
                      fileUrl = `/storage/${item.path.replace(/^\/storage\//, '')}`;
                    }
                  }
                  
                  return {
                    path: item.path,
                    url: fileUrl,
                    name: item.name || (item.path ? item.path.split('/').pop() : 'unknown'),
                    original_name: item.original_name || item.name || (item.path ? item.path.split('/').pop() : 'unknown'),
                    id: `server-file-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
                  };
                });
                
                console.log('New price lists received from server:', serverPriceLists);
                
                // Сохраняем уже существующие прайс-листы, которые не загружались сейчас
                const existingPriceLists = form.price_lists.filter(file => !(file instanceof File || 
                  (file && 'file' in file && file.file instanceof File)));
                
                // Объединяем существующие и новые прайс-листы
                const combinedPriceLists = [...existingPriceLists, ...serverPriceLists];
                
                console.log('Combined price lists for form:', combinedPriceLists);
                
                setForm(prev => ({
                  ...prev,
                  price_lists: combinedPriceLists
                }));
                
                // Update the price_list_path in the payload for the subsequent update request
                const priceListPaths = combinedPriceLists.map((item: any) => item.path);
                payload.price_list_path = JSON.stringify(priceListPaths);
                console.log('Updated price_list_path in payload:', payload.price_list_path);
              }
              
              // Если загрузили новые изображения, обновим их в форме
              if (uploadResponse.data.data.images && uploadResponse.data.data.images.length > 0) {
                setForm(prev => ({
                  ...prev,
                  images: [
                    ...prev.images.filter(img => !(img instanceof File)), // оставляем только существующие изображения, не файлы
                    ...uploadResponse.data.data.images.map((item: any) => ({
                      id: item.id,
                      path: item.path,
                      url: item.url
                    }))
                  ]
                }));
              }
            }
          } catch (uploadError) {
            console.error('Error uploading files:', uploadError);
            throw new Error('Failed to upload files: ' + (uploadError instanceof Error ? uploadError.message : String(uploadError)));
          }
        } else {
          // When no new files are added but there are existing price lists in the form, 
          // update the price_list_path in the payload
          if (form.price_lists.length > 0) {
            const priceListPaths = form.price_lists.map((item: any) => item.path);
            payload.price_list_path = JSON.stringify(priceListPaths);
            console.log('Setting price_list_path from existing price lists:', payload.price_list_path);
          }
        }
        
        // Then update the text data
        console.log('Updating service point data with payload:', payload);
        const updateResponse = await dispatch(updateServicePoint({ 
          id: editId,
          data: payload
        })).unwrap();
        
        console.log('Update response:', updateResponse);
        
        // Immediately refresh the data
        await dispatch(fetchServicePoints());
        
        setAlert('Point successfully updated');
      } else {
        console.log('Creating new service point');
        
        // For new service points, create a single FormData with all data and files
        const formData = new FormData();
        
        // Add all fields to formData
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      });

        // Add images
        console.log('Adding images to formData:', form.images.length, 'files');
        form.images.forEach((file, index) => {
        if (file instanceof File) {
            console.log(`Adding image #${index}:`, file.name);
          formData.append('images[]', file);
        }
      });
      
        // Add price lists
        console.log('Adding price lists to formData:', form.price_lists.length, 'files');
        form.price_lists.forEach((file, index) => {
        if (file instanceof File) {
            console.log(`Adding price list #${index}:`, file.name);
          formData.append('price_lists[]', file);
        }
      });

        try {
          const createResponse = await axios.post('/api/v2/service-points', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          console.log('Create service point response:', createResponse.data);
          
          // Get data from response
          const createdData = createResponse.data?.data || createResponse.data;
          
          // Update store with data
          dispatch({ 
            type: 'servicePoints/create/fulfilled', 
            payload: createdData
          });
          
          setAlert('Point successfully created');
        } catch (createError: any) {
          console.error('Error creating service point:', createError);
          throw createError;
        }
      }
      
      handleClose();
      dispatch(fetchServicePoints());
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      setAlert('Error saving point: ' + (err.message || err));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteServicePoint(deleteId)).unwrap();
      setAlert('Point successfully deleted');
      setDeleteId(null);
      dispatch(fetchServicePoints());
    } catch (err: any) {
      setAlert('Error deleting point: ' + (err.message || err));
    }
  };

  // Toggle sort when clicking on the table header
  const handleSort = (field: 'city') => {
    if (sortField === field) {
      // If already sorting by this field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If sorting by a new field, set it as the sort field and default to asc
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Точки обслуживания</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />} 
          onClick={() => handleOpen()}
        >
          Добавить
      </Button>
      </Box>

      {/* Filter section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Фильтры</Typography>
          </Box>
          <Box>
            <Button 
              variant="text" 
              size="small" 
              onClick={() => setShowFilters(!showFilters)}
              endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
            </Button>
          </Box>
        </Box>

        {/* Search field is always visible */}
        <TextField
          fullWidth
          placeholder="Поиск по названию или адресу"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Extended filters */}
        {showFilters && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
              <FormControl fullWidth size="small">
                <InputLabel>Область</InputLabel>
                <Select
                  value={selectedRegion}
                  onChange={(e) => {
                    setRegion(e.target.value);
                    // Always reset city when region changes
                    setCity('');
                  }}
                  label="Область"
                >
                  <MenuItem value="">Все области</MenuItem>
                  {regions.map((region) => (
                    <MenuItem key={region} value={region}>{region}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
              <FormControl fullWidth size="small">
                <InputLabel>Город</InputLabel>
                <Select
                  value={selectedCity}
                  onChange={(e) => setCity(e.target.value)}
                  label="Город"
                >
                  <MenuItem value="">Все города</MenuItem>
                  {cities.map((city) => (
                    <MenuItem key={city} value={city}>{city}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
              <FormControl fullWidth size="small">
                <InputLabel>Партнер</InputLabel>
                <Select
                  value={selectedPartner || ''}
                  onChange={(e) => setSelectedPartner(e.target.value ? Number(e.target.value) : null)}
                  label="Партнер"
                >
                  <MenuItem value="">Все партнеры</MenuItem>
                  {partners.map((partner) => (
                    <MenuItem key={partner.id} value={partner.id}>
                      {partner.company_name || partner.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
              <FormControl fullWidth size="small">
                <InputLabel>Статус</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ServicePointStatus | '')}
                  label="Статус"
                >
                  <MenuItem value="">Все статусы</MenuItem>
                  <MenuItem value="working">Работает</MenuItem>
                  <MenuItem value="suspended">Приостановлено</MenuItem>
                  <MenuItem value="closed">Закрыто</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={resetFilters} sx={{ mr: 1 }}>
                Сбросить
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {alert && (
        <Alert severity="success" onClose={() => setAlert(null)} sx={{ mb: 2 }}>
          {alert}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      ) : (
        <>
          <Paper>
            <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Партнер</TableCell>
                    <TableCell>Адрес</TableCell>
                    <TableCell onClick={() => handleSort('city')} style={{ cursor: 'pointer' }}>
                      <Tooltip title={`Сортировать по городу ${sortDirection === 'asc' ? 'по убыванию' : 'по возрастанию'}`}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          Город
                          {sortField === 'city' && (
                            <Box component="span" ml={0.5} sx={{ display: 'flex', alignItems: 'center' }}>
                              {sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                            </Box>
                          )}
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>График работы</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
                  {filteredServicePoints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body1" sx={{ py: 2 }}>
                          Точек обслуживания не найдено
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedServicePoints.map((sp) => (
                      <React.Fragment key={sp.id}>
                        <TableRow hover>
                <TableCell>{sp.id}</TableCell>
                <TableCell>{sp.name}</TableCell>
                          <TableCell>{getPartnerName(sp.partner_id)}</TableCell>
                <TableCell>
                            <Box>
                              {sp.address}
                              {sp.region && (
                                <Typography variant="caption" color="textSecondary" display="block">
                                  {sp.region}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{sp.city || '-'}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <TimeIcon fontSize="small" sx={{ mr: 1 }} />
                              <Box 
                                component="span" 
                                sx={{ 
                                  maxWidth: 150, 
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  mr: 1
                                }}
                              >
                                {sp.working_hours ? formatSchedule(sp.working_hours).substring(0, 20) + '...' : 'Нет данных'}
                              </Box>
                              <IconButton 
                    size="small"
                                onClick={() => toggleSchedule(sp.id)}
                              >
                                {expandedSchedule === sp.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                            </Box>
                </TableCell>
                <TableCell>
                            <Chip 
                              label={sp.status === 'working' ? 'Работает' : sp.status === 'suspended' ? 'Приостановлено' : 'Закрыто'} 
                              color={sp.status === 'working' ? 'success' : sp.status === 'suspended' ? 'warning' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Редактировать">
                              <IconButton onClick={() => handleOpen(sp)}>
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Удалить">
                              <IconButton onClick={() => setDeleteId(sp.id)}>
                                <Delete />
                              </IconButton>
                            </Tooltip>
                </TableCell>
              </TableRow>
                        
                        {/* Expanded schedule row */}
                        {expandedSchedule === sp.id && sp.working_hours && (
                          <TableRow>
                            <TableCell colSpan={8} sx={{ py: 1, px: 2 }}>
                              <Paper elevation={0} sx={{ backgroundColor: '#f5f5f5', p: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  График работы
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
                                  <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                    {formatDay('monday', sp.working_hours.monday)}
                                    {formatDay('tuesday', sp.working_hours.tuesday)}
                                    {formatDay('wednesday', sp.working_hours.wednesday)}
                                    {formatDay('thursday', sp.working_hours.thursday)}
                                  </Box>
                                  <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                    {formatDay('friday', sp.working_hours.friday)}
                                    {formatDay('saturday', sp.working_hours.saturday)}
                                    {formatDay('sunday', sp.working_hours.sunday)}
                                  </Box>
                                </Box>
                              </Paper>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))
                  )}
          </TableBody>
        </Table>
      </TableContainer>
          </Paper>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="body2" color="textSecondary">
              Всего: {filteredServicePoints.length} из {servicePoints.length} точек
            </Typography>
          </Box>
        </>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Point' : 'Add Point'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Область"
              name="region"
              value={form.region}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              select
              label="Partner"
              name="partner_id"
              value={form.partner_id}
              onChange={handleChange}
              fullWidth
              margin="normal"
            >
              <MenuItem value={0}>-</MenuItem>
              {partners.map((p: any) => (
                <MenuItem key={p.id} value={p.id}>{p.name || p.company_name}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              minRows={2}
            />
            <TextField
              label="Contact Info"
              name="contact_info"
              value={form.contact_info}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              minRows={2}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={form.status}
                onChange={handleStatusChange}
                label="Status"
              >
                <MenuItem value="working">Working</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
              <FormHelperText>Current status of this service point</FormHelperText>
            </FormControl>
            <Box mt={2} mb={1}>
              <Typography variant="subtitle1">Working Hours</Typography>
              {(['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as (keyof WorkingHours)[]).map(day => (
                <Box key={day} display="flex" alignItems="center" mb={1}>
                  <Typography sx={{ width: 90, mr: 1 }}>
                    {{
                      monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
                    }[day]}
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={typeof form.working_hours[day] === 'string' ? 'выходной' : 'рабочий'}
                    onChange={e => handleWorkingHoursChange(day, 'status', e.target.value)}
                    sx={{ width: 120, mr: 1 }}
                  >
                    <MenuItem value="рабочий">Рабочий</MenuItem>
                    <MenuItem value="выходной">Выходной</MenuItem>
                  </TextField>
                  {typeof form.working_hours[day] !== 'string' && (
                    <>
                      <TextField
                        label="from"
                        size="small"
                        type="time"
                        value={(form.working_hours[day] as WorkingHoursDay).open}
                        onChange={e => handleWorkingHoursChange(day, 'open', e.target.value)}
                        sx={{ width: 110, mr: 1 }}
                        inputProps={{ step: 300 }}
                      />
                      <TextField
                        label="to"
                        size="small"
                        type="time"
                        value={(form.working_hours[day] as WorkingHoursDay).close}
                        onChange={e => handleWorkingHoursChange(day, 'close', e.target.value)}
                        sx={{ width: 110 }}
                        inputProps={{ step: 300 }}
                      />
                    </>
                  )}
                </Box>
              ))}
            </Box>
            <Box mt={2} mb={1}>
              <Typography variant="subtitle1">Offered Services</Typography>
              <TextField
                select
                SelectProps={{ multiple: true }}
                label="Services"
                value={form.services}
                onChange={handleServiceSelect}
                fullWidth
                margin="normal"
              >
                {servicesList.map((s: any) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </TextField>
              {form.services.map((id: number) => {
                const service = servicesList.find((s: any) => s.id === id);
                return (
                  <Box key={id} display="flex" alignItems="center" mb={1}>
                    <Typography sx={{ minWidth: 120 }}>{service?.name}</Typography>
                    <TextField
                      label="Service Comment"
                      value={(form.service_comments.find((sc: any) => sc.service_id === id)?.comment) || ''}
                      onChange={e => handleServiceCommentChange(id, e.target.value)}
                      sx={{ ml: 2, flex: 1 }}
                      size="small"
                    />
                  </Box>
                );
              })}
            </Box>
            <Box mt={2} mb={1}>
              <Typography variant="subtitle1">Posts</Typography>
              {Array.isArray(form.service_posts) ? form.service_posts.map((post, idx) => (
                <Box key={idx} display="flex" alignItems="center" mb={1}>
                  <TextField
                    label="Name"
                    value={post.name}
                    onChange={e => handlePostChange(idx, 'name', e.target.value)}
                    sx={{ width: 120, mr: 1 }}
                  />
                  <TextField
                    select
                    label="Interval (min)"
                    value={post.service_time_minutes}
                    onChange={e => handlePostChange(idx, 'service_time_minutes', Number(e.target.value))}
                    sx={{ width: 120, mr: 1 }}
                  >
                    {[...Array(22)].map((_, i) => {
                      const val = 15 + i * 5;
                      return <MenuItem key={val} value={val}>{val}</MenuItem>;
                    })}
                  </TextField>
                  <TextField
                    label="Start"
                    type="time"
                    value={post.start || '09:00'}
                    onChange={e => handlePostChange(idx, 'start', e.target.value)}
                    sx={{ width: 110, mr: 1 }}
                    inputProps={{ step: 300 }}
                  />
                  <TextField
                    label="End"
                    type="time"
                    value={post.end || '18:00'}
                    onChange={e => handlePostChange(idx, 'end', e.target.value)}
                    sx={{ width: 110, mr: 1 }}
                    inputProps={{ step: 300 }}
                  />
                  <IconButton color="error" onClick={() => handleRemovePost(idx)} disabled={form.service_posts.length === 1}>×</IconButton>
                </Box>
              )) : (
                <Typography color="error">Error loading post data</Typography>
              )}
              <Button 
                variant="outlined" 
                onClick={handleAddPost} 
                sx={{ mt: 1 }}
              >
                Add Post
              </Button>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Number of posts: {Array.isArray(form.service_posts) ? form.service_posts.length : 0}
              </Typography>
            </Box>
            <Box mt={2} mb={1}>
              <Typography variant="subtitle2">Slots Calculation (preview):</Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {slotsPreview && typeof slotsPreview === 'object' ? (
                  Object.entries(slotsPreview)
                  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
                  .map(([time, count]) => (
                    <Chip key={time} label={`${time} — ${count}`} />
                    ))
                ) : (
                  <Typography variant="body2">No available slots</Typography>
                )}
              </Box>
            </Box>
            <Box mt={2} mb={1}>
              <Typography variant="subtitle1">Photos (up to 10)</Typography>
              <PhotoGalleryUploader
                servicePointId={editId || 0}
                photos={form.images.map((file: any, index: number) => ({
                  id: file.id || `image-${index}-${Date.now()}`,
                  path: file.path || URL.createObjectURL(file),
                  url: file.url
                }))}
                maxPhotos={10}
                disabled={!editId}
                onPhotosChange={(photos: Array<{ id: number | string; path: string; url?: string }>) => {
                  setForm(prev => ({
                    ...prev,
                    images: photos
                  }));
                }}
              />
            </Box>
            <Box mt={2} mb={1}>
              <FileUploader
                files={form.price_lists.map((file: any, index: number) => ({
                  path: file.path || '',
                  url: file.url,
                  name: file.name,
                  id: file.id || `price-list-${index}-${Date.now()}`
                }))}
                maxFiles={3}
                accept=".pdf,.xls,.xlsx"
                maxSizeMB={10}
                disabled={!editId}
                onFilesChange={(files: Array<{ path: string; url?: string; name?: string; id?: string | number }>) => {
                  setForm(prev => ({
                    ...prev,
                    price_lists: files
                  }));
                }}
                onRemoveFile={(filename: string) => {
                  console.log('Removing file:', filename);
                  // Удаляем только по имени файла, без полного пути
                  setForm(prev => ({
                    ...prev,
                    price_lists: prev.price_lists.filter((f: any) => {
                      // Проверяем по имени файла, а не по полному пути
                      const filePath = f.path || '';
                      const filePathName = filePath.split('/').pop();
                      const fileUrl = f.url || '';
                      const fileUrlName = fileUrl.split('/').pop();
                      
                      // Если любое из имен файлов совпадает, исключаем файл
                      return filePathName !== filename && 
                             fileUrlName !== filename &&
                             f.name !== filename;
                    })
                  }));
                }}
                title="Price Lists (PDF, Excel)"
                buttonText="Upload Price List"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Point?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServicePointsPage;