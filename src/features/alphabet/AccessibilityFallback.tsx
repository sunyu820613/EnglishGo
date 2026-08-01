import { Link } from 'react-router-dom';
import { alphabet } from '../../data/alphabet';
import styles from './AccessibilityFallback.module.css';

/** Plain 2D letter list — shown when WebGL isn't available, so the globe
 * never leaves a device with no way to reach the lessons. */
export function AccessibilityFallback({ learnedLetters }: { learnedLetters: string[] }) {
  return (
    <div className={styles.grid}>
      {alphabet.map(({ letter }) => (
        <Link
          key={letter}
          to={`/alphabet/${letter}`}
          className={[styles.tile, learnedLetters.includes(letter) ? styles.learned : ''].join(' ')}
        >
          {letter}
        </Link>
      ))}
    </div>
  );
}
