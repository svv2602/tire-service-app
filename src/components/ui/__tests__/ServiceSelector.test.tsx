import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ServiceSelector from '../ServiceSelector';

jest.mock('../../../hooks/useAppDispatch', () => ({
  useAppDispatch: () => () => ({ unwrap: () => Promise.resolve() })
}));
jest.mock('../../../store/slices/servicesSlice', () => ({
  fetchServices: () => () => Promise.resolve()
}));

const mockStore = configureStore([thunk]);

const initialState = {
  services: {
    items: [
      { id: 1, name: 'Балансировка', status: 'работает' },
      { id: 2, name: 'Шиномонтаж', status: 'работает' }
    ],
    isLoading: false,
    error: null
  }
};

describe('ServiceSelector', () => {
  it('renders available services', () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <ServiceSelector selectedServices={[]} onChange={jest.fn()} />
      </Provider>
    );
    expect(screen.getByText('Балансировка')).toBeInTheDocument();
    expect(screen.getByText('Шиномонтаж')).toBeInTheDocument();
  });
});
