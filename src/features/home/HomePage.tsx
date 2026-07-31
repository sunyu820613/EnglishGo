import { Link } from 'react-router-dom';
import { alphabet } from '../../data/alphabet';
import { useProgressStore } from '../../store/progressStore';
import page from '../../styles/page.module.css';
import styles from './HomePage.module.css';

export function HomePage() {
  const learnedCount = useProgressStore((s) => s.learnedLetters.length);

  return (
    <div className={page.page}>
      <div className={page.container}>
        <section className={styles.hero}>
          <h1 className={styles.title}>Let&apos;s learn English!</h1>
          <p className={styles.subtitle}>Letters, sounds, and words to say out loud.</p>
        </section>

        <section className={styles.cards}>
          <Link to="/alphabet" className={styles.card}>
            <h2>Learn the Alphabet</h2>
            <p>26 letters, names, sounds, and words.</p>
          </Link>
          <Link to="/phonemes" className={styles.card}>
            <h2>Phonics</h2>
            <p>Explore the sounds that make up words.</p>
          </Link>
        </section>

        <section className={styles.progress}>
          <p>
            Letters learned: {learnedCount} / {alphabet.length}
          </p>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${(learnedCount / alphabet.length) * 100}%` }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
