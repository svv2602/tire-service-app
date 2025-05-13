// Вспомогательные генераторы для сервисных тестов и демо-данных
import { AvailableDay, TimeSlot } from '../types';

export const generateDummyAvailableDays = (): AvailableDay[] => {
  const result: AvailableDay[] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + 14); // +2 недели
  for (let i = 0; i < 14; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const day = {
      date: date.toISOString().split('T')[0],
      day_name: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
      day_number: date.getDate(),
      month_name: date.toLocaleDateString('ru-RU', { month: 'long' }),
      year: date.getFullYear()
    };
    result.push(day as AvailableDay);
  }
  return result;
};

export const generateReliableTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 9; hour <= 18; hour++) {
    for (let minute of [0, 30]) {
      if (hour === 18 && minute === 30) continue;
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const isAvailable = Math.random() > 0.2;
      const availablePosts = isAvailable ? Math.floor(Math.random() * 3) + 1 : 0;
      slots.push({
        time,
        is_available: isAvailable,
        available_posts: availablePosts
      });
    }
  }
  slots.sort((a, b) => a.time.localeCompare(b.time));
  const availableSlots = slots.filter(slot => slot.is_available);
  if (availableSlots.length < 5) {
    for (let i = 0; i < 5; i++) {
      if (i < slots.length) {
        slots[i].is_available = true;
        slots[i].available_posts = Math.floor(Math.random() * 3) + 1;
      }
    }
  }
  return slots;
};
