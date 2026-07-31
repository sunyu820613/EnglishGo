import type { AlphabetLetter } from '../../data/alphabet.types';
import styles from './PhonicsCompare.module.css';

interface PhonicsCompareProps {
  letter: AlphabetLetter;
}

/** Shows the letter-name IPA next to the phonics-sound IPA. */
export function PhonicsCompare({ letter }: PhonicsCompareProps) {
  return (
    <div className={styles.compare}>
      <div className={styles.row}>
        <span className={styles.label}>Letter name</span>
        <span className={styles.ipa}>{letter.letterNameIpa ?? '—'}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Letter sound</span>
        <span className={styles.ipa}>/{letter.phonicsIpa}/</span>
      </div>
      {letter.phonicsNote ? <p className={styles.note}>{letter.phonicsNote}</p> : null}
    </div>
  );
}
