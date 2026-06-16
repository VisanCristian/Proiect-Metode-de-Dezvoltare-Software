import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import Timer from './Timer';

afterEach(cleanup);

describe('Timer Component', () => {
  it('afișează 25:00 la start', () => {
    render(<Timer timeLeft={1500} totalPhaseTime={1500} phase="focus" />);
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  it('afișează corect timpul rămas (ex: 10:05)', () => {
    render(<Timer timeLeft={605} totalPhaseTime={1500} phase="focus" />);
    expect(screen.getByText('10:05')).toBeInTheDocument();
  });
});
