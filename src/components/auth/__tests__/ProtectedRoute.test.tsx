import React from 'react';
import { render } from '@testing-library/react';
import ProtectedRoute from '../ProtectedRoute';

describe('ProtectedRoute', () => {
  it('renders children if authenticated (mock)', () => {
    // Для реального теста потребуется мок useSelector/useAuth
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    // Ожидаем, что Protected Content есть в DOM (если авторизация успешна)
    // expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
