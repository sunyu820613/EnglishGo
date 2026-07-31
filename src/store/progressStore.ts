import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createVerifiedStorage } from './storage';

interface ProgressState {
  /** Letters (e.g. 'A') the child has visited/learned. */
  learnedLetters: string[];
  markLetterLearned: (letter: string) => void;
  isLetterLearned: (letter: string) => boolean;
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
    }),
    {
      name: 'englishgo.progress.v1',
      storage: createVerifiedStorage(),
    },
  ),
);
