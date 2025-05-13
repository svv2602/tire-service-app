import * as axiosModule from '../axios';
import axios from 'axios';

jest.mock('axios', () => {
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

describe('api utils', () => {
  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('getCsrfToken: делает GET-запрос на sanctum/csrf-cookie', async () => {
    (axios as any).mockResolvedValue({ status: 204 });
    const res = await axiosModule.getCsrfToken();
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'GET',
      url: expect.stringContaining('/sanctum/csrf-cookie')
    }));
    expect(res.status).toBe(204);
  });

  it('loginWithoutCsrf: делает POST-запрос на /api/login и сохраняет токен', async () => {
    (axios as any).mockResolvedValue({ data: { token: 'abc' } });
    const res = await axiosModule.loginWithoutCsrf({ email: 'a', password: 'b' });
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: expect.stringContaining('/api/login')
    }));
    expect(localStorage.getItem('token')).toBe('abc');
    expect(res.token).toBe('abc');
  });

  it('testLogin: делает POST-запрос на /api/test-login и сохраняет токен', async () => {
    (axios as any).mockResolvedValue({ data: { token: 'xyz' } });
    const res = await axiosModule.testLogin({ email: 'a', password: 'b' });
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: expect.stringContaining('/api/test-login')
    }));
    expect(localStorage.getItem('token')).toBe('xyz');
    expect(res.token).toBe('xyz');
  });

  it('pingServer: успешный пинг возвращает true', async () => {
    (axios as any).mockResolvedValue({ data: 'pong' });
    const res = await axiosModule.pingServer();
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'GET',
      url: expect.stringContaining('/ping')
    }));
    expect(res).toBe(true);
  });

  it('pingServer: неуспешный пинг возвращает false', async () => {
    (axios as any).mockRejectedValue(new Error('fail'));
    const res = await axiosModule.pingServer();
    expect(res).toBe(false);
  });
});
