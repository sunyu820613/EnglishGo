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

  return (
    <div className={page.page}>
      <div className={page.container}>
        <h1 className={styles.title}>Learn the Alphabet</h1>
        <p className={styles.subtitle}>
          Learned {learnedLetters.length} / {alphabet.length}
          {webglAvailable ? ' — drag to look around, tap a letter to start' : ''}
        </p>
        {webglAvailable ? (
          <AlphabetGlobe learnedLetters={learnedLetters} />
        ) : (
          <AccessibilityFallback learnedLetters={learnedLetters} />
        )}
      </div>
    </div>
  );
}
