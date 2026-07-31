import { Link } from 'react-router-dom';
import { alphabet } from '../../data/alphabet';
import { useProgressStore } from '../../store/progressStore';
import page from '../../styles/page.module.css';
import styles from './AlphabetOverviewPage.module.css';

export function AlphabetOverviewPage() {
  const learnedLetters = useProgressStore((s) => s.learnedLetters);

  return (
    <div className={page.page}>
      <div className={page.container}>
        <h1 className={styles.title}>Learn the Alphabet</h1>
        <p className={styles.subtitle}>
          Learned {learnedLetters.length} / {alphabet.length}
        </p>
        <div className={styles.grid}>
          {alphabet.map(({ letter }) => {
            const learned = learnedLetters.includes(letter);
            return (
              <Link
                key={letter}
                to={`/alphabet/${letter}`}
                className={[styles.tile, learned ? styles.learned : ''].join(' ')}
              >
                {letter}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
