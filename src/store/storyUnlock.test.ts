import { describe, expect, it } from 'vitest';
import { isStoryUnlocked } from './storyUnlock';
import type { MiniStory } from '../data/stories.types';

const makeStory = (requiredLetters: string[]): MiniStory => ({
  id: 'test',
  title: 'Test Story',
  requiredLetters,
  pages: [{ text: 'Page one.', image: 'test_1.webp' }],
});

describe('isStoryUnlocked', () => {
  it('returns true when every required letter has at least 3 stars', () => {
    const story = makeStory(['A', 'B', 'C']);
    expect(isStoryUnlocked(story, { A: 3, B: 3, C: 3 })).toBe(true);
  });

  it('returns true when letters have more than 3 stars', () => {
    const story = makeStory(['A', 'B']);
    expect(isStoryUnlocked(story, { A: 5, B: 4 })).toBe(true);
  });

  it('returns false when one required letter has fewer than 3 stars', () => {
    const story = makeStory(['A', 'B', 'C']);
    expect(isStoryUnlocked(story, { A: 3, B: 2, C: 3 })).toBe(false);
  });

  it('returns false when a required letter has no stars', () => {
    const story = makeStory(['A', 'B']);
    expect(isStoryUnlocked(story, { A: 3 })).toBe(false);
  });

  it('returns false when all required letters have zero stars', () => {
    const story = makeStory(['X', 'Y', 'Z']);
    expect(isStoryUnlocked(story, {})).toBe(false);
  });

  it('handles an empty required letters array (edge case)', () => {
    const story = makeStory([]);
    expect(isStoryUnlocked(story, {})).toBe(true);
  });

  it('handles the YZ story (only 2 required letters)', () => {
    const story = makeStory(['Y', 'Z']);
    expect(isStoryUnlocked(story, { Y: 3, Z: 3 })).toBe(true);
    expect(isStoryUnlocked(story, { Y: 3, Z: 2 })).toBe(false);
  });
});
