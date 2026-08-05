import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { audioService } from '../../audio/useAudioService';
import { alphabet } from '../../data/alphabet';
import { letterAudioPath } from '../../data/paths';
import { hasLowercaseTracingData, hasTracingData } from '../../data/letterStrokes';
import { useProgressStore } from '../../store/progressStore';
import { useSettingsStore } from '../../store/settingsStore';
import { ColorWheelPicker } from './ColorWheelPicker';
import { LetterCanvas, type LetterCanvasHandle } from './LetterCanvas';
import styles from './TraceLetterPage.module.css';

type Case = 'upper' | 'lower';

const GRID_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
type GridCount = (typeof GRID_COUNTS)[number];

export function TraceLetterPage() {
  const { letter: letterParam } = useParams<{ letter: string }>();
  const letter = letterParam?.toUpperCase();
  const entry = alphabet.find((e) => e.letter === letter);
  const navigate = useNavigate();
  const markLetterTraced = useProgressStore((s) => s.markLetterTraced);
  const voiceGender = useSettingsStore((s) => s.voiceGender);
  const penColor = useSettingsStore((s) => s.tracingPenColor);
  const guideColor = useSettingsStore((s) => s.tracingGuideColor);
  const setTracingPenColor = useSettingsStore((s) => s.setTracingPenColor);
  const setTracingGuideColor = useSettingsStore((s) => s.setTracingGuideColor);

  const [step, setStep] = useState<Case>('upper');
  const [gridCount, setGridCount] = useState<GridCount>(1);
  const boardRefs = useRef<(LetterCanvasHandle | null)[]>([]);
  const pageRef = useRef<HTMLDivElement>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);

  const hasLower = letter ? hasLowercaseTracingData(letter) : false;
  const caseLetter = letter ? (step === 'upper' ? letter : letter.toLowerCase()) : undefined;

  // Fill exactly the viewport height remaining below the site header (no
  // page-level scrollbar), and expose the resulting canvas-area height as a
  // CSS var so the board(s) can shrink to fit vertically too, not just
  // horizontally.
  useLayoutEffect(() => {
    const pageEl = pageRef.current;
    const areaEl = canvasAreaRef.current;
    if (!pageEl || !areaEl) return;

    const updateHeight = () => {
      const top = pageEl.getBoundingClientRect().top;
      pageEl.style.height = `calc(100dvh - ${top}px)`;
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);

    // Reserve a small margin so the completion ring/glow (drawn outside the
    // board's own box) has room to render without being clipped by this
    // area's overflow: hidden.
    const RING_MARGIN_PX = 16;
    const ROW_GAP_PX = 12; // var(--space-sm), the canvasGrid row gap
    const columns = Math.min(gridCount, 3);
    const rows = Math.ceil(gridCount / columns);
    const resizeObserver = new ResizeObserver(() => {
      const perRowHeight = (areaEl.clientHeight - RING_MARGIN_PX - ROW_GAP_PX * (rows - 1)) / rows;
      areaEl.style.setProperty('--stage-max-h', `${Math.max(perRowHeight, 0)}px`);
    });
    resizeObserver.observe(areaEl);

    return () => {
      window.removeEventListener('resize', updateHeight);
      resizeObserver.disconnect();
    };
  }, [gridCount]);

  const genderedLetterAudio = entry
    ? voiceGender === 'male'
      ? (entry.letterAudioMale ?? entry.letterAudio)
      : (entry.letterAudioFemale ?? entry.letterAudio)
    : null;

  const finishCase = useCallback(
    (caseSensitiveLetter: string) => {
      console.log('[TRACE-DEBUG] finishCase', caseSensitiveLetter, genderedLetterAudio);
      markLetterTraced(caseSensitiveLetter);
      if (genderedLetterAudio) {
        void audioService.playVoice(letterAudioPath(genderedLetterAudio));
      }
    },
    [genderedLetterAudio, markLetterTraced],
  );

  if (!entry || !letter || !caseLetter || !hasTracingData(letter)) {
    return <Navigate to={letter ? `/alphabet/${letter}` : '/alphabet'} replace />;
  }

  return (
    <div className={styles.tracePage} ref={pageRef}>
      <div className={styles.traceContainer}>
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

        <div className={styles.toolbar}>
          <ColorWheelPicker
            value={guideColor ?? 'var(--color-outline)'}
            onChange={setTracingGuideColor}
            label="Letter color"
          />
          <ColorWheelPicker
            value={penColor ?? 'var(--color-primary)'}
            onChange={setTracingPenColor}
            label="Pen color"
          />
          <label className={styles.countLabel}>
            Boards
            <select
              className={styles.countSelect}
              value={gridCount}
              onChange={(e) => setGridCount(Number(e.target.value) as GridCount)}
            >
              {GRID_COUNTS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.canvasArea} ref={canvasAreaRef}>
          <div
            className={styles.canvasGrid}
            style={{ gridTemplateColumns: `repeat(${Math.min(gridCount, 3)}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: gridCount }, (_, i) => (
              <LetterCanvas
                key={`${caseLetter}-${i}`}
                ref={(el) => {
                  boardRefs.current[i] = el;
                }}
                letter={caseLetter}
                onComplete={() => finishCase(caseLetter)}
                penColor={penColor}
                guideColor={guideColor}
              />
            ))}
          </div>
        </div>

        <div className={styles.watchMeWrap}>
          <button
            type="button"
            className={styles.watchMeButton}
            onClick={() => boardRefs.current[0]?.playAnimation()}
          >
            Watch me write it
          </button>
        </div>
      </div>
    </div>
  );
}
