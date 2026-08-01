import { SoundButton } from './SoundButton';
import { audioService } from '../audio/useAudioService';
import styles from './WordCard.module.css';

interface WordCardProps {
  imageSrc: string;
  imageAlt: string;
  word: string;
  wordAudioSrc: string;
  phraseAudioSrc: string;
}

/** Tapping the picture/word plays the word alone; the small speaker below
 * plays it in a sentence ("A is for Apple") — two pronunciations instead
 * of just the one. */
export function WordCard({ imageSrc, imageAlt, word, wordAudioSrc, phraseAudioSrc }: WordCardProps) {
  return (
    <div className={styles.card}>
      <button
        type="button"
        className={styles.wordButton}
        onClick={() => void audioService.playVoice(wordAudioSrc)}
        aria-label={`Play the word ${word}`}
      >
        <span className={styles.imageWrap}>
          <img src={imageSrc} alt={imageAlt} className={styles.image} loading="lazy" />
        </span>
        <span className={styles.word}>{word}</span>
      </button>
      <SoundButton
        src={phraseAudioSrc}
        label={`Play ${word} in a sentence`}
        caption="In a sentence"
      />
    </div>
  );
}
