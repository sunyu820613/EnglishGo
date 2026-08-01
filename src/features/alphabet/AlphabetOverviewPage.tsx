import { useMemo } from 'react';
import { alphabet } from '../../data/alphabet';
import { useProgressStore } from '../../store/progressStore';
import page from '../../styles/page.module.css';
import { AccessibilityFallback } from './AccessibilityFallback';
import { AlphabetGlobe } from './AlphabetGlobe';
import { isWebGLAvailable } from './isWebGLAvailable';
import styles from './AlphabetOverviewPage.module.css';

export function AlphabetOverviewPage() {
  const learnedLetters = useProgressStore((s) => s.learnedLetters);
  const webglAvailable = useMemo(() => isWebGLAvailable(), []);

  const heading = <h1 className={styles.title}>Learn the Alphabet</h1>;
  const subtitle = (
    <p className={styles.subtitle}>
      Learned {learnedLetters.length} / {alphabet.length}
      {webglAvailable ? ' — drag to look around, tap a letter to start' : ''}
    </p>
  );

  if (!webglAvailable) {
    return (
      <div className={page.page}>
        <div className={page.container}>
          {heading}
          {subtitle}
          <AccessibilityFallback learnedLetters={learnedLetters} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.globePage}>
      <div className={styles.overlayHeader}>
        <div className={page.container}>
          {heading}
          {subtitle}
        </div>
      </div>
      <AlphabetGlobe learnedLetters={learnedLetters} />
    </div>
  );
}
