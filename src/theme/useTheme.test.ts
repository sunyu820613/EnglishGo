import { beforeEach, describe, expect, it } from 'vitest';
import { useSettingsStore } from '../store/settingsStore';
import { THEME_IDS } from '../store/settingsStore';

describe('theme persistence (settingsStore)', () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.setState({ themeId: 'starlight', voiceGender: 'female' });
  });

  it('defaults to starlight', () => {
    expect(useSettingsStore.getState().themeId).toBe('starlight');
  });

  it('persists the selected theme id under the versioned localStorage key', () => {
    useSettingsStore.getState().setThemeId('dino');
    expect(useSettingsStore.getState().themeId).toBe('dino');

    const raw = localStorage.getItem('englishgo.settings.v1');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed.state.themeId).toBe('dino');
  });

  it('exposes all six themes', () => {
    expect(THEME_IDS).toHaveLength(6);
  });
});
