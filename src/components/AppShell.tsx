import { useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAudioService } from '../audio/useAudioService';
import { useSettingsStore } from '../store/settingsStore';
import styles from './AppShell.module.css';

const base = import.meta.env.BASE_URL;
const BGM_PLAYLIST = [
  `${base}audio/music/happy_skip.ogg`,
  `${base}audio/music/playful_pop.ogg`,
  `${base}audio/music/sunny_parade.ogg`,
];

export function AppShell() {
  const voiceGender = useSettingsStore((s) => s.voiceGender);
  const setVoiceGender = useSettingsStore((s) => s.setVoiceGender);
  const bgmEnabled = useSettingsStore((s) => s.bgmEnabled);
  const setBgmEnabled = useSettingsStore((s) => s.setBgmEnabled);
  const audioService = useAudioService();

  useEffect(() => {
    // Sync persisted setting to audio service on mount.
    audioService.setBgmEnabled(bgmEnabled);
    void audioService.playBgmPlaylist(BGM_PLAYLIST);
    // Browsers block un-gestured autoplay; retry once on the first tap in
    // case the attempt above was silently rejected.
    const retryOnFirstGesture = () => {
      void audioService.playBgmPlaylist(BGM_PLAYLIST);
    };
    window.addEventListener('pointerdown', retryOnFirstGesture, { once: true });
    return () => window.removeEventListener('pointerdown', retryOnFirstGesture);
  }, [audioService]);

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
          <button
            type="button"
            className={styles.voiceToggle}
            onClick={() => {
              const next = !bgmEnabled;
              setBgmEnabled(next);
              audioService.setBgmEnabled(next);
            }}
            aria-label={`Background music: ${bgmEnabled ? 'on' : 'off'}. Tap to toggle.`}
          >
            {bgmEnabled ? 'Music: On' : 'Music: Off'}
          </button>
          <Link to="/alphabet" className={styles.navLink}>
            All Letters
          </Link>
         <Link to="/rewards" className={styles.navLink}>
           Rewards
         </Link>
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
