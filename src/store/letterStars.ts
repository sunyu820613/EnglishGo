import { alphabet } from '../data/alphabet';

export interface StarProgress {
  wordsHeard: string[];
  quizPassedLetters: string[];
  matchPassedLetters: string[];
  tracedLetters: string[];
}

/** 0-3 stars for a letter: ★1 = both example words heard, ★2 = quiz passed,
 * ★3 = match passed OR traced. Purely derived from existing progress signals
 * so stars can never regress. */
export function getLetterStars(letter: string, progress: StarProgress): number {
  const entry = alphabet.find((e) => e.letter === letter);
  const heardCount = entry?.words.filter((w) => progress.wordsHeard.includes(w.id)).length ?? 0;

  let stars = 0;
  if (heardCount >= 2) stars++;
  if (progress.quizPassedLetters.includes(letter)) stars++;
  if (progress.matchPassedLetters.includes(letter) || progress.tracedLetters.includes(letter)) stars++;
  return stars;
}
