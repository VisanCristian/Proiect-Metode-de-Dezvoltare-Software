import { describe, it, expect } from 'vitest';
import { shuffleArray } from './shuffle';

describe('shuffleArray', () => {
  it('nu modifică lungimea array-ului', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled.length).toBe(arr.length);
  });

  it('conține aceleași elemente', () => {
    const arr = [1, 2, 3];
    const shuffled = shuffleArray(arr);
    expect(shuffled).toEqual(expect.arrayContaining(arr));
  });

  it('creează o copie nouă (nu modifică originalul)', () => {
    const arr = [1, 2, 3];
    const shuffled = shuffleArray(arr);
    expect(shuffled).not.toBe(arr);
  });
});
