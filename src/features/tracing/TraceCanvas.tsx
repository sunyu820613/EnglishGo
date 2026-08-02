import { useEffect } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { TRACE_VIEW_BOX, type TraceStroke } from '../../data/tracing.types';
import { useTraceProgress } from './useTraceProgress';
import styles from './TraceCanvas.module.css';

interface TraceCanvasProps {
  strokes: readonly TraceStroke[];
  onComplete: () => void;
  onRetry?: () => void;
  /** Render already-done, non-interactively — used when revisiting a case
   * that was completed in an earlier visit. */
  initiallyComplete?: boolean;
}

/** One case (upper or lower) of one letter: renders the locked/active/done
 * stroke outlines, the active stroke's start hint and progressively-drawn
 * "ink" as it's traced, and a guide dot that follows the pointer within
 * tolerance and eases back onto the path otherwise. See docs from
 * architect/frontend-designer review for the interaction spec. */
export function TraceCanvas({ strokes, onComplete, onRetry, initiallyComplete = false }: TraceCanvasProps) {
  const {
    svgRef,
    activeStrokeIndex,
    strokeStatuses,
    guideDot,
    isComplete,
    inkPoints,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useTraceProgress(strokes, onComplete, { initiallyComplete });
  const reducedMotion = usePrefersReducedMotion();

  // requestAnimationFrame-throttled inside the hook; this just forwards the
  // native coordinates for every move while the pointer is captured, and
  // only while it's actually down (a hovering pointer must not advance
  // progress — only pointermove is a DOM event, "is it down" is state we
  // track ourselves from down/up/cancel).
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onMove = (e: PointerEvent) => handlePointerMove(e);
    const onUp = () => handlePointerUp();
    svg.addEventListener('pointermove', onMove);
    svg.addEventListener('pointerup', onUp);
    svg.addEventListener('pointercancel', onUp);
    return () => {
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerup', onUp);
      svg.removeEventListener('pointercancel', onUp);
    };
  }, [svgRef, handlePointerMove, handlePointerUp]);

  const active = strokes[activeStrokeIndex];
  const notYetStarted = inkPoints.length <= 1;
  const inkPath = inkPoints.length > 1 ? 'M' + inkPoints.map(([x, y]) => `${x},${y}`).join(' L') : null;

  const handleSvgClick = () => {
    if (isComplete && onRetry) {
      onRetry();
    }
  };

  return (
    <svg
      ref={svgRef}
      viewBox={TRACE_VIEW_BOX}
      className={[styles.canvas, isComplete ? styles.complete : '', isComplete && onRetry ? styles.clickableComplete : ''].join(' ')}
      onPointerDown={(e) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        if (!isComplete) handlePointerDown();
      }}
      onClick={handleSvgClick}
      role="img"
      aria-label={isComplete ? 'Tracing complete — tap to retry' : 'Letter tracing practice'}
    >
      {strokes.map((stroke, i) => (
        <path
          key={i}
          d={stroke.d}
          className={[styles.stroke, styles[strokeStatuses[i] ?? 'locked']].join(' ')}
          fill="none"
        />
      ))}

      {/* Stroke order numbers — placed near each stroke's start point */}
      {strokes.length > 1 ? strokes.map((stroke, i) => (
        <g key={`order-${i}`} className={styles.orderNumber}>
          <circle
            cx={stroke.start.x}
            cy={stroke.start.y - 18}
            r={12}
            className={styles.orderCircle}
          />
          <text
            x={stroke.start.x}
            y={stroke.start.y - 18}
            textAnchor="middle"
            dominantBaseline="central"
            className={styles.orderText}
          >
            {i + 1}
          </text>
        </g>
      )) : null}

      {inkPath && !isComplete ? <path d={inkPath} className={styles.ink} fill="none" /> : null}

      {active && !isComplete && notYetStarted ? (
        <g className={reducedMotion ? styles.startHintStill : styles.startHint}>
          <circle cx={active.start.x} cy={active.start.y} r={8} className={styles.startDot} />
          <polygon
            points="0,-7 12,0 0,7"
            className={styles.startArrow}
            transform={`translate(${active.start.x + 26 * Math.cos((active.startAngleDeg * Math.PI) / 180)}, ${
              active.start.y + 26 * Math.sin((active.startAngleDeg * Math.PI) / 180)
            }) rotate(${active.startAngleDeg})`}
          />
        </g>
      ) : null}

      {guideDot && !isComplete ? (
        <circle
          cx={guideDot.x}
          cy={guideDot.y}
          r={7}
          className={[styles.guideDot, guideDot.following ? '' : styles.guideDotSnapped].join(' ')}
        />
      ) : null}

      {isComplete && onRetry ? (
        <text
          x={100}
          y={180}
          textAnchor="middle"
          className={styles.retryHint}
        >
          Tap to try again
        </text>
      ) : null}
    </svg>
  );
}
