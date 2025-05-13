import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import {
  BookOnline as BookingIcon,
  Group as PartnersIcon,
  Done as CompletedIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { GridContainer, GridItem } from '../../components/ui/GridComponents';

const StatCard = ({ title, value, icon, color }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ p: 1, borderRadius: 1, bgcolor: `${color}15`, mr: 2 }}>
          <Box sx={{ color }}>{icon}</Box>
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ textAlign: 'right' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const bookings = useSelector((state: RootState) => state.bookings.items);
  const partners = useSelector((state: RootState) => state.partners.items);

  const stats = {
    totalBookings: bookings.length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    activePartners: partners.filter(p => p.status === 'active').length,
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Панель управления
      </Typography>

      <GridContainer spacing={3}>
        <GridItem xs={12} sm={6} lg={3}>
          <StatCard
            title="Всего записей"
            value={stats.totalBookings}
            icon={<BookingIcon />}
            color="#2196F3"
          />
        </GridItem>
        <GridItem xs={12} sm={6} lg={3}>
          <StatCard
            title="Завершенные"
            value={stats.completedBookings}
            icon={<CompletedIcon />}
            color="#4CAF50"
          />
        </GridItem>
        <GridItem xs={12} sm={6} lg={3}>
          <StatCard
            title="Ожидающие"
            value={stats.pendingBookings}
            icon={<PendingIcon />}
            color="#FF9800"
          />
        </GridItem>
        <GridItem xs={12} sm={6} lg={3}>
          <StatCard
            title="Активные партнеры"
            value={stats.activePartners}
            icon={<PartnersIcon />}
            color="#9C27B0"
          />
        </GridItem>

        <GridItem xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Последние обновления
            </Typography>
            {/* Здесь будет добавлен список последних активностей */}
          </Paper>
        </GridItem>
      </GridContainer>
    </Box>
  );
};

export default DashboardPage;