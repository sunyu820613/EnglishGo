import type { MiniStory } from '../data/stories.types';

export function isStoryUnlocked(
  story: MiniStory,
  starsByLetter: Record<string, number>,
): boolean {
  return story.requiredLetters.every(
    (letter) => (starsByLetter[letter] ?? 0) >= 3,
  );
}
