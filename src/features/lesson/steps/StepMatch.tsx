import { useState } from 'react';
import { phraseAudioPath } from '../../../data/paths';
import { audioService } from '../../../audio/useAudioService';
import { QuizOptionCard, type QuizOptionState } from '../../../components/QuizOptionCard';
import { Celebration } from '../Celebration';
import { generateMatchOptions } from '../optionGenerators';
import { useGentleRetry } from '../useGentleRetry';
import styles from './StepMatch.module.css';

interface StepMatchProps {
  letter: string;
  reducedMotion: boolean;
  onCompleted: () => void;
}

export function StepMatch({ letter, reducedMotion, onCompleted }: StepMatchProps) {
  const [options] = useState(() => generateMatchOptions(letter));
  const [completedIndex, setCompletedIndex] = useState<number | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const { wrongIndex, reduced, registerWrongAttempt } = useGentleRetry();

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
      <h2 className={styles.heading}>Find the letter {letter}!</h2>
      <div className={styles.options}>
        {options.map((option, index) =>
          index === hiddenIndex ? null : (
            <QuizOptionCard
              key={option}
              ariaLabel={`Letter ${option}`}
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
