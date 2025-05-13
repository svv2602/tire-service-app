import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Notifications from '../Notifications';
import thunk from 'redux-thunk';

const mockStore = configureStore([thunk]);

describe('Notifications', () => {
  it('renders nothing if there are no notifications', () => {
    const store = mockStore({ notifications: { notifications: [] } });
    render(
      <Provider store={store}>
        <Notifications />
      </Provider>
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders notification with message', () => {
    const store = mockStore({ notifications: { notifications: [
      { id: '1', message: 'Test message', type: 'success', duration: 5000 }
    ] } });
    render(
      <Provider store={store}>
        <Notifications />
      </Provider>
    );
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });
});
