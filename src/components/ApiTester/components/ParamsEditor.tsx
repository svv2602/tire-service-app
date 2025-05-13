import React from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Stack
} from '@mui/material';
import { ApiParam } from '../../../data/apiEndpoints';
import RequestParams from './RequestParams';

interface ParamsEditorProps {
  pathParams: ApiParam[];
  queryParams: ApiParam[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

const ParamsEditor: React.FC<ParamsEditorProps> = ({
  queryParams = [],
  pathParams = [],
  values,
  onChange
}) => {
  const [activeTab, setActiveTab] = React.useState(pathParams.length > 0 ? 0 : 1);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Если нет параметров, не отображаем компонент
  if (pathParams.length === 0 && queryParams.length === 0) {
    return null;
  }

  // Если есть только один тип параметров, не показываем вкладки
  if (pathParams.length > 0 && queryParams.length === 0) {
    return (
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Path Parameters
        </Typography>
        <RequestParams
          parameters={pathParams}
          values={values}
          onChange={onChange}
        />
      </Box>
    );
  }

  if (queryParams.length > 0 && pathParams.length === 0) {
    return (
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Query Parameters
        </Typography>
        <RequestParams
          parameters={queryParams}
          values={values}
          onChange={onChange}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 2 }}
      >
        {pathParams.length > 0 && (
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>Path Parameters</Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'primary.contrastText',
                    px: 1,
                    borderRadius: 1
                  }}
                >
                  {pathParams.length}
                </Typography>
              </Box>
            }
          />
        )}
        {queryParams.length > 0 && (
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>Query Parameters</Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'primary.contrastText',
                    px: 1,
                    borderRadius: 1
                  }}
                >
                  {queryParams.length}
                </Typography>
              </Box>
            }
          />
        )}
      </Tabs>

      {activeTab === 0 && pathParams.length > 0 && (
        <RequestParams
          parameters={pathParams}
          values={values}
          onChange={onChange}
        />
      )}

      {activeTab === 1 && queryParams.length > 0 && (
        <RequestParams
          parameters={queryParams}
          values={values}
          onChange={onChange}
        />
      )}
    </Box>
  );
};

export default ParamsEditor;