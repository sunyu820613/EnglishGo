import { useEffect, useState } from 'react';
import { audioService } from '../audio/useAudioService';
import styles from './SoundButton.module.css';

export type SoundButtonSize = 'kid' | 'primary';

interface SoundButtonProps {
  /** Absolute URL to the audio file, e.g. /audio/letters/a_name.m4a. Undefined/null disables the button. */
  src: string | null | undefined;
  /** Accessible label, e.g. "Play the letter A". */
  label: string;
  size?: SoundButtonSize;
  /** Shown next to a disabled button so the child understands why it can't play. */
  disabledHint?: string;
}

export function SoundButton({ src, label, size = 'kid', disabledHint }: SoundButtonProps) {
  const [isPlaying, setIsPlaying] = useState(() => audioService.getPlayingVoiceSrc() === src);

  useEffect(() => {
    return audioService.addVoiceListener((playingSrc) => {
      setIsPlaying(playingSrc !== null && playingSrc === src);
    });
  }, [src]);

  const disabled = !src;

  return (
    <span className={styles.wrapper}>
      <button
        type="button"
        className={[styles.button, styles[size], isPlaying ? styles.playing : ''].join(' ')}
        aria-label={label}
        disabled={disabled}
        onClick={() => {
          if (src) void audioService.playVoice(src);
        }}
      >
        <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
          <path
            d="M4 9v6h4l5 5V4L8 9H4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M16 8.5c1.2 1 1.2 6 0 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {disabled && disabledHint ? <span className={styles.hint}>{disabledHint}</span> : null}
    </span>
  );
}
