import { describe, expect, it } from 'vitest';
import { getLetterStars } from './letterStars';
import { alphabet } from '../data/alphabet';

const emptyProgress = { wordsHeard: [], quizPassedLetters: [], matchPassedLetters: [], tracedLetters: [] };

describe('getLetterStars', () => {
  it('is 0 with no progress', () => {
    expect(getLetterStars('A', emptyProgress)).toBe(0);
  });

  it('awards star 1 only once both example words are heard', () => {
    const [word0, word1] = alphabet.find((e) => e.letter === 'A')!.words;
    expect(getLetterStars('A', { ...emptyProgress, wordsHeard: [word0!.id] })).toBe(0);
    expect(getLetterStars('A', { ...emptyProgress, wordsHeard: [word0!.id, word1!.id] })).toBe(1);
  });

  it('awards star 2 for a passed quiz', () => {
    expect(getLetterStars('A', { ...emptyProgress, quizPassedLetters: ['A'] })).toBe(1);
  });

  it('awards star 3 for a passed match OR a completed trace, not both required', () => {
    expect(getLetterStars('A', { ...emptyProgress, matchPassedLetters: ['A'] })).toBe(1);
    expect(getLetterStars('A', { ...emptyProgress, tracedLetters: ['A'] })).toBe(1);
    expect(getLetterStars('A', { ...emptyProgress, matchPassedLetters: ['A'], tracedLetters: ['A'] })).toBe(1);
  });

  it('reaches the full 3 stars', () => {
    const [word0, word1] = alphabet.find((e) => e.letter === 'A')!.words;
    expect(
      getLetterStars('A', {
        wordsHeard: [word0!.id, word1!.id],
        quizPassedLetters: ['A'],
        matchPassedLetters: ['A'],
        tracedLetters: [],
      }),
    ).toBe(3);
  });

  it("does not credit another letter's words toward star 1", () => {
    const bWord = alphabet.find((e) => e.letter === 'B')!.words[0]!;
    expect(getLetterStars('A', { ...emptyProgress, wordsHeard: [bWord.id] })).toBe(0);
  });
});
