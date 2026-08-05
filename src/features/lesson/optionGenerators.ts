import type { AlphabetLetter, AlphabetWordExample } from '../../data/alphabet.types';

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/** 3 quiz options: the letter's first two example words, plus one random
 * distractor word from a different letter. Deduped by id (falls back to
 * fewer than 3 options in the near-impossible case of a collision). */
export function generateQuizOptions(
  letterEntry: AlphabetLetter,
  allLetters: AlphabetLetter[],
): AlphabetWordExample[] {
  const correct = letterEntry.words[0]!;
  const second = letterEntry.words[1]!;
  const distractorPool = allLetters.filter((e) => e.letter !== letterEntry.letter).flatMap((e) => e.words);
  const distractor = distractorPool[Math.floor(Math.random() * distractorPool.length)];

  const candidates = distractor ? [correct, second, distractor] : [correct, second];
  const unique = Array.from(new Map(candidates.map((w) => [w.id, w])).values());
  return shuffle(unique);
}

/** 3 match options: the target letter plus two offset distractors (+3, +7
 * in the alphabet, wrapping), matching the "clearly different" distractor
 * rule for the default difficulty (LEARNING_MODEL.md §3). */
export function generateMatchOptions(letter: string): string[] {
  const code = letter.charCodeAt(0) - 65;
  const distractor1 = String.fromCharCode(((code + 3) % 26) + 65);
  const distractor2 = String.fromCharCode(((code + 7) % 26) + 65);
  const unique = Array.from(new Set([letter, distractor1, distractor2]));
  return shuffle(unique);
}
