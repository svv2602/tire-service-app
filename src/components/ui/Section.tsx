import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Container, BoxProps, alpha, useTheme } from '@mui/material';
import { Theme } from '@mui/system';

// Define maxWidth type to match what Container accepts
type MaxWidthType = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;

// Create our own props interface instead of extending BoxProps
export interface SectionProps {
  title?: string;
  subtitle?: string;
  fullWidth?: boolean;
  maxWidth?: MaxWidthType;
  children?: React.ReactNode;
  background?: 'default' | 'paper' | 'gradient' | 'light' | 'dark';
  textAlign?: 'left' | 'center' | 'right';
  divider?: boolean;
  withAnimation?: boolean;
  sx?: BoxProps['sx'];
  // Add any other BoxProps you need
  className?: string;
  id?: string;
}

const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  fullWidth = false,
  maxWidth = 'lg',
  children,
  background = 'default',
  textAlign = 'left',
  divider = false,
  withAnimation = true,
  sx,
  className,
  id,
  ...rest
}) => {
  const theme = useTheme();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  const getBackgroundStyles = () => {
    switch (background) {
      case 'paper':
        return {
          backgroundColor: theme.palette.background.paper,
        };
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
        };
      case 'light':
        return {
          backgroundColor: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.background.paper, 0.7)
            : alpha(theme.palette.background.paper, 0.5),
        };
      case 'dark':
        return {
          backgroundColor: theme.palette.mode === 'dark' 
            ? alpha('#000', 0.4)
            : alpha('#333', 0.05),
        };
      default:
        return {
          backgroundColor: theme.palette.background.default,
        };
    }
  };
  
  const getAnimationStyles = () => {
    if (!withAnimation) return {};
    
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
      transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
    };
  };
  
  return (
    <Box
      ref={sectionRef}
      sx={{
        py: 6,
        position: 'relative',
        borderBottom: divider ? `1px solid ${theme.palette.divider}` : 'none',
        ...getBackgroundStyles(),
        ...(sx as any),
      }}
      className={className}
      id={id}
    >
      {background === 'gradient' && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-10%',
              right: '-5%',
              width: '30%',
              height: '30%',
              borderRadius: '50%',
              background: alpha(theme.palette.primary.main, 0.08),
              filter: 'blur(80px)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-5%',
              left: '-5%',
              width: '25%',
              height: '25%',
              borderRadius: '50%',
              background: alpha(theme.palette.secondary.main, 0.06),
              filter: 'blur(60px)',
            },
          }}
        />
      )}
      
      <Container 
        maxWidth={maxWidth} 
        disableGutters={fullWidth}
        sx={{ 
          position: 'relative',
          zIndex: 1,
          ...getAnimationStyles(),
        }}
      >
        {(title || subtitle) && (
          <Box 
            sx={{ 
              mb: 4, 
              textAlign, 
              display: 'flex',
              flexDirection: 'column',
              alignItems: textAlign === 'center' ? 'center' : 
                          textAlign === 'right' ? 'flex-end' : 'flex-start',
            }}
          >
            {title && (
              <Typography 
                variant="h4" 
                component="h2"
                sx={{ 
                  mb: subtitle ? 1 : 0,
                  fontWeight: 700,
                  background: theme.palette.mode === 'dark' 
                    ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                    : 'inherit',
                  backgroundClip: theme.palette.mode === 'dark' ? 'text' : 'inherit',
                  color: theme.palette.mode === 'dark' ? 'transparent' : theme.palette.text.primary,
                }}
              >
                {title}
              </Typography>
            )}
            
            {subtitle && (
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
                sx={{ 
                  maxWidth: textAlign === 'center' ? '70%' : '100%',
                  alignSelf: textAlign === 'center' ? 'center' : 'inherit',
                }}
              >
                {subtitle}
              </Typography>
            )}
            
            {title && (
              <Box 
                sx={{ 
                  mt: 1.5,
                  width: 60,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: theme.palette.primary.main,
                  backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              />
            )}
          </Box>
        )}
        
        {children}
      </Container>
    </Box>
  );
};

export default Section; 