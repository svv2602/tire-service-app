import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../LoginPage';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import thunk from 'redux-thunk';

const mockStore = configureStore([thunk]);
const initialState = {
  auth: {
    user: null,
    token: null,
    isLoading: false,
    error: null,
  },
};

describe('LoginPage', () => {
  it('renders login form', () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
  });

  it('shows error on empty submit', () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: /войти/i }));
    expect(screen.getByText(/обязательное поле/i)).toBeInTheDocument();
  });
});
