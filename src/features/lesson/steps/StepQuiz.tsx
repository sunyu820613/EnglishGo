import { useState } from 'react';
import type { AlphabetLetter } from '../../../data/alphabet.types';
import { wordAudioPath, wordImagePath, phraseAudioPath } from '../../../data/paths';
import { wordAudioPathGendered } from '../../../data/paths';
import { audioService } from '../../../audio/useAudioService';
import { SoundButton } from '../../../components/SoundButton';
import { useSettingsStore } from '../../../store/settingsStore';
import { QuizOptionCard, type QuizOptionState } from '../../../components/QuizOptionCard';
import { Celebration } from '../Celebration';
import { generateQuizOptions } from '../optionGenerators';
import { useGentleRetry } from '../useGentleRetry';
import styles from './StepQuiz.module.css';

interface StepQuizProps {
  letterEntry: AlphabetLetter;
  allLetters: AlphabetLetter[];
  reducedMotion: boolean;
  onCompleted: () => void;
}

export function StepQuiz({ letterEntry, allLetters, reducedMotion, onCompleted }: StepQuizProps) {
  const [options] = useState(() => generateQuizOptions(letterEntry, allLetters));
  const voiceGender = useSettingsStore((s) => s.voiceGender);
  const [completedIndex, setCompletedIndex] = useState<number | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const { wrongIndex, reduced, registerWrongAttempt } = useGentleRetry();

  const correctId = letterEntry.words[0]!.id;
  const hiddenIndex = reduced ? options.findIndex((o) => o.id !== correctId) : -1;

  const handleSelect = (index: number) => {
    if (completedIndex !== null) return;
    const option = options[index]!;
    if (option.id === correctId) {
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
      <h2 className={styles.heading}>Listen and find!</h2>
      <SoundButton
        src={voiceGender !== 'female' ? wordAudioPathGendered(letterEntry.words[0]!.audio, voiceGender) : wordAudioPath(letterEntry.words[0]!.audio)}
        fallbackSrc={voiceGender !== 'female' ? wordAudioPath(letterEntry.words[0]!.audio) : undefined}
        label="Listen to word"
        size="primary"
      />
      <div className={styles.options}>
        {options.map((option, index) =>
          index === hiddenIndex ? null : (
            <QuizOptionCard
              key={option.id}
              ariaLabel={`Option ${option.text}`}
              state={cardState(index)}
              reducedMotion={reducedMotion}
              onClick={() => handleSelect(index)}
            >
              <img src={wordImagePath(option.image)} alt="" className={styles.optionImage} />
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
