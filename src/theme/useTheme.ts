import { THEME_IDS, useSettingsStore, type ThemeId } from '../store/settingsStore';

export const THEME_LABELS: Record<ThemeId, string> = {
  starlight: 'Starlight',
  dino: 'Dino',
  robot: 'Robot',
  'moon-garden': 'Moon Garden',
  'ballet-castle': 'Ballet Castle',
  dessert: 'Dessert',
};

export function useTheme(): {
  themeId: ThemeId;
  setThemeId: (themeId: ThemeId) => void;
  themeIds: ThemeId[];
} {
  const themeId = useSettingsStore((s) => s.themeId);
  const setThemeId = useSettingsStore((s) => s.setThemeId);
  return { themeId, setThemeId, themeIds: THEME_IDS };
}
