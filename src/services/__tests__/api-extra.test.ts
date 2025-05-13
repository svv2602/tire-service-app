import * as apiModule from '../api';
import { generateDummyAvailableDays, generateReliableTimeSlots } from '../apiUtils';
import axios from '../../utils/axios';

jest.mock('../../utils/axios', () => {
  const actualAxios = jest.requireActual('axios');
  return {
    __esModule: true,
    ...actualAxios,
    default: Object.assign(jest.fn(), {
      create: jest.fn(() => actualAxios),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    }),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(() => actualAxios),
  };
});
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('api service (дополнительные тесты)', () => {
  afterEach(() => jest.clearAllMocks());

  it('getServicePoints: корректно обрабатывает ошибку', async () => {
    mockAxios.get.mockRejectedValue(new Error('fail'));
    await expect((apiModule as any).getServicePoints()).rejects.toThrow('fail');
  });

  it('getServicePoint: корректно обрабатывает ошибку', async () => {
    mockAxios.get.mockRejectedValue(new Error('fail'));
    await expect((apiModule as any).getServicePoint(1)).rejects.toThrow('fail');
  });

  it('updateServicePoint: успешный PUT-запрос', async () => {
    mockAxios.put.mockResolvedValue({ data: { data: { id: 1, name: 'Test' } } });
    const res = await (apiModule as any).updateServicePoint(1, { name: 'Test' });
    expect(mockAxios.put).toHaveBeenCalledWith('/api/v2/service-points/1', expect.objectContaining({ name: 'Test' }));
    expect(res).toEqual({ id: 1, name: 'Test' });
  });

  it('updateServicePoint: fallback на POST с _method=PUT при ошибке PUT', async () => {
    mockAxios.put.mockRejectedValue(new Error('fail'));
    mockAxios.post.mockResolvedValue({ data: { data: { id: 1, name: 'Test' } } });
    const res = await (apiModule as any).updateServicePoint(1, { name: 'Test' });
    expect(mockAxios.post).toHaveBeenCalledWith('/api/v2/service-points/1', expect.objectContaining({ name: 'Test', _method: 'PUT' }));
    expect(res).toEqual({ id: 1, name: 'Test' });
  });

  it('generateDummyAvailableDays: генерирует 14 дней', () => {
    const days = generateDummyAvailableDays();
    expect(Array.isArray(days)).toBe(true);
    expect(days.length).toBe(14);
    expect(days[0]).toHaveProperty('date');
  });

  it('generateReliableTimeSlots: генерирует слоты с временем', () => {
    const slots = generateReliableTimeSlots();
    expect(Array.isArray(slots)).toBe(true);
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0]).toHaveProperty('time');
  });
});
