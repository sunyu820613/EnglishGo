import { SoundButton } from '../../components/SoundButton';
import type { AlphabetLetter } from '../../data/alphabet.types';
import styles from './PhonicsCompare.module.css';

interface PhonicsCompareProps {
  letter: AlphabetLetter;
  nameAudioSrc: string | null | undefined;
  soundAudioSrc: string | null | undefined;
  /** Skip the "Letter sound" row — used when the letter has a sound-variants
   * table (its first row already covers the primary phonics sound). */
  hideSoundRow?: boolean;
}

/** Shows the letter-name IPA next to the phonics-sound IPA, each with its
 * own play button right after the text — one row per sound, so the icon's
 * label context comes from the row it's in rather than a separate caption. */
export function PhonicsCompare({ letter, nameAudioSrc, soundAudioSrc, hideSoundRow = false }: PhonicsCompareProps) {
  return (
    <div className={styles.compare}>
      <div className={styles.row}>
        <span className={styles.label}>Letter name</span>
        <span className={styles.value}>
          <span className={styles.ipa}>{letter.letterNameIpa ?? '—'}</span>
          <SoundButton src={nameAudioSrc} label={`Play the letter ${letter.letter}`} />
        </span>
      </div>
      {hideSoundRow ? null : (
        <div className={styles.row}>
          <span className={styles.label}>Letter sound</span>
          <span className={styles.value}>
            <span className={styles.ipa}>/{letter.phonicsIpa}/</span>
            <SoundButton src={soundAudioSrc} label={`Play the ${letter.letter} sound`} />
          </span>
        </div>
      )}
      {!hideSoundRow && letter.phonicsNote ? <p className={styles.note}>{letter.phonicsNote}</p> : null}
    </div>
  );
}
