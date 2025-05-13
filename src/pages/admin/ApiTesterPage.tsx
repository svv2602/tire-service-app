import React from 'react';
import { Container } from '@mui/material';
import ApiTester from '../../components/ApiTester';

const ApiTesterPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <ApiTester />
    </Container>
  );
};

export default ApiTesterPage;