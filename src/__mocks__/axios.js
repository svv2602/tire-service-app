const mockAxios = jest.createMockFromModule('axios');
mockAxios.create = () => mockAxios;
mockAxios.get = jest.fn(() => Promise.resolve({ data: {} }));
mockAxios.post = jest.fn(() => Promise.resolve({ data: {} }));
mockAxios.put = jest.fn(() => Promise.resolve({ data: {} }));
mockAxios.delete = jest.fn(() => Promise.resolve({ data: {} }));
mockAxios.interceptors = { request: { use: jest.fn() }, response: { use: jest.fn() } };
module.exports = mockAxios;
