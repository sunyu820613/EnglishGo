import type { CSSProperties } from 'react';
import type { FrontMouthPose } from '../../../data/phonemes.types';
import styles from './FrontMouthRig.module.css';

interface FrontMouthRigProps {
  pose: FrontMouthPose;
  /** CSS transition length (ms) to ease into this pose; 0 = jump instantly. */
  transitionMs?: number;
  /** Accessible label, e.g. "Mouth shape for the sound /iː/". Omit for decorative use. */
  label?: string;
  className?: string;
}

/**
 * Parametric, cartoon-styled front (face-on) mouth view. Geometry is fixed;
 * `pose` values drive CSS transforms/opacity on the lip/teeth/tongue layers
 * (docs/phoneme-animation-spec.md §1, §5.1 — no per-phoneme artwork, no
 * literal path morphing). `jawOpen` is the primary driver and the other
 * lip parameters are derived relative to it so the shape reads as one
 * connected mouth rather than independently-moving layers (spec §1
 * "实现要求").
 */
export function FrontMouthRig({ pose, transitionMs = 0, label, className }: FrontMouthRigProps) {
  // lipCompression softens how far the jaw appears to open (reserved mostly
  // for stops in M3; only /θ/ uses a small non-zero value in M2).
  const effectiveJawOpen = pose.jawOpen * (1 - pose.lipCompression * 0.5);
  const jawOffsetPx = effectiveJawOpen * 24;
  const widthScale = 1 + pose.lipSpread * 0.22 - pose.lipRound * 0.32;
  const cornerOpacity = Math.min(1, pose.cornerPull);
  const teethOpacity = pose.teethVisible;
  const tonguePeekScale = pose.tonguePeek;

  const rigStyle: CSSProperties = {
    transitionDuration: `${transitionMs}ms`,
    ['--jaw-offset' as string]: `${jawOffsetPx}px`,
    ['--lip-width-scale' as string]: widthScale,
  };

  return (
    // The <svg>'s intrinsic aspect-ratio makes it a "replaced element" that
    // flexbox sizes unpredictably when flex/padding classes (e.g. the
    // detail page's .rigCanvas) are applied directly to it — wrapping it in
    // a plain div for layout classes and keeping the svg itself at a fixed
    // width:100% sidesteps that browser quirk.
    <div className={className}>
      <svg
        viewBox="0 0 200 160"
        className={styles.svg}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      >
        <ellipse cx="100" cy="80" rx="92" ry="78" className={styles.faceBg} />

        <g className={styles.mouthGroup} style={rigStyle}>
          <rect
            x="58"
            y="56"
            width="84"
            height="14"
            rx="5"
            className={styles.teethUpper}
            style={{ opacity: teethOpacity, transitionDuration: `${transitionMs}ms` }}
          />
          <rect
            x="58"
            y="90"
            width="84"
            height="14"
            rx="5"
            className={styles.teethLower}
            style={{ opacity: teethOpacity * 0.85, transitionDuration: `${transitionMs}ms` }}
          />
          <ellipse
            cx="100"
            cy="98"
            rx="20"
            ry="12"
            className={styles.tonguePeek}
            style={{
              opacity: tonguePeekScale > 0.05 ? 1 : 0,
              transform: `scaleY(${Math.max(0.001, tonguePeekScale)})`,
              transitionDuration: `${transitionMs}ms`,
            }}
          />
          <path
            d="M40 80 Q100 62 160 80 Q100 74 40 80 Z"
            className={styles.upperLip}
            style={{ transitionDuration: `${transitionMs}ms` }}
          />
          <path
            d="M40 80 Q100 98 160 80 Q100 118 40 80 Z"
            className={styles.lowerLip}
            style={{ transitionDuration: `${transitionMs}ms` }}
          />
          <circle
            cx="42"
            cy="80"
            r="4"
            className={styles.cornerAccent}
            style={{ opacity: cornerOpacity, transitionDuration: `${transitionMs}ms` }}
          />
          <circle
            cx="158"
            cy="80"
            r="4"
            className={styles.cornerAccent}
            style={{ opacity: cornerOpacity, transitionDuration: `${transitionMs}ms` }}
          />
        </g>
      </svg>
    </div>
  );
}
