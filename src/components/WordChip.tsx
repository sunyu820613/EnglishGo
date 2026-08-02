import { useRef, useState } from 'react';
import { audioService } from '../audio/useAudioService';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import styles from './WordChip.module.css';

interface WordChipProps {
  text: string;
  imageSrc: string;
  audioSrc: string;
}

const POP_DURATION_MS = 900;

/** Compact tap-to-hear word: image + text pill. Tapping plays the word and
 * briefly pops the image larger for a clearer look, then settles back. */
export function WordChip({ text, imageSrc, audioSrc }: WordChipProps) {
  const [popped, setPopped] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const handleClick = () => {
    void audioService.playVoice(audioSrc);
    if (reducedMotion) return;
    setPopped(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setPopped(false), POP_DURATION_MS);
  };

  return (
    <button type="button" className={styles.chip} onClick={handleClick} aria-label={`Play the word ${text}`}>
      <img
        src={imageSrc}
        alt=""
        className={[styles.image, popped ? styles.popped : ''].join(' ')}
        loading="lazy"
      />
      <span className={styles.text}>{text}</span>
    </button>
  );
}
