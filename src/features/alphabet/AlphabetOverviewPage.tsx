import { alphabet } from '../../data/alphabet';
import { useProgressStore } from '../../store/progressStore';
import page from '../../styles/page.module.css';
import { LetterCard } from './LetterCard';
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
          {alphabet.map((entry, i) => (
            <LetterCard
              key={entry.letter}
              entry={entry}
              learned={learnedLetters.includes(entry.letter)}
              entranceDelay={(i % 8) * 0.03}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
