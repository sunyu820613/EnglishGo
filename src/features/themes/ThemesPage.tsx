import { THEME_LABELS, useTheme } from '../../theme/useTheme';
import page from '../../styles/page.module.css';
import styles from './ThemesPage.module.css';

export function ThemesPage() {
  const { themeId, setThemeId, themeIds } = useTheme();

  return (
    <div className={page.page}>
      <div className={page.container}>
        <h1 className={styles.title}>Choose a theme</h1>
        <div className={styles.grid}>
          {themeIds.map((id) => (
            <button
              key={id}
              type="button"
              data-theme={id}
              className={[styles.card, id === themeId ? styles.selected : ''].join(' ')}
              onClick={() => setThemeId(id)}
              aria-pressed={id === themeId}
            >
              <span className={styles.swatch} />
              <span className={styles.name}>{THEME_LABELS[id]}</span>
              {id === themeId ? (
                <span className={styles.check} aria-hidden="true">
                  ✓
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
