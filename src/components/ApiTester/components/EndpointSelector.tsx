import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Chip,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { ApiEndpoint } from '../../../data/apiEndpoints';

interface EndpointSelectorProps {
  groupedEndpoints: Map<string, ApiEndpoint[]>;
  onSelect: (endpoint: ApiEndpoint) => void;
  selectedEndpoint: ApiEndpoint | null;
}

const EndpointSelector: React.FC<EndpointSelectorProps> = ({
  groupedEndpoints,
  onSelect,
  selectedEndpoint
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const handleGroupExpand = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    // Если есть поисковый запрос, раскрываем все группы
    if (value) {
      const allGroups = new Set([...groupedEndpoints.keys()]);
      setExpandedGroups(allGroups);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setExpandedGroups(new Set());
  };

  const filterEndpoints = (endpoints: ApiEndpoint[]) => {
    if (!searchTerm) return endpoints;
    
    return endpoints.filter(endpoint => 
      endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getMethodColor = (method: string): "info" | "success" | "warning" | "error" | "default" => {
    switch (method.toUpperCase()) {
      case 'GET': return "info";
      case 'POST': return "success";
      case 'PUT': return "warning";
      case 'DELETE': return "error";
      default: return "default";
    }
  };

  return (
    <Box>
      <TextField
        fullWidth
        placeholder="Поиск API endpoint..."
        value={searchTerm}
        onChange={handleSearch}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchTerm ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={clearSearch}
                edge="end"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ) : null
        }}
      />

      {Array.from(groupedEndpoints.entries()).map(([group, endpoints]) => {
        const filteredEndpoints = filterEndpoints(endpoints);
        if (filteredEndpoints.length === 0) return null;

        return (
          <Accordion
            key={group}
            expanded={expandedGroups.has(group)}
            onChange={() => handleGroupExpand(group)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                {group} ({filteredEndpoints.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {filteredEndpoints.map((endpoint) => (
                  <Box
                    key={`${endpoint.method}-${endpoint.path}`}
                    onClick={() => onSelect(endpoint)}
                    sx={{
                      p: 1,
                      border: '1px solid',
                      borderColor: selectedEndpoint?.path === endpoint.path ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'translateX(4px)'
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={endpoint.method}
                        color={getMethodColor(endpoint.method)}
                        size="small"
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace',
                          flex: 1
                        }}
                      >
                        {endpoint.path}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {endpoint.description}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default EndpointSelector;