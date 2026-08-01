import { SoundButton } from '../../components/SoundButton';
import type { AlphabetLetter } from '../../data/alphabet.types';
import styles from './PhonicsCompare.module.css';

interface PhonicsCompareProps {
  letter: AlphabetLetter;
  nameAudioSrc: string | null | undefined;
  soundAudioSrc: string | null | undefined;
}

/** Shows the letter-name IPA next to the phonics-sound IPA, each with its
 * own play button right after the text — one row per sound, so the icon's
 * label context comes from the row it's in rather than a separate caption. */
export function PhonicsCompare({ letter, nameAudioSrc, soundAudioSrc }: PhonicsCompareProps) {
  return (
    <div className={styles.compare}>
      <div className={styles.row}>
        <span className={styles.label}>Letter name</span>
        <span className={styles.value}>
          <span className={styles.ipa}>{letter.letterNameIpa ?? '—'}</span>
          <SoundButton src={nameAudioSrc} label={`Play the letter ${letter.letter}`} />
        </span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Letter sound</span>
        <span className={styles.value}>
          <span className={styles.ipa}>/{letter.phonicsIpa}/</span>
          <SoundButton src={soundAudioSrc} label={`Play the ${letter.letter} sound`} />
        </span>
      </div>
      {letter.phonicsNote ? <p className={styles.note}>{letter.phonicsNote}</p> : null}
    </div>
  );
}
