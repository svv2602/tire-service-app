import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserMenu from '../UserMenu';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const mockStore = configureStore([thunk]);
const initialState = {
  auth: {
    user: { name: 'Test User' },
    token: 'test-token',
    isLoading: false,
    error: null,
  },
};

describe('UserMenu', () => {
  it('renders user menu button', () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <UserMenu />
      </Provider>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
