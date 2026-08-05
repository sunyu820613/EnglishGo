import { useEffect, useRef, useState } from 'react';
import { audioService } from '../../../audio/useAudioService';
import { phraseAudioPath } from '../../../data/paths';
import { QuizOptionCard, type QuizOptionState } from '../../../components/QuizOptionCard';
import { Celebration } from '../Celebration';
import { generateMatchOptions } from '../optionGenerators';
import { useGentleRetry } from '../useGentleRetry';
import styles from './StepLetterQuiz.module.css';

interface StepLetterQuizProps {
  letter: string;
  /** Absolute URL to the letter name audio (already gendered). */
  audioSrc: string;
  reducedMotion: boolean;
  onCompleted: () => void;
}

export function StepLetterQuiz({ letter, audioSrc, reducedMotion, onCompleted }: StepLetterQuizProps) {
  const [options] = useState(() => generateMatchOptions(letter));
  const [completedIndex, setCompletedIndex] = useState<number | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const { wrongIndex, reduced, registerWrongAttempt } = useGentleRetry();
  const playedRef = useRef<string | false>(false);

  // Play the letter's pronunciation on mount.
  useEffect(() => {
    if (playedRef.current && audioSrc === playedRef.current) return;
    playedRef.current = audioSrc;
    void audioService.playVoice(audioSrc);
  }, [audioSrc]);

  const hiddenIndex = reduced ? options.findIndex((o) => o !== letter) : -1;

  const handleSelect = (index: number) => {
    if (completedIndex !== null) return;
    if (options[index] === letter) {
      setCompletedIndex(index);
      setCelebrating(true);
    } else {
      registerWrongAttempt(index);
      void audioService.playVoice(phraseAudioPath('lets_listen_again.m4a'));
    }
  };

  const cardState = (index: number): QuizOptionState => {
    if (completedIndex === index) return 'success';
    if (completedIndex === null && wrongIndex === index) return 'hint';
    return 'idle';
  };

  return (
    <div className={styles.step}>
      <h2 className={styles.heading}>Which letter is this?</h2>

      <button type="button" className={styles.replayButton} onClick={() => void audioService.playVoice(audioSrc)} aria-label="Listen again">
        <svg viewBox="0 0 24 24" className={styles.replayIcon} aria-hidden="true">
          <path d="M4 9v6h4l5 5V4L8 9H4z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M16 8.5c1.2 1 1.2 6 0 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>

      <div className={styles.options}>
        {options.map((option, index) =>
          index === hiddenIndex ? null : (
            <QuizOptionCard
              key={option}
              ariaLabel={['Letter', option].join(' ')}
              state={cardState(index)}
              reducedMotion={reducedMotion}
              onClick={() => handleSelect(index)}
            >
              <span className={styles.letter}>{option}</span>
            </QuizOptionCard>
          ),
        )}
        {celebrating ? (
          <Celebration
            reducedMotion={reducedMotion}
            onDone={() => {
              setCelebrating(false);
              onCompleted();
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
