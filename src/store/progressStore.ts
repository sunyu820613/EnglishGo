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
    }),
    {
      name: 'englishgo.progress.v1',
      storage: createVerifiedStorage(),
    },
  ),
);
