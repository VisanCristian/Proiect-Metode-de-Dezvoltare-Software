import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import LoginForm from './LoginForm';
import { BrowserRouter } from 'react-router-dom';

// Mock useAuth hook
vi.mock('../../hooks/Auth/useAuth', () => ({
  useAuth: () => ({
    loginUser: vi.fn().mockResolvedValue({ success: true }),
  }),
}));

afterEach(cleanup);

describe('LoginForm', () => {
  it('se randează corect', () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('validează input-ul (required)', () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');

    expect(usernameInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('permite introducerea textului în câmpuri', () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );
    const usernameInput = screen.getByPlaceholderText('Username');
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    expect(usernameInput.value).toBe('testuser');
  });
});
