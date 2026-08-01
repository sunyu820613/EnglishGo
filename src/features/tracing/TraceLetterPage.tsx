import { useCallback, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { audioService } from '../../audio/useAudioService';
import { alphabet } from '../../data/alphabet';
import { letterAudioPath } from '../../data/paths';
import { hasTracingData, tracingPaths } from '../../data/tracingPaths';
import { useProgressStore } from '../../store/progressStore';
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
  const isLetterTraced = useProgressStore((s) => s.isLetterTraced);

  const [step, setStep] = useState<Case>('upper');

  const finishCaseAndAdvance = useCallback(
    (caseSensitiveLetter: string) => {
      markLetterTraced(caseSensitiveLetter);
      if (entry) void audioService.playVoice(letterAudioPath(entry.phonicsAudio));
      setStep((s) => (s === 'upper' ? 'lower' : s));
    },
    [entry, markLetterTraced],
  );

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
            <button
              type="button"
              className={step === 'lower' ? styles.caseActive : styles.caseInactive}
              onClick={() => setStep('lower')}
            >
              {letter.toLowerCase()}
            </button>
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
              key={caseLetter}
              strokes={data.strokes}
              onComplete={() => finishCaseAndAdvance(caseLetter)}
              initiallyComplete={isLetterTraced(caseLetter)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
