import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import NavBar from './NavBar';
import { BrowserRouter } from 'react-router-dom';

const logoutMock = vi.fn();

// Mock useAuth hook
vi.mock('../../hooks/Auth/useAuth', () => ({
  useAuth: () => ({
    logout: logoutMock,
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('NavBar Component', () => {
  it('randează toate link-urile de navigare', () => {
    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Pomodoro')).toBeInTheDocument();
    expect(screen.getByText('FlashCards')).toBeInTheDocument();
    expect(screen.getByText('FileTree')).toBeInTheDocument();
    expect(screen.getByText('Groups')).toBeInTheDocument();
  });

  it('apelează funcția de logout la click pe buton', () => {
    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(logoutMock).toHaveBeenCalled();
  });
});
