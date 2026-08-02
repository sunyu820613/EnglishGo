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
    <section className={styles.variants}>
      <h2 className={styles.heading}>{letter} says&hellip;</h2>
      {variants.map((variant) => (
        <div key={variant.ipa || variant.label} className={styles.row}>
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
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
