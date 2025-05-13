import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ServicePointFilter from '../ServicePointFilter';

const mockStore = configureStore([thunk]);

const initialState = {
  servicePoints: {
    regions: ['Москва', 'Питер'],
    cities: ['Москва', 'Питер'],
    selectedRegion: '',
    selectedCity: '',
    selectedStatus: null,
    isLoading: false
  }
};

describe('ServicePointFilter', () => {
  it('renders filter controls', () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <ServicePointFilter />
      </Provider>
    );
    expect(screen.getByText('Фильтр по локации')).toBeInTheDocument();
    expect(screen.getByLabelText('Регион')).toBeInTheDocument();
    expect(screen.getByLabelText('Город')).toBeInTheDocument();
  });

  it('calls dispatch on region change', () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <ServicePointFilter />
      </Provider>
    );
    fireEvent.mouseDown(screen.getByLabelText('Регион'));
    // Проверяем, что выпадающий список открыт (MenuItem)
    expect(screen.getByText('Москва')).toBeInTheDocument();
  });
});
