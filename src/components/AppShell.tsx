import { Link, Outlet } from 'react-router-dom';
import { useSettingsStore } from '../store/settingsStore';
import styles from './AppShell.module.css';

export function AppShell() {
  const voiceGender = useSettingsStore((s) => s.voiceGender);
  const setVoiceGender = useSettingsStore((s) => s.setVoiceGender);

  return (
    <div>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          EnglishGo
        </Link>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.voiceToggle}
            onClick={() => setVoiceGender(voiceGender === 'female' ? 'male' : 'female')}
            aria-label={`Voice: ${voiceGender}. Tap to switch.`}
          >
            {voiceGender === 'female' ? 'Voice: Female' : 'Voice: Male'}
          </button>
          <Link to="/themes" className={styles.navLink}>
            Themes
          </Link>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
