import { describe, it, expect } from 'vitest';
import { formatDuration } from './formatDuration';

describe('formatDuration', () => {
  it('formatează doar secunde', () => {
    expect(formatDuration(45)).toBe('45s');
  });

  it('formatează minute rotunde', () => {
    expect(formatDuration(120)).toBe('2 min');
  });

  it('formatează minute și secunde', () => {
    expect(formatDuration(125)).toBe('2 min 5s');
  });

  it('gestionează 0 secunde', () => {
    expect(formatDuration(0)).toBe('0s');
  });
});
