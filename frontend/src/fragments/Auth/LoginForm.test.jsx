import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import LoginForm from './LoginForm';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../hooks/Auth/useAuth', () => ({
  useAuth: () => ({
    loginUser: vi.fn().mockResolvedValue({ success: true }),
  }),
}));

afterEach(cleanup);

describe('LoginForm', () => {
  const renderForm = () => render(
    <BrowserRouter>
      <LoginForm />
    </BrowserRouter>
  );

  it('randează input-ul de username', () => {
    renderForm();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
  });

  it('randează input-ul de password', () => {
    renderForm();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('randează butonul de login', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('username-ul este câmp obligatoriu', () => {
    renderForm();
    expect(screen.getByPlaceholderText('Username')).toBeRequired();
  });

  it('password-ul este câmp obligatoriu', () => {
    renderForm();
    expect(screen.getByPlaceholderText('Password')).toBeRequired();
  });

  it('permite scrierea în câmpul de username', () => {
    renderForm();
    const input = screen.getByPlaceholderText('Username');
    fireEvent.change(input, { target: { value: 'myuser' } });
    expect(input.value).toBe('myuser');
  });
});
