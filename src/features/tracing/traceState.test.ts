import { describe, expect, it } from 'vitest';
import { coverageRatio, isStrokeComplete, markCovered, STROKE_COMPLETE_THRESHOLD } from './traceState';

describe('markCovered', () => {
  it('marks a window of indices around the given index', () => {
    const covered = new Set<number>();
    markCovered(covered, 10, 100, 2);
    expect([...covered].sort((a, b) => a - b)).toEqual([8, 9, 10, 11, 12]);
  });

  it('clamps the window at the sample array bounds', () => {
    const covered = new Set<number>();
    markCovered(covered, 0, 5, 2);
    expect([...covered].sort((a, b) => a - b)).toEqual([0, 1, 2]);
  });
});

describe('coverageRatio / isStrokeComplete', () => {
  it('computes the fraction of samples covered', () => {
    const covered = new Set([0, 1, 2, 3]);
    expect(coverageRatio(covered, 8)).toBe(0.5);
  });

  it('is not complete below the threshold', () => {
    const covered = new Set(Array.from({ length: 79 }, (_, i) => i));
    expect(isStrokeComplete(covered, 100)).toBe(false);
  });

  it(`is complete at or above the ${STROKE_COMPLETE_THRESHOLD} threshold`, () => {
    const covered = new Set(Array.from({ length: 80 }, (_, i) => i));
    expect(isStrokeComplete(covered, 100)).toBe(true);
  });
});
