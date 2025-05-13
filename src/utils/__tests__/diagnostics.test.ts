import { addQueryParams } from '../diagnostics';

describe('addQueryParams', () => {
  it('adds query params to url', () => {
    const url = 'http://localhost/api';
    const params = { a: 1, b: 'test' };
    expect(addQueryParams(url, params)).toBe('http://localhost/api?a=1&b=test');
  });

  it('skips undefined/null params', () => {
    const url = 'http://localhost/api';
    const params = { a: 1, b: undefined, c: null };
    expect(addQueryParams(url, params)).toBe('http://localhost/api?a=1');
  });

  it('returns url if no params', () => {
    const url = 'http://localhost/api';
    const params = {};
    expect(addQueryParams(url, params)).toBe(url);
  });
});
