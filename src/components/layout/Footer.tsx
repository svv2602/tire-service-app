import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Link, 
  Divider, 
  useTheme, 
  alpha,
  IconButton,
  Stack
} from '@mui/material';
import { 
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Telegram as TelegramIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  KeyboardArrowUp as ArrowUpIcon
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.mode === 'dark' 
          ? alpha(theme.palette.background.paper, 0.9)
          : theme.palette.grey[100],
        position: 'relative',
        overflow: 'hidden',
        mt: 'auto', // Push to bottom when content is small
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-10%',
          width: '120%',
          height: '1px',
          background: `linear-gradient(90deg, 
            transparent, 
            ${alpha(theme.palette.primary.main, 0.3)}, 
            ${alpha(theme.palette.primary.main, 0.5)}, 
            ${alpha(theme.palette.primary.main, 0.3)}, 
            transparent)`,
        },
      }}
    >
      {/* Background styling elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-30%',
          right: '-10%',
          width: '30%',
          height: '60%',
          borderRadius: '50%',
          background: alpha(theme.palette.primary.main, 0.03),
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-20%',
          left: '-5%',
          width: '25%',
          height: '50%',
          borderRadius: '50%',
          background: alpha(theme.palette.secondary.main, 0.03),
          filter: 'blur(70px)',
          zIndex: 0,
        }}
      />
      
      {/* Back to top button */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
        }}
      >
        <IconButton
          onClick={scrollToTop}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              transform: 'translateY(-3px)',
              boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
            },
          }}
        >
          <ArrowUpIcon />
        </IconButton>
      </Box>
      
      <Container 
        maxWidth="lg" 
        sx={{ position: 'relative', zIndex: 1, pt: 8, pb: 4 }}
      >
        {/* Footer Content */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 4
        }}>
          {/* Company Information */}
          <Box sx={{ 
            width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.33% - 16px)' } 
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Шиномонтаж
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Мы предоставляем высококачественные услуги шиномонтажа и ремонта шин.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <IconButton 
                size="small" 
                aria-label="Facebook"
                sx={{ 
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                aria-label="Instagram"
                sx={{ 
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                aria-label="Telegram" 
                sx={{ 
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                <TelegramIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
          
          {/* Quick Links */}
          <Box sx={{ 
            width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(16.67% - 16px)' } 
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1rem' }}>
              Ссылки
            </Typography>
            <Box component="ul" sx={{ pl: 0, listStyle: 'none' }}>
              {['Главная', 'О нас', 'Услуги', 'Цены', 'Контакты'].map((item) => (
                <Box component="li" key={item} sx={{ mb: 1.5 }}>
                  <Link 
                    href="#" 
                    underline="none"
                    sx={{ 
                      color: theme.palette.text.secondary,
                      transition: 'all 0.2s',
                      display: 'inline-block',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -1,
                        left: 0,
                        width: 0,
                        height: 1,
                        backgroundColor: theme.palette.primary.main,
                        transition: 'width 0.3s ease',
                      },
                      '&:hover': {
                        color: theme.palette.primary.main,
                        '&::after': {
                          width: '100%',
                        },
                      },
                    }}
                  >
                    {item}
                  </Link>
                </Box>
              ))}
            </Box>
          </Box>
          
          {/* Services */}
          <Box sx={{ 
            width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(25% - 16px)' } 
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1rem' }}>
              Услуги
            </Typography>
            <Box component="ul" sx={{ pl: 0, listStyle: 'none' }}>
              {['Шиномонтаж', 'Балансировка', 'Ремонт шин', 'Сезонное хранение', 'Продажа шин'].map((item) => (
                <Box component="li" key={item} sx={{ mb: 1.5 }}>
                  <Link 
                    href="#" 
                    underline="none"
                    sx={{ 
                      color: theme.palette.text.secondary,
                      transition: 'all 0.2s',
                      display: 'inline-block',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -1,
                        left: 0,
                        width: 0,
                        height: 1,
                        backgroundColor: theme.palette.primary.main,
                        transition: 'width 0.3s ease',
                      },
                      '&:hover': {
                        color: theme.palette.primary.main,
                        '&::after': {
                          width: '100%',
                        },
                      },
                    }}
                  >
                    {item}
                  </Link>
                </Box>
              ))}
            </Box>
          </Box>
          
          {/* Contact Info */}
          <Box sx={{ 
            width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(25% - 16px)' } 
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1rem' }}>
              Контакты
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', mb: 1.5, alignItems: 'center' }}>
                <LocationIcon 
                  fontSize="small" 
                  sx={{ mr: 1, color: theme.palette.text.secondary }}
                />
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Центральный офис, ул. Примерная, 123
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', mb: 1.5, alignItems: 'center' }}>
                <PhoneIcon 
                  fontSize="small" 
                  sx={{ mr: 1, color: theme.palette.text.secondary }}
                />
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  (123) 456-7890
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon 
                  fontSize="small" 
                  sx={{ mr: 1, color: theme.palette.text.secondary }}
                />
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  info@shino-service.com
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* Footer Bottom / Copyright */}
        <Divider sx={{ 
          my: 4, 
          opacity: 0.2,
          background: `linear-gradient(90deg, 
            transparent, 
            ${theme.palette.text.secondary}, 
            transparent)`,
        }} />
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Шиномонтаж. Все права защищены.
          </Typography>
          <Box>
            <Link href="#" underline="none" sx={{ color: theme.palette.text.secondary, mr: 2 }}>
              Условия использования
            </Link>
            <Link href="#" underline="none" sx={{ color: theme.palette.text.secondary }}>
              Политика конфиденциальности
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 