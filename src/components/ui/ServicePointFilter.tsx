import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchRegions, 
  fetchCitiesByRegion, 
  fetchFilteredServicePoints, 
  setSelectedRegion,
  setSelectedCity,
  fetchServicePoints
} from '../../store/slices/servicePointsSlice';
import { RootState, AppDispatch } from '../../store';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Paper,
  SelectChangeEvent
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { GridContainer, GridItem } from './GridComponents';
import type { ServicePoint } from '../../types';

interface ServicePointFilterProps {
  onDirectFilterChange?: (filteredPoints: ServicePoint[] | null) => void;
}

const ServicePointFilter: React.FC<ServicePointFilterProps> = ({ onDirectFilterChange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    regions, 
    cities, 
    selectedRegion, 
    selectedCity,
    isLoading 
  } = useSelector((state: RootState) => state.servicePoints);

  // Add reset flag to track when we've reset filters
  const [justReset, setJustReset] = useState(false);

  // Fetch regions on component mount
  useEffect(() => {
    dispatch(fetchRegions());
  }, [dispatch]);

  // Fetch cities based on selected region or all cities if no region selected
  useEffect(() => {
    if (selectedRegion) {
      dispatch(fetchCitiesByRegion(selectedRegion));
    } else {
      dispatch(fetchCitiesByRegion('all'));
    }
  }, [selectedRegion, dispatch]);

  // Force load all service points on component mount
  useEffect(() => {
    console.log('ServicePointFilter mounted - fetching all service points including inactive');
    dispatch(fetchServicePoints());
  }, [dispatch]);

  const handleRegionChange = (e: SelectChangeEvent<string>) => {
    const region = e.target.value || null;
    dispatch(setSelectedRegion(region));
    
    // If the region changes, we reset the city selection
    // This is because the cities are filtered by region
    if (selectedCity) {
      dispatch(setSelectedCity(null));
    }
  };

  const handleCityChange = (e: SelectChangeEvent<string>) => {
    const city = e.target.value || null;
    dispatch(setSelectedCity(city));
  };

  const handleClearFilters = () => {
    setJustReset(true);
    dispatch(setSelectedRegion(null));
    dispatch(setSelectedCity(null));
    
    // Force reload all service points to ensure we have everything
    dispatch(fetchServicePoints());
    
    // Reset the flag after a delay
    setTimeout(() => {
      setJustReset(false);
    }, 1000);
  };

  // Custom styles for filter container
  const filterContainerStyle = {
    minWidth: '220px', // Fixed minimum width for filters
    maxWidth: '100%'   // But still responsive
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box>
        <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Фильтр по локации</Typography>
          <Button 
            startIcon={<ClearIcon />} 
            onClick={handleClearFilters}
            disabled={!selectedRegion && !selectedCity}
            size="small"
          >
            Сбросить фильтры
          </Button>
        </Box>
        <GridContainer spacing={2}>
          <GridItem xs={12} sm={6}>
            <FormControl fullWidth style={filterContainerStyle}>
              <InputLabel id="region-filter-label">Регион</InputLabel>
              <Select
                labelId="region-filter-label"
                value={selectedRegion || ''}
                onChange={handleRegionChange}
                label="Регион"
              >
                <MenuItem value="">Все регионы</MenuItem>
                {regions.map((region) => (
                  <MenuItem key={region} value={region}>
                    {region}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </GridItem>
          
          <GridItem xs={12} sm={6}>
            <FormControl fullWidth style={filterContainerStyle}>
              <InputLabel id="city-filter-label">Город</InputLabel>
              <Select
                labelId="city-filter-label"
                value={selectedCity || ''}
                onChange={handleCityChange}
                label="Город"
                disabled={!selectedRegion}
              >
                <MenuItem value="">Все города</MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </GridItem>
        </GridContainer>
      </Box>
    </Paper>
  );
};

export default ServicePointFilter; 