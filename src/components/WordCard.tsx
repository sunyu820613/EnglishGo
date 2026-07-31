import { audioService } from '../audio/useAudioService';
import styles from './WordCard.module.css';

interface WordCardProps {
  imageSrc: string;
  imageAlt: string;
  word: string;
  audioSrc: string;
}

export function WordCard({ imageSrc, imageAlt, word, audioSrc }: WordCardProps) {
  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => void audioService.playVoice(audioSrc)}
      aria-label={`Play the word ${word}`}
    >
      <span className={styles.imageWrap}>
        <img src={imageSrc} alt={imageAlt} className={styles.image} loading="lazy" />
      </span>
      <span className={styles.word}>{word}</span>
    </button>
  );
}
