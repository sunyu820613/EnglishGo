import { useState } from 'react';
import { alphabet } from '../../../data/alphabet';
import { letterAudioPath } from '../../../data/paths';
import { audioService } from '../../../audio/useAudioService';
import { useSettingsStore } from '../../../store/settingsStore';
import { LetterCanvas } from '../../tracing/LetterCanvas';
import { KidButton } from '../../../components/KidButton';
import styles from './StepTrace.module.css';

interface StepTraceProps {
  letter: string;
  onTraceComplete: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export function StepTrace({ letter, onTraceComplete, onNext, onSkip }: StepTraceProps) {
  const [traced, setTraced] = useState(false);
  const voiceGender = useSettingsStore((s) => s.voiceGender);
  const entry = alphabet.find((e) => e.letter === letter);
  const genderedLetterAudio = entry
    ? voiceGender === 'male'
      ? (entry.letterAudioMale ?? entry.letterAudio)
      : (entry.letterAudioFemale ?? entry.letterAudio)
    : null;

  return (
    <div className={styles.step}>
      <h2 className={styles.heading}>Trace the letter!</h2>
      <div className={styles.canvasWrap}>
        <LetterCanvas
          letter={letter}
          onComplete={() => {
            setTraced(true);
            onTraceComplete();
            if (genderedLetterAudio) {
              void audioService.playVoice(letterAudioPath(genderedLetterAudio));
            }
          }}
        />
      </div>
      {traced ? <KidButton onClick={onNext}>Next</KidButton> : <KidButton onClick={onSkip}>Skip</KidButton>}
    </div>
  );
}
