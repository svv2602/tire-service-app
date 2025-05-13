import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { Typography } from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface StatusChange {
  id: number;
  status: string;
  timestamp: string;
  userId: number;
  userName: string;
}

interface BookingStatusHistoryProps {
  history: StatusChange[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'grey';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Завершено';
    case 'pending':
      return 'Ожидает';
    case 'cancelled':
      return 'Отменено';
    default:
      return status;
  }
};

const BookingStatusHistory: React.FC<BookingStatusHistoryProps> = ({ history }) => {
  return (
    <Timeline>
      {history.map((change, index) => (
        <TimelineItem key={change.id}>
          <TimelineSeparator>
            <TimelineDot color={getStatusColor(change.status)} />
            {index < history.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="body2" color="text.secondary">
              {format(new Date(change.timestamp), 'PPp', { locale: ru })}
            </Typography>
            <Typography>
              Статус изменен на "{getStatusText(change.status)}"
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {change.userName}
            </Typography>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default BookingStatusHistory;