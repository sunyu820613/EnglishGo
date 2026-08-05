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
  /** Background music on/off. */
  bgmEnabled: boolean;
  /** null means "use the current theme's default tracing colors" */
  tracingPenColor: string | null;
  tracingGuideColor: string | null;
  setThemeId: (themeId: ThemeId) => void;
  setVoiceGender: (voiceGender: VoiceGenderPreference) => void;
  setBgmEnabled: (enabled: boolean) => void;
  setTracingPenColor: (color: string | null) => void;
  setTracingGuideColor: (color: string | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeId: 'starlight',
      voiceGender: 'female',
      bgmEnabled: true,
      tracingPenColor: null,
      tracingGuideColor: null,
      setThemeId: (themeId) => set({ themeId }),
      setVoiceGender: (voiceGender) => set({ voiceGender }),
      setBgmEnabled: (bgmEnabled) => set({ bgmEnabled }),
      setTracingPenColor: (tracingPenColor) => set({ tracingPenColor }),
      setTracingGuideColor: (tracingGuideColor) => set({ tracingGuideColor }),
    }),
    {
      name: 'englishgo.settings.v1',
      storage: createVerifiedStorage(),
    },
  ),
);
