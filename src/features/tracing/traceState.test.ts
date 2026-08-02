import { describe, expect, it } from 'vitest';
import { isStrokeComplete } from './traceState';

describe('isStrokeComplete', () => {
  it('is not complete before reaching the last sample', () => {
    expect(isStrokeComplete(98, 100)).toBe(false);
  });

  it('is complete once the index reaches the last sample', () => {
    expect(isStrokeComplete(99, 100)).toBe(true);
  });

  it('is complete if somehow past the last sample', () => {
    expect(isStrokeComplete(105, 100)).toBe(true);
  });
});
