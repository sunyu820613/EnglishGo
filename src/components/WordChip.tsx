import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { audioService } from '../audio/useAudioService';
import { useSettingsStore } from '../store/settingsStore';
import { wordAudioPathGendered } from '../data/paths';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import styles from './WordChip.module.css';

interface WordChipProps {
  text: string;
  imageSrc: string;
  audioSrc: string;
  /** Base audio filename (e.g. 'apple.m4a'); when provided, the audio
   * path is adjusted for the current voiceGender setting. If omitted,
   * audioSrc is used as-is (backward compat for non-word uses). */
  baseAudio?: string;
}

const POP_DURATION_MS = 900;

/** Compact tap-to-hear word: image + text pill. Tapping plays the word and
 * briefly shows the image larger for a clearer look, then settles back.
 * The zoomed preview renders via a portal to document.body — an in-place
 * CSS transform pop was found to render *underneath* later same-page
 * content (e.g. the "Practice writing" button) regardless of z-index,
 * because intervening flex-nested ancestors trap the stacking context. */
export function WordChip({ text, imageSrc, audioSrc, baseAudio }: WordChipProps) {
  const [popped, setPopped] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceGender = useSettingsStore((s) => s.voiceGender);
  const reducedMotion = usePrefersReducedMotion();

  const resolvedAudioSrc =
    baseAudio && voiceGender !== 'female'
      ? wordAudioPathGendered(baseAudio, voiceGender)
      : audioSrc;

  const handleClick = () => {
    void audioService.playVoice(resolvedAudioSrc, baseAudio && voiceGender !== "female" ? audioSrc : undefined);
    if (reducedMotion) return;
    setPopped(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setPopped(false), POP_DURATION_MS);
  };

  return (
    <>
      <button type="button" className={styles.chip} onClick={handleClick} aria-label={`Play the word ${text}`}>
        <img src={imageSrc} alt="" className={styles.image} loading="lazy" />
        <span className={styles.text}>{text}</span>
      </button>
      {popped
        ? createPortal(
            <div className={styles.zoomOverlay} aria-hidden="true">
              <img src={imageSrc} alt="" className={styles.zoomImage} />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
