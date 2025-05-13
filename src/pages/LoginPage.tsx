import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { login, setAuthState } from '../store/slices/authSlice';
import { RootState } from '../store';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { getCsrfToken, loginWithoutCsrf, testLogin, pingServer, superDirectLogin } from '../utils/axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [localError, setLocalError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<string>('checking');
  const [loginMethod, setLoginMethod] = useState<string>('super-direct'); // Default to super-direct login
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  // Check server status on component load
  useEffect(() => {
    const checkServer = async () => {
      try {
        const isServerUp = await pingServer();
        setServerStatus(isServerUp ? 'online' : 'offline');
      } catch (error) {
        console.error('Error checking server status:', error);
        setServerStatus('offline');
      }
    };
    checkServer();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (credentials.email.trim() === '' || credentials.password.trim() === '') {
      setLocalError('Пожалуйста, введите email и пароль');
      return;
    }
    
    console.log('Starting authentication with credentials:', { email: credentials.email, passwordLength: credentials.password.length });
    console.log('Using login method:', loginMethod);
    
    try {
      // Set loading state manually
      dispatch({ type: 'auth/login/pending' });
      
      // Try the selected login method
      if (loginMethod === 'super-direct') {
        // Super direct login
        try {
          const loginData = await superDirectLogin(credentials);
          console.log('Super direct login successful:', loginData);
          dispatch(setAuthState({
            token: loginData.token,
            user: loginData.user
          }));
          navigate('/admin/bookings');
          return;
        } catch (error: any) {
          console.error('Super direct login failed:', error);
          setLocalError('Супер-прямой вход не удался. Попробуйте экстренный метод.');
        }
      } else if (loginMethod === 'emergency') {
        // Emergency test login
        try {
          const testLoginData = await testLogin(credentials);
          console.log('Emergency login successful:', testLoginData);
          dispatch(setAuthState({
            token: testLoginData.token,
            user: testLoginData.user
          }));
          navigate('/admin/bookings');
          return;
        } catch (testLoginError: any) {
          console.error('Emergency login failed:', testLoginError);
          setLocalError('Экстренный вход не удался. Попробуйте другой метод.');
        }
      } else if (loginMethod === 'direct') {
        // Direct login (bypassing CSRF)
        try {
          const directLoginData = await loginWithoutCsrf(credentials);
          console.log('Direct login successful:', directLoginData);
          dispatch(setAuthState(directLoginData));
          navigate('/admin/bookings');
          return;
        } catch (directLoginError: any) {
          console.error('Direct login failed:', directLoginError);
          setLocalError('Прямой вход не сработал. Попробуйте стандартный вход.');
        }
      } else if (loginMethod === 'normal') {
        // Try to get CSRF token first
        try {
          await getCsrfToken();
          console.log('CSRF token received successfully, proceeding with login');
          
          const result = await dispatch(login(credentials)).unwrap().catch((err: any) => {
            console.error('Error dispatching login:', err);
            setLocalError(err.message || 'Authentication error');
            return null;
          });
          
          if (result) {
            console.log('Authentication successful, redirecting...', result);
            navigate('/admin/bookings');
            return;
          }
        } catch (csrfError: any) {
          console.error('CSRF token retrieval failed:', csrfError.message);
          setLocalError('CSRF проблема. Попробуйте другой способ входа.');
        }
      }
      
      // If we got here, clear loading state
      dispatch({ type: 'auth/login/rejected', payload: localError || 'Вход не удался' });
      
    } catch (err: any) {
      console.error('Authentication error in catch block:', err);
      setLocalError(err.message || 'Connection error');
      dispatch({ type: 'auth/login/rejected', payload: err.message || 'Ошибка соединения' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const displayError = localError || error;

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            Вход в систему
          </Typography>
          
          {serverStatus === 'checking' && (
            <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
              Проверка соединения с сервером...
            </Alert>
          )}
          
          {serverStatus === 'offline' && (
            <Alert severity="warning" sx={{ width: '100%', mb: 2 }}>
              Сервер недоступен. Проверьте подключение.
            </Alert>
          )}
          
          {displayError && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {displayError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={credentials.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
            />
            
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Метод входа:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <Link 
                  component="button" 
                  type="button"
                  variant="body2" 
                  onClick={() => setLoginMethod('normal')}
                  sx={{ 
                    mb: 1,
                    textDecoration: loginMethod === 'normal' ? 'underline' : 'none',
                    fontWeight: loginMethod === 'normal' ? 'bold' : 'normal'
                  }}
                >
                  Стандартный
                </Link>
                <Link 
                  component="button" 
                  type="button"
                  variant="body2" 
                  onClick={() => setLoginMethod('direct')}
                  sx={{ 
                    mb: 1,
                    textDecoration: loginMethod === 'direct' ? 'underline' : 'none',
                    fontWeight: loginMethod === 'direct' ? 'bold' : 'normal'
                  }}
                >
                  Прямой
                </Link>
                <Link 
                  component="button" 
                  type="button"
                  variant="body2" 
                  onClick={() => setLoginMethod('emergency')}
                  sx={{ 
                    mb: 1,
                    textDecoration: loginMethod === 'emergency' ? 'underline' : 'none',
                    fontWeight: loginMethod === 'emergency' ? 'bold' : 'normal'
                  }}
                >
                  Экстренный
                </Link>
                <Link 
                  component="button" 
                  type="button"
                  variant="body2" 
                  onClick={() => setLoginMethod('super-direct')}
                  sx={{ 
                    mb: 1,
                    color: 'secondary.main',
                    textDecoration: loginMethod === 'super-direct' ? 'underline' : 'none',
                    fontWeight: loginMethod === 'super-direct' ? 'bold' : 'normal'
                  }}
                >
                  Супер-прямой
                </Link>
              </Box>
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  Вход... <CircularProgress size={20} sx={{ ml: 1 }} color="inherit" />
                </>
              ) : (
                'Войти'
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;