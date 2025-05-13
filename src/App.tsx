import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline, GlobalStyles as MuiGlobalStyles } from '@mui/material';
import GlobalStyles from './components/GlobalStyles';
import { store } from './store';
import AdminLayout from './components/layout/AdminLayout';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './pages/admin/DashboardPage';
import BookingsPage from './pages/admin/BookingsPage';
import PartnersPage from './pages/admin/PartnersPage';
import ServicePointsPage from './pages/admin/ServicePointsPage';
import ServicesPage from './pages/admin/ServicesPage';
import ServicesDiagnosticPage from './pages/admin/ServicesDiagnosticPage';
import ApiTesterPage from './pages/admin/ApiTesterPage';
import LoginPage from './pages/LoginPage';
import NewBookingPage from './pages/client/NewBookingPage';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import CitySelectionPage from './pages/client/CitySelectionPage';
import ServicePointSelectionPage from './pages/client/ServicePointSelectionPage';
import DateSelectionPage from './pages/client/DateSelectionPage';
import TimeSelectionPage from './pages/client/TimeSelectionPage';
import AppointmentFormPage from './pages/client/AppointmentFormPage';
import AppointmentSuccessPage from './pages/client/AppointmentSuccessPage';
import Notifications from './components/ui/Notifications';
import { lightThemeOptions, darkThemeOptions } from './theme';
import { createTheme } from '@mui/material/styles';

// Обновим интерфейс для Layout для поддержки темной темы
// Это можно было бы сделать в файле компонента, но добавим здесь временно
type LayoutPropsWithTheme = React.ComponentProps<typeof Layout> & {
  toggleThemeMode?: () => void;
  isDarkMode?: boolean;
};

const EnhancedLayout: React.FC<LayoutPropsWithTheme> = (props) => {
  return <Layout {...props} />;
};

// Компонент для добавления глобальных стилей плавного перехода
const ThemeTransitionStyles = () => (
  <MuiGlobalStyles
    styles={{
      '@import': 'url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap")',
      '*, *::before, *::after': {
        transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
      },
      'body': {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      }
    }}
  />
);

const App: React.FC = () => {
  // Получаем сохранённый режим темы из localStorage или используем темную тему по умолчанию
  const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark' | null;
  const [mode, setMode] = useState<'light' | 'dark'>(savedMode || 'dark');

  // Создание темы на основе выбранного режима
  const currentTheme = useMemo(() => {
    return createTheme(mode === 'light' ? lightThemeOptions : darkThemeOptions);
  }, [mode]);

  // Функция для переключения режима темы
  const toggleThemeMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  // Также проверяем предпочтения системы при первой загрузке, если нет сохраненных предпочтений
  useEffect(() => {
    if (!savedMode) {
      // По умолчанию устанавливаем темную тему, но все равно проверяем системные настройки
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (!prefersDarkMode) {
        // Если система предпочитает светлую тему, то можем изменить на светлую
        setMode('light');
        localStorage.setItem('themeMode', 'light');
      } else {
        // Иначе оставляем темную как по умолчанию
        localStorage.setItem('themeMode', 'dark');
      }
    }
  }, [savedMode]);

  return (
    <Provider store={store}>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <GlobalStyles />
        <ThemeTransitionStyles />
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <AdminLayout toggleThemeMode={toggleThemeMode} isDarkMode={mode === 'dark'}>
                      <Routes>
                        <Route index element={<DashboardPage />} />
                        <Route path="bookings" element={<BookingsPage />} />
                        <Route path="partners" element={<PartnersPage />} />
                        <Route path="service-points" element={<ServicePointsPage />} />
                        <Route path="services" element={<ServicesPage />} />
                        <Route path="services-diagnostic" element={<ServicesDiagnosticPage />} />
                        <Route path="test-api" element={<ApiTesterPage />} />
                      </Routes>
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Wrap only client routes in EnhancedLayout with footer */}
              <Route element={<EnhancedLayout toggleThemeMode={toggleThemeMode} isDarkMode={mode === 'dark'} />}>
                <Route path="/new-booking" element={<NewBookingPage />} />
                <Route path="/booking" element={<CitySelectionPage />} />
                <Route path="/booking/service-points" element={<ServicePointSelectionPage />} />
                <Route path="/booking/date-selection" element={<DateSelectionPage />} />
                <Route path="/booking/time-selection" element={<TimeSelectionPage />} />
                <Route path="/booking/appointment-form" element={<AppointmentFormPage />} />
                <Route path="/booking/success" element={<AppointmentSuccessPage />} />
                <Route path="/" element={<Navigate to="/admin" replace />} />
              </Route>
            </Routes>
            <Notifications />
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
