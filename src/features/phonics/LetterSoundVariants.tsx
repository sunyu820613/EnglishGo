import { WordChip } from '../../components/WordChip';
import type { LetterSoundVariant } from '../../data/alphabet.types';
import { wordAudioPath, wordImagePath } from '../../data/paths';
import styles from './LetterSoundVariants.module.css';

interface LetterSoundVariantsProps {
  letter: string;
  variants: LetterSoundVariant[];
}

/** "A says..." — every pronunciation a letter can make, each with two
 * example words (picture + tap-to-hear), beyond the single primary sound
 * shown in PhonicsCompare. */
export function LetterSoundVariants({ letter, variants }: LetterSoundVariantsProps) {
  return (
    <section>
      <h2 className={styles.heading}>{letter} says&hellip;</h2>
      <div className={styles.variants}>
        {variants.map((variant) => {
          // A couple of pairs (e.g. "Wednesday"/"Handkerchief") are simply
          // too long to ever fit two-across in a normal card width — give
          // those their own full-width row instead of letting them wrap
          // into two lines within a cramped card.
          const isWide = variant.words.reduce((sum, w) => sum + w.text.length, 0) > 18;

          return (
            // Some letters (e.g. T) have multiple rows sharing the same ipa
            // (core / flap / glottal-stop all render as /t/), so label must
            // be part of the key too.
            <div
              key={`${variant.ipa}-${variant.label}`}
              className={isWide ? `${styles.row} ${styles.rowWide}` : styles.row}
            >
              <div className={styles.rowHeader}>
                <span className={styles.ipa}>{variant.silent ? 'Silent' : `/${variant.ipa}/`}</span>
                <span className={styles.label}>{variant.label}</span>
              </div>
              <div className={styles.words}>
                {variant.words.map((word) => (
                  <WordChip
                    key={word.id}
                    text={word.text}
                    imageSrc={wordImagePath(word.image)}
                    audioSrc={wordAudioPath(word.audio)}
                    baseAudio={word.audio}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
