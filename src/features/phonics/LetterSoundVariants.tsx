import { audioService } from '../../audio/useAudioService';
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
    <section className={styles.variants}>
      <h2 className={styles.heading}>{letter} says&hellip;</h2>
      {variants.map((variant) => (
        <div key={variant.ipa} className={styles.row}>
          <div className={styles.rowHeader}>
            <span className={styles.ipa}>/{variant.ipa}/</span>
            <span className={styles.label}>{variant.label}</span>
          </div>
          <div className={styles.words}>
            {variant.words.map((word) => (
              <button
                key={word.id}
                type="button"
                className={styles.chip}
                onClick={() => void audioService.playVoice(wordAudioPath(word.audio))}
                aria-label={`Play the word ${word.text}`}
              >
                <img src={wordImagePath(word.image)} alt={word.text} className={styles.chipImage} loading="lazy" />
                <span className={styles.chipText}>{word.text}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
