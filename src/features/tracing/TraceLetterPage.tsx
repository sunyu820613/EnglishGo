import { useCallback, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { audioService } from '../../audio/useAudioService';
import { alphabet } from '../../data/alphabet';
import { letterAudioPath } from '../../data/paths';
import { hasLowercaseTracingData, hasTracingData, tracingPaths } from '../../data/tracingPaths';
import { useProgressStore } from '../../store/progressStore';
import { useSettingsStore } from '../../store/settingsStore';
import page from '../../styles/page.module.css';
import { TraceCanvas } from './TraceCanvas';
import styles from './TraceLetterPage.module.css';

type Case = 'upper' | 'lower';

export function TraceLetterPage() {
  const { letter: letterParam } = useParams<{ letter: string }>();
  const letter = letterParam?.toUpperCase();
  const entry = alphabet.find((e) => e.letter === letter);
  const navigate = useNavigate();
  const markLetterTraced = useProgressStore((s) => s.markLetterTraced);
  const voiceGender = useSettingsStore((s) => s.voiceGender);

  const [step, setStep] = useState<Case>('upper');

  const hasLower = letter ? hasLowercaseTracingData(letter) : false;

  const genderedLetterAudio = entry
    ? voiceGender === 'male'
      ? (entry.letterAudioMale ?? entry.letterAudio)
      : (entry.letterAudioFemale ?? entry.letterAudio)
    : null;

  const finishCaseAndAdvance = useCallback(
    (caseSensitiveLetter: string) => {
      markLetterTraced(caseSensitiveLetter);
      if (genderedLetterAudio) {
        void audioService.playVoice(letterAudioPath(genderedLetterAudio));
      }
      setStep((s) => (s === 'upper' && hasLower ? 'lower' : s));
    },
    [entry, hasLower, markLetterTraced, genderedLetterAudio],
  );

  const [canvasKey, setCanvasKey] = useState(0);

  if (!entry || !letter || !hasTracingData(letter)) {
    return <Navigate to={letter ? `/alphabet/${letter}` : '/alphabet'} replace />;
  }

  const caseLetter = step === 'upper' ? letter : letter.toLowerCase();
  const data = tracingPaths[caseLetter];

  return (
    <div className={page.page}>
      <div className={page.container}>
        <nav className={styles.traceNav}>
          <Link to={`/alphabet/${letter}`} className={`${styles.navLink} ${styles.navSlotStart}`}>
            &larr; Back to {letter}
          </Link>
          <div className={styles.caseToggle}>
            <button
              type="button"
              className={step === 'upper' ? styles.caseActive : styles.caseInactive}
              onClick={() => setStep('upper')}
            >
              {letter}
            </button>
            {hasLower ? (
              <button
                type="button"
                className={step === 'lower' ? styles.caseActive : styles.caseInactive}
                onClick={() => setStep('lower')}
              >
                {letter.toLowerCase()}
              </button>
            ) : null}
          </div>
          <button
            type="button"
            className={`${styles.navLink} ${styles.navSlotEnd}`}
            aria-label="Skip writing practice"
            onClick={() => navigate(`/alphabet/${letter}`)}
          >
            Skip &rarr;
          </button>
        </nav>

        <div className={styles.canvasWrap}>
          {data ? (
            <TraceCanvas
              key={`${caseLetter}-${canvasKey}`}
              strokes={data.strokes}
              onComplete={() => finishCaseAndAdvance(caseLetter)}
              onRetry={() => {
                setCanvasKey((k) => k + 1);
                if (genderedLetterAudio) {
                  void audioService.playVoice(letterAudioPath(genderedLetterAudio));
                }
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
