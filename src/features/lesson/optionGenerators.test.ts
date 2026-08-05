import { describe, expect, it } from 'vitest';
import { generateMatchOptions, generateQuizOptions } from './optionGenerators';
import { alphabet } from '../../data/alphabet';

describe('generateQuizOptions', () => {
  it('always includes the correct word and its distinct siblings, no crash for any letter', () => {
    for (const entry of alphabet) {
      const options = generateQuizOptions(entry, alphabet);
      expect(options.length).toBeGreaterThanOrEqual(2);
      expect(options.length).toBeLessThanOrEqual(3);
      expect(options.some((o) => o.id === entry.words[0]!.id)).toBe(true);
      // no duplicate ids
      expect(new Set(options.map((o) => o.id)).size).toBe(options.length);
    }
  });
});

describe('generateMatchOptions', () => {
  it('always includes the target letter plus up to two distinct distractors', () => {
    for (const letter of alphabet.map((e) => e.letter)) {
      const options = generateMatchOptions(letter);
      expect(options).toContain(letter);
      expect(new Set(options).size).toBe(options.length);
      expect(options.length).toBeLessThanOrEqual(3);
    }
  });

  it('distractors are offset by +3 and +7 in the alphabet, wrapping around', () => {
    // Z (index 25): +3 -> index 2 = C, +7 -> index 6 = G
    const options = generateMatchOptions('Z');
    expect(options.sort()).toEqual(['C', 'G', 'Z']);
  });
});
