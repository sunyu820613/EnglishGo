import type { CSSProperties } from 'react';
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
 * The tongue is three independently-positioned segments (tip/body/root);
 * `velumOpen` doubles as the switch between the mouth-outlet and
 * nose-outlet airflow layers (§3 "/ŋ/ 的气流出口特殊说明") — the two
 * layers are always both in the DOM as separate groups (§ implementation
 * requirement 7) and only their visibility differs.
 */
export function SideProfileRig({ pose, transitionMs = 0, label, className }: SideProfileRigProps) {
  const jawOffsetPx = pose.jawOpen * 18;
  const lipProtrudePx = pose.lipRound * 10;

  const tipX = 150 + pose.tongueTipAdvance * 24;
  const tipY = 120 - pose.tongueTipHeight * 44;
  const bodyX = 110 + pose.tongueBodyAdvance * 20;
  const bodyY = 116 - pose.tongueBodyHeight * 40;
  // The rig schema has no tongueRootAdvance (§2 — root only varies by height).
  const rootY = 112 - pose.tongueRootHeight * 34;

  const velumRotation = -35 + pose.velumOpen * 45; // closed = sealed against nasal passage, open = dropped
  const usesNasalOutlet = pose.velumOpen >= 0.5;
  const showAirflow = pose.airflow === 'continuous';

  const dur = `${transitionMs}ms`;
  const tongueStyle = (x: number, y: number): CSSProperties => ({
    transform: `translate(${x}px, ${y}px)`,
    transitionDuration: dur,
  });

  return (
    // See FrontMouthRig for why layout classes go on a wrapping div rather
    // than the <svg> itself (aspect-ratio + flexbox sizing quirk).
    <div className={className}>
      <svg
        viewBox="0 0 220 180"
        className={styles.svg}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      >
        <path
          d="M18 60 C10 20 70 6 120 10 C170 14 200 40 205 55 C208 64 198 66 190 62
             C186 78 186 96 190 112 L172 128 C160 140 140 150 118 150
             C80 150 40 132 26 100 C16 78 18 68 18 60 Z"
          className={styles.headOutline}
        />

        {/* Lower jaw, offset down by jawOpen. */}
        <path
          d="M118 150 C150 150 178 136 192 114"
          className={styles.jawLine}
          style={{ transform: `translateY(${jawOffsetPx}px)`, transitionDuration: dur }}
        />

        {/* Lips at the mouth opening (right edge). */}
        <g
          style={{ transform: `translateX(${lipProtrudePx}px)`, transitionDuration: dur }}
          className={styles.lipsGroup}
        >
          <path
            d="M186 96 C196 92 204 94 208 98"
            className={styles.lipUpper}
            style={{ transform: `translateY(${-jawOffsetPx * 0.3}px)`, transitionDuration: dur }}
          />
          <path
            d="M186 106 C196 110 204 108 208 104"
            className={styles.lipLower}
            style={{ transform: `translateY(${jawOffsetPx * 0.6}px)`, transitionDuration: dur }}
          />
        </g>

        {/* Soft palate (velum), rotates open for nasal airflow. */}
        <g
          className={styles.velum}
          style={{
            transform: `rotate(${velumRotation}deg)`,
            transformOrigin: '96px 44px',
            transitionDuration: dur,
          }}
        >
          <path d="M80 44 Q100 30 116 44" className={styles.velumShape} />
        </g>

        {/* Tongue: root / body / tip, each an independently-positioned blob. */}
        <ellipse
          cx="72"
          cy="112"
          rx="26"
          ry="18"
          className={styles.tongueRoot}
          style={tongueStyle(0, rootY - 112)}
        />
        <ellipse
          cx="110"
          cy="116"
          rx="26"
          ry="16"
          className={styles.tongueBody}
          style={tongueStyle(bodyX - 110, bodyY - 116)}
        />
        <ellipse
          cx="150"
          cy="120"
          rx="20"
          ry="13"
          className={styles.tongueTip}
          style={tongueStyle(tipX - 150, tipY - 120)}
        />

        {/* Vocal cords (glottis) indicator, near the throat. */}
        <g className={[styles.glottis, pose.voicing ? styles.glottisActive : ''].filter(Boolean).join(' ')}>
          <line x1="20" y1="52" x2="34" y2="52" />
          <line x1="20" y1="60" x2="34" y2="60" />
        </g>

        {/* Mouth-outlet airflow lines (all phonemes except /ŋ/-style nasal ones). */}
        <g
          className={styles.airflowMouth}
          style={{ opacity: showAirflow && !usesNasalOutlet ? 1 : 0 }}
          aria-hidden="true"
        >
          <path d="M210 92 Q222 92 230 88" />
          <path d="M210 100 Q224 100 233 98" />
          <path d="M210 108 Q222 108 230 112" />
        </g>

        {/* Nose-outlet airflow lines (only /ŋ/ in M2 — separate layer, not shared with the mouth group). */}
        <g
          className={styles.airflowNose}
          style={{ opacity: showAirflow && usesNasalOutlet ? 1 : 0 }}
          aria-hidden="true"
        >
          <path d="M186 16 Q196 8 204 2" />
          <path d="M192 22 Q204 16 212 10" />
        </g>
      </svg>
    </div>
  );
}
