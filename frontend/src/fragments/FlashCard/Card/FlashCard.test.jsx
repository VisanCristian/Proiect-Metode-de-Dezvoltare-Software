import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import FlashCard from './FlashCard';

afterEach(cleanup);

beforeEach(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('FlashCard Component', () => {
  const mockCard = {
    id: 1,
    question: 'Ce este React?',
    answer: 'O librărie JS pentru interfețe.'
  };

  it('se întoarce (flip) la click', () => {
    const setFlipped = vi.fn();
    render(
      <FlashCard 
        card={mockCard} 
        flipped={false} 
        setFlipped={setFlipped} 
        status="unanswered" 
      />
    );
    
    const cardElement = screen.getByText('Ce este React?').closest('.card');
    fireEvent.click(cardElement);
    
    expect(setFlipped).toHaveBeenCalled();
  });

  it('afișează întrebarea pe față și răspunsul pe spate', () => {
    render(
      <FlashCard 
        card={mockCard} 
        flipped={false} 
        setFlipped={() => {}} 
        status="unanswered" 
      />
    );
    
    expect(screen.getByText('Ce este React?')).toBeInTheDocument();
    expect(screen.getByText('O librărie JS pentru interfețe.')).toBeInTheDocument();
  });
});
