import { describe, expect, it } from 'vitest';
import { stories } from './stories';

describe('stories data', () => {
  it('has all 9 story groups', () => {
    expect(stories).toHaveLength(9);
    const expectedIds = [
      'story_abc', 'story_def', 'story_ghi', 'story_jkl', 'story_mno',
      'story_pqr', 'story_stu', 'story_vwx', 'story_yz',
    ];
    expect(stories.map((s) => s.id)).toEqual(expectedIds);
  });

  it('every story has a non-empty id, title, and at least 1 page', () => {
    for (const story of stories) {
      expect(story.id.length).toBeGreaterThan(0);
      expect(story.title.length).toBeGreaterThan(0);
      expect(story.pages.length).toBeGreaterThanOrEqual(1);
      expect(story.requiredLetters.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('every story has exactly 5 pages', () => {
    for (const story of stories) {
      expect(story.pages).toHaveLength(5);
    }
  });

  it('every page has non-empty text and a .webp image', () => {
    for (const story of stories) {
      for (const page of story.pages) {
        expect(page.text.length).toBeGreaterThan(0);
        expect(page.image).toMatch(/\.webp$/);
      }
    }
  });

  it('requiredLetters are unique uppercase letters A-Z', () => {
    const validLetters = new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    for (const story of stories) {
      for (const letter of story.requiredLetters) {
        expect(validLetters.has(letter)).toBe(true);
      }
      expect(new Set(story.requiredLetters).size).toBe(story.requiredLetters.length);
    }
  });

  it('every story has a video field', () => {
    for (const story of stories) {
      if (story.video) {
        expect(story.video).toMatch(/\.mp4$/);
      }
    }
  });
});
