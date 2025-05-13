import * as apiModule from '../api';
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

describe('api service', () => {
  afterEach(() => jest.clearAllMocks());

  it('getServicePoints: вызывает /api/v2/service-points и возвращает данные', async () => {
    mockAxios.get.mockResolvedValue({ data: { data: [{ id: 1 }, { id: 2 }] } });
    const res = await (apiModule as any).getServicePoints();
    expect(mockAxios.get).toHaveBeenCalledWith('/api/v2/service-points');
    expect(res).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('getServicePoint: вызывает /api/v2/service-points/:id и возвращает данные', async () => {
    mockAxios.get.mockResolvedValue({ data: { data: { id: 5 } } });
    const res = await (apiModule as any).getServicePoint(5);
    expect(mockAxios.get).toHaveBeenCalledWith('/api/v2/service-points/5');
    expect(res).toEqual({ id: 5 });
  });

  it('getCities: вызывает /v2/cities', async () => {
    (apiModule as any).api.get = jest.fn().mockResolvedValue({ data: { data: ['Москва', 'Питер'] } });
    const res = await (apiModule as any).getCities();
    expect((apiModule as any).api.get).toHaveBeenCalledWith('/v2/cities');
    expect(res).toEqual(['Москва', 'Питер']);
  });

  it('getRegions: вызывает /v2/regions', async () => {
    (apiModule as any).api.get = jest.fn().mockResolvedValue({ data: { data: ['ЦФО'] } });
    const res = await (apiModule as any).getRegions();
    expect((apiModule as any).api.get).toHaveBeenCalledWith('/v2/regions');
    expect(res).toEqual(['ЦФО']);
  });
});
