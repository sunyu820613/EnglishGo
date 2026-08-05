import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createVerifiedStorage } from './storage';

interface ProgressState {
  /** Letters (e.g. 'A') the child has visited/learned. */
  learnedLetters: string[];
  markLetterLearned: (letter: string) => void;
  isLetterLearned: (letter: string) => boolean;

  /** Case-sensitive: 'A' and 'a' are tracked separately, since upper and
   * lower case are separate tracing exercises. */
  tracedLetters: string[];
  markLetterTraced: (caseSensitiveLetter: string) => void;
  isLetterTraced: (caseSensitiveLetter: string) => boolean;

  /** Word ids (e.g. 'apple') heard at least once, across all letters.
   * Doubles as the sticker collection — hearing a word unlocks its sticker. */
  wordsHeard: string[];
  markWordHeard: (wordId: string) => void;
  isWordHeard: (wordId: string) => boolean;

  /** Uppercase letters where the lesson's listen-and-pick quiz was passed. */
  quizPassedLetters: string[];
  markQuizPassed: (letter: string) => void;

  /** Uppercase letters where the lesson's find-the-letter match was passed. */
  matchPassedLetters: string[];
  markMatchPassed: (letter: string) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      learnedLetters: [],
      markLetterLearned: (letter) =>
        set((state) =>
          state.learnedLetters.includes(letter)
            ? state
            : { learnedLetters: [...state.learnedLetters, letter] },
        ),
      isLetterLearned: (letter) => get().learnedLetters.includes(letter),

      tracedLetters: [],
      markLetterTraced: (caseSensitiveLetter) =>
        set((state) =>
          state.tracedLetters.includes(caseSensitiveLetter)
            ? state
            : { tracedLetters: [...state.tracedLetters, caseSensitiveLetter] },
        ),
      isLetterTraced: (caseSensitiveLetter) => get().tracedLetters.includes(caseSensitiveLetter),

      wordsHeard: [],
      markWordHeard: (wordId) =>
        set((state) =>
          state.wordsHeard.includes(wordId) ? state : { wordsHeard: [...state.wordsHeard, wordId] },
        ),
      isWordHeard: (wordId) => get().wordsHeard.includes(wordId),

      quizPassedLetters: [],
      markQuizPassed: (letter) =>
        set((state) =>
          state.quizPassedLetters.includes(letter)
            ? state
            : { quizPassedLetters: [...state.quizPassedLetters, letter] },
        ),

      matchPassedLetters: [],
      markMatchPassed: (letter) =>
        set((state) =>
          state.matchPassedLetters.includes(letter)
            ? state
            : { matchPassedLetters: [...state.matchPassedLetters, letter] },
        ),
    }),
    {
      name: 'englishgo.progress.v1',
      storage: createVerifiedStorage(),
    },
  ),
);
