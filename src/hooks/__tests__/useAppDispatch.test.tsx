import { renderHook } from '@testing-library/react';
import { useAppDispatch } from '../useAppDispatch';
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
}));

describe('useAppDispatch', () => {
  it('returns dispatch function', () => {
    const { result } = renderHook(() => useAppDispatch());
    expect(typeof result.current).toBe('function');
  });
});
