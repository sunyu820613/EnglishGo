import type { SideProfilePose } from '../../../data/phonemes.types';
import styles from './SideProfileRig.module.css';

interface SideProfileRigProps {
  pose: SideProfilePose;
  /** CSS transition length (ms) to ease into this pose; 0 = jump instantly. */
  transitionMs?: number;
  label?: string;
  className?: string;
}

/**
 * Parametric, cartoon-styled side (cross-section) mouth/throat view. Faces
 * right (nose right, throat left) per docs/phoneme-animation-spec.md §2.
 *
 * Layout: a static head silhouette + neck (drawn once, never moves) contains
 * a static mouth-cavity outline (the "channel" from throat to lips, kept
 * inside the head silhouette so the mouth reads as a cutaway rather than a
 * shape pasted on top of the face). Everything that reads as an *organ* —
 * lips, tongue, velum, vocal cords, airflow — is layered on top of that
 * fixed cavity and driven by `pose`. The tongue is one continuous path (not
 * overlapping ellipses) whose root/body/tip control points move with the
 * matching pose fields.
 */
export function SideProfileRig({ pose, transitionMs = 0, label, className }: SideProfileRigProps) {
  const dur = `${transitionMs}ms`;

  // Lips: vertical half-gap grows with jawOpen, revealing the cavity/teeth
  // behind them; lipRound pushes both lips forward (further right).
  const halfGapPx = pose.jawOpen * 18;
  const lipProtrudePx = pose.lipRound * 10;

  // Tongue: root only varies by height (schema has no tongueRootAdvance —
  // matches docs/phoneme-animation-spec.md §2), body/tip vary by both.
  const rootX = 138;
  const rootY = 155 - pose.tongueRootHeight * 30;
  const bodyX = 148 + pose.tongueBodyAdvance * 22;
  const bodyY = 148 - pose.tongueBodyHeight * 32;
  const tipX = 172 + pose.tongueTipAdvance * 20;
  const tipY = 152 - pose.tongueTipHeight * 42;
  // Floor anchors are fixed — the tongue always sits on the cavity floor;
  // only its upper (back/body/tip) outline moves.
  const tonguePath = `M128 164 L${rootX} ${rootY} Q${bodyX} ${bodyY} ${tipX} ${tipY} L192 172 Z`;

  const velumRotation = -8 + pose.velumOpen * 55; // closed = tucked against the palate, open = dropped into the throat
  const usesNasalOutlet = pose.velumOpen >= 0.5;
  const showAirflow = pose.airflow === 'continuous';

  return (
    // See FrontMouthRig for why layout classes go on a wrapping div rather
    // than the <svg> itself (aspect-ratio + flexbox sizing quirk).
    <div className={className}>
      <svg
        viewBox="0 0 300 300"
        className={styles.svg}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      >
        {/* Static structure: neck first so the head silhouette overlaps its
            top edge, then the head/ear/nose, then the (also static) mouth
            cavity channel and teeth. None of these consume pose fields. */}
        <rect x="82" y="185" width="66" height="96" rx="18" className={styles.neck} />
        <ellipse cx="115" cy="105" rx="95" ry="98" className={styles.headOutline} />
        <circle cx="30" cy="118" r="17" className={styles.headOutline} />
        <path d="M195 78 L218 90 L193 101 Z" className={styles.headOutline} />

        <path
          d="M200 120 Q150 98 125 122 L125 166 Q148 186 200 174 Z"
          className={styles.cavity}
        />

        {/* Soft palate (velum), hinged near the back of the cavity roof;
            rotates down to open a path to the nose. */}
        <g
          className={styles.velum}
          style={{
            transform: `rotate(${velumRotation}deg)`,
            transformOrigin: '125px 122px',
            transitionDuration: dur,
          }}
        >
          <path d="M125 122 Q142 110 157 122 Q143 132 125 122 Z" className={styles.velumShape} />
        </g>

        {/* Tongue: one continuous shape; root/body/tip control points move
            with the matching pose fields, floor stays anchored to the
            cavity so it always reads as "resting inside" the mouth. */}
        <path d={tonguePath} className={styles.tongue} />

        {/* Teeth, drawn on top of the tongue at the front of the cavity so
            they stay visible regardless of tongue position. */}
        <g className={styles.teeth}>
          <line x1="190" y1="122" x2="190" y2="131" />
          <line x1="197" y1="120" x2="197" y2="128" />
          <line x1="190" y1="165" x2="190" y2="174" />
          <line x1="197" y1="168" x2="197" y2="176" />
        </g>

        {/* Lips, straddling the cavity's mouth-opening (right) edge so they
            read as growing out of the opening rather than floating loose. */}
        <g style={{ transform: `translateX(${lipProtrudePx}px)`, transitionDuration: dur }}>
          <ellipse
            cx="201"
            cy="118"
            rx="12"
            ry="10"
            className={styles.lipUpper}
            style={{ transform: `translateY(${-4 - halfGapPx}px)`, transitionDuration: dur }}
          />
          <ellipse
            cx="201"
            cy="178"
            rx="12"
            ry="10"
            className={styles.lipLower}
            style={{ transform: `translateY(${4 + halfGapPx}px)`, transitionDuration: dur }}
          />
        </g>

        {/* Vocal cords (glottis), in a small window at the top of the neck. */}
        <rect x="96" y="201" width="30" height="34" rx="8" className={styles.glottisBox} />
        <g className={[styles.glottis, pose.voicing ? styles.glottisActive : ''].filter(Boolean).join(' ')}>
          <line x1="102" y1="211" x2="120" y2="211" />
          <line x1="102" y1="225" x2="120" y2="225" />
        </g>

        {/* Mouth-outlet airflow lines (all phonemes except /ŋ/-style nasal ones). */}
        <g
          className={styles.airflowMouth}
          style={{ opacity: showAirflow && !usesNasalOutlet ? 1 : 0 }}
          aria-hidden="true"
        >
          <path d="M217 130 Q229 128 237 122" />
          <path d="M217 147 Q231 147 240 145" />
          <path d="M217 162 Q229 164 237 170" />
        </g>

        {/* Nose-outlet airflow lines (only /ŋ/ in M2 — separate layer, not shared with the mouth group). */}
        <g
          className={styles.airflowNose}
          style={{ opacity: showAirflow && usesNasalOutlet ? 1 : 0 }}
          aria-hidden="true"
        >
          <path d="M212 80 Q224 70 234 62" />
          <path d="M218 88 Q230 80 240 74" />
        </g>
      </svg>
    </div>
  );
}
