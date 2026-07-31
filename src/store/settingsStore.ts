import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createVerifiedStorage } from './storage';

export type ThemeId =
  | 'starlight'
  | 'dino'
  | 'robot'
  | 'moon-garden'
  | 'ballet-castle'
  | 'dessert';

export const THEME_IDS: ThemeId[] = [
  'starlight',
  'dino',
  'robot',
  'moon-garden',
  'ballet-castle',
  'dessert',
];

export type VoiceGenderPreference = 'male' | 'female';

interface SettingsState {
  themeId: ThemeId;
  voiceGender: VoiceGenderPreference;
  setThemeId: (themeId: ThemeId) => void;
  setVoiceGender: (voiceGender: VoiceGenderPreference) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeId: 'starlight',
      voiceGender: 'female',
      setThemeId: (themeId) => set({ themeId }),
      setVoiceGender: (voiceGender) => set({ voiceGender }),
    }),
    {
      name: 'englishgo.settings.v1',
      storage: createVerifiedStorage(),
    },
  ),
);
