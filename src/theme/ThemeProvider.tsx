import { useEffect, type ReactNode } from 'react';
import { useSettingsStore } from '../store/settingsStore';

/**
 * Applies the persisted theme id to the document root as `data-theme`.
 * Colour roles then follow purely from CSS (see ./themes/*.css) — no
 * per-theme JS branching anywhere in the component tree.
 */
export function ThemeProvider({ children }: { children: ReactNode }): ReactNode {
  const themeId = useSettingsStore((s) => s.themeId);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId);
  }, [themeId]);

  return children;
}
