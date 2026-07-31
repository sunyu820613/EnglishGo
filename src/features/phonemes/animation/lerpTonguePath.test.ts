import { describe, expect, it } from 'vitest';
import { lerpTonguePath } from './lerpTonguePath';

describe('lerpTonguePath', () => {
  const a = [
    [0, 0],
    [10, 0],
    [10, 10],
  ] as const;
  const b = [
    [0, 10],
    [20, 10],
    [20, 20],
  ] as const;

  it('t=0 returns exactly the first outline', () => {
    expect(lerpTonguePath(a, a, 0)).toBe('M0,0 L10,0 L10,10 Z');
  });

  it('t=1 returns exactly the second outline', () => {
    expect(lerpTonguePath(a, b, 1)).toBe('M0,10 L20,10 L20,20 Z');
  });

  it('t=0.5 returns the midpoint of every point', () => {
    expect(lerpTonguePath(a, b, 0.5)).toBe('M0,5 L15,5 L15,15 Z');
  });
});
