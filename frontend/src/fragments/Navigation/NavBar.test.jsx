import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import NavBar from './NavBar';
import { BrowserRouter } from 'react-router-dom';

const logoutMock = vi.fn();

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
  const renderNavBar = () => render(
    <BrowserRouter>
      <NavBar />
    </BrowserRouter>
  );

  it('randează link-ul Dashboard', () => {
    renderNavBar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('randează link-ul Pomodoro', () => {
    renderNavBar();
    expect(screen.getByText('Pomodoro')).toBeInTheDocument();
  });

  it('randează link-ul FlashCards', () => {
    renderNavBar();
    expect(screen.getByText('FlashCards')).toBeInTheDocument();
  });

  it('randează link-ul FileTree', () => {
    renderNavBar();
    expect(screen.getByText('FileTree')).toBeInTheDocument();
  });

  it('randează link-ul Groups', () => {
    renderNavBar();
    expect(screen.getByText('Groups')).toBeInTheDocument();
  });

  it('apelează funcția de logout la click pe buton', () => {
    renderNavBar();
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    expect(logoutMock).toHaveBeenCalled();
  });
});
