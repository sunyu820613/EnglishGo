// Ported from D:\AI\LetterBoard (src/components/LetterBoard.tsx) per user request to
// replace the previous SVG-based tracing engine. Kept the original canvas drawing /
// tolerance-matching / demo-animation logic; swapped hardcoded hex colors for this
// project's design tokens, and added initiallyComplete (for revisiting an
// already-traced case) and prefers-reduced-motion handling to match this app's
// existing conventions.
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { isPointNearStroke, type Point } from './canvasGeometry';
import { playStrokeAnimation, sampleStrokePath } from './animateStroke';
import { CANVAS_HEIGHT, CANVAS_WIDTH, GRID_LINES, LETTER_DATA } from '../../data/letterStrokes';
import styles from './LetterCanvas.module.css';

const STROKE_DISTANCE_TOLERANCE_PX = 22;
const STROKE_COMPLETE_RATIO = 0.8;
const MIN_POINTS_TO_EVALUATE = 5;
const ANIMATION_SAMPLE_COUNT = 40;
const ANIMATION_DURATION_PER_STROKE_MS = 900;
const ANIMATION_GAP_MS = 300;
const GUIDE_LINE_WIDTH = 14;
const USER_LINE_WIDTH = 8;
const ANIMATION_LINE_WIDTH = 10;

export interface LetterCanvasHandle {
  playAnimation: () => void;
  stopAnimation: () => void;
  resetBoard: () => void;
}

export interface LetterCanvasProps {
  letter: string;
  onComplete: () => void;
  /** Render already-done, non-interactively — used when revisiting a case
   * that was completed in an earlier visit. */
  initiallyComplete?: boolean;
}

/** Canvas 2D needs concrete color strings, not live CSS var()/color-mix(). */
function readTokenColors() {
  const cs = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    grid: get('--color-outline', '#cce0f5'),
    guide: get('--color-outline', '#cccccc'),
    completedGuide: get('--color-success', '#90ee90'),
    animation: get('--color-accent', '#f28c28'),
    userInk: get('--color-primary', '#3483eb'),
  };
}

/** ThemeProvider applies `data-theme` in its own effect, which — because
 * React flushes child effects before parent effects — always runs *after*
 * this component's own mount effect on a fresh page load. Reading tokens
 * once during render/mount can therefore catch the DOM before any theme
 * colors exist. Re-reading one frame later (after all mount effects have
 * flushed) picks up the real values. */
function useTokenColors() {
  const [colors, setColors] = useState(readTokenColors);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setColors(readTokenColors()));
    return () => cancelAnimationFrame(raf);
  }, []);
  return colors;
}

function drawGrid(ctx: CanvasRenderingContext2D, color: string): void {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 2;
  const lines = [GRID_LINES.top, GRID_LINES.upperMid, GRID_LINES.lowerMid, GRID_LINES.bottom];
  for (const y of lines) {
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(CANVAS_WIDTH - 20, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStrokePath(ctx: CanvasRenderingContext2D, path: Point[], color: string, lineWidth: number): void {
  if (path.length === 0) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(path[0]!.x, path[0]!.y);
  if (path.length === 1 || (path.length === 2 && path[0]!.x === path[1]!.x && path[0]!.y === path[1]!.y)) {
    ctx.arc(path[0]!.x, path[0]!.y, lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i]!.x, path[i]!.y);
    ctx.stroke();
  }
}

function getCanvasPoint(canvas: HTMLCanvasElement, event: ReactPointerEvent<HTMLCanvasElement>): Point {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

export const LetterCanvas = forwardRef<LetterCanvasHandle, LetterCanvasProps>(function LetterCanvas(
  { letter, onComplete, initiallyComplete = false },
  ref,
) {
  const guideCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const colors = useTokenColors();
  const reducedMotion = usePrefersReducedMotion();

  const currentStrokeIndexRef = useRef(0);
  const completedUserStrokesRef = useRef<Point[][]>([]);
  const currentAttemptRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const cancelAnimationFrameRef = useRef<(() => void) | null>(null);
  const animationTimeoutRef = useRef<number | null>(null);
  const completedRef = useRef(initiallyComplete);
  const [isComplete, setIsComplete] = useState(initiallyComplete);

  const letterData = LETTER_DATA[letter];

  const redrawGuideCanvas = useCallback(() => {
    const ctx = guideCanvasRef.current?.getContext('2d');
    if (!ctx || !letterData) return;
    drawGrid(ctx, colors.grid);
    letterData.strokes.forEach((strokePath, index) => {
      const color = index < currentStrokeIndexRef.current ? colors.completedGuide : colors.guide;
      drawStrokePath(ctx, strokePath, color, GUIDE_LINE_WIDTH);
    });
  }, [letterData, colors]);

  const redrawUserCanvas = useCallback(() => {
    const ctx = drawCanvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    completedUserStrokesRef.current.forEach((path) => {
      drawStrokePath(ctx, path, colors.userInk, USER_LINE_WIDTH);
    });
  }, [colors]);

  const clearAnimationTimers = useCallback(() => {
    if (cancelAnimationFrameRef.current) {
      cancelAnimationFrameRef.current();
      cancelAnimationFrameRef.current = null;
    }
    if (animationTimeoutRef.current !== null) {
      window.clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, []);

  const resetBoard = useCallback(() => {
    clearAnimationTimers();
    isAnimatingRef.current = false;
    currentStrokeIndexRef.current = 0;
    completedUserStrokesRef.current = [];
    currentAttemptRef.current = [];
    isDrawingRef.current = false;
    completedRef.current = false;
    setIsComplete(false);
    redrawGuideCanvas();
    redrawUserCanvas();
  }, [clearAnimationTimers, redrawGuideCanvas, redrawUserCanvas]);

  const stopAnimation = useCallback(() => {
    clearAnimationTimers();
    isAnimatingRef.current = false;
    redrawGuideCanvas();
  }, [clearAnimationTimers, redrawGuideCanvas]);

  const playAnimation = useCallback(() => {
    if (!letterData || isAnimatingRef.current || completedRef.current) return;
    if (reducedMotion) return; // motion is the entire point of this feature
    isAnimatingRef.current = true;

    const playStrokeAt = (index: number): void => {
      if (!isAnimatingRef.current) return;
      if (index >= letterData.strokes.length) {
        isAnimatingRef.current = false;
        redrawGuideCanvas();
        return;
      }
      const sampled = sampleStrokePath(letterData.strokes[index]!, ANIMATION_SAMPLE_COUNT);
      cancelAnimationFrameRef.current = playStrokeAnimation({
        points: sampled,
        durationMs: ANIMATION_DURATION_PER_STROKE_MS,
        onFrame: (drawnPoints) => {
          const ctx = guideCanvasRef.current?.getContext('2d');
          if (!ctx) return;
          redrawGuideCanvas();
          drawStrokePath(ctx, drawnPoints, colors.animation, ANIMATION_LINE_WIDTH);
        },
        onComplete: () => {
          animationTimeoutRef.current = window.setTimeout(() => playStrokeAt(index + 1), ANIMATION_GAP_MS);
        },
      });
    };
    playStrokeAt(0);
  }, [letterData, redrawGuideCanvas, colors, reducedMotion]);

  useImperativeHandle(ref, () => ({ playAnimation, stopAnimation, resetBoard }), [
    playAnimation,
    stopAnimation,
    resetBoard,
  ]);

  useEffect(() => {
    if (initiallyComplete && letterData) {
      currentStrokeIndexRef.current = letterData.strokes.length;
      completedRef.current = true;
    }
    setIsComplete(initiallyComplete);
    redrawGuideCanvas();
    redrawUserCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter]);

  useEffect(() => clearAnimationTimers, [clearAnimationTimers]);

  // Re-draw once the tokens have been re-read post-mount (see useTokenColors).
  useEffect(() => {
    redrawGuideCanvas();
    redrawUserCanvas();
  }, [redrawGuideCanvas, redrawUserCanvas]);

  const finishAttempt = useCallback(() => {
    if (!letterData) return;
    const attempt = currentAttemptRef.current;
    currentAttemptRef.current = [];

    if (attempt.length < MIN_POINTS_TO_EVALUATE) {
      redrawUserCanvas();
      return;
    }

    const targetStroke = letterData.strokes[currentStrokeIndexRef.current]!;
    const nearCount = attempt.filter((p) => isPointNearStroke(p, targetStroke, STROKE_DISTANCE_TOLERANCE_PX)).length;
    const ratio = nearCount / attempt.length;

    if (ratio >= STROKE_COMPLETE_RATIO) {
      completedUserStrokesRef.current.push(attempt);
      currentStrokeIndexRef.current += 1;
      redrawGuideCanvas();
      redrawUserCanvas();
      if (currentStrokeIndexRef.current >= letterData.strokes.length && !completedRef.current) {
        completedRef.current = true;
        setIsComplete(true);
        onComplete();
      }
    } else {
      redrawUserCanvas();
    }
  }, [letterData, onComplete, redrawGuideCanvas, redrawUserCanvas]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      const canvas = drawCanvasRef.current;
      if (!canvas || !letterData) return;
      if (isAnimatingRef.current || completedRef.current) return;
      if (currentStrokeIndexRef.current >= letterData.strokes.length) return;

      canvas.setPointerCapture(event.pointerId);
      const point = getCanvasPoint(canvas, event);
      currentAttemptRef.current = [point];
      isDrawingRef.current = true;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = colors.userInk;
        ctx.beginPath();
        ctx.arc(point.x, point.y, USER_LINE_WIDTH / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [letterData, colors],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      if (!isDrawingRef.current) return;
      const canvas = drawCanvasRef.current;
      if (!canvas) return;

      const point = getCanvasPoint(canvas, event);
      const attempt = currentAttemptRef.current;
      const lastPoint = attempt[attempt.length - 1];
      attempt.push(point);

      const ctx = canvas.getContext('2d');
      if (ctx && lastPoint) drawStrokePath(ctx, [lastPoint, point], colors.userInk, USER_LINE_WIDTH);
    },
    [colors],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      drawCanvasRef.current?.releasePointerCapture(event.pointerId);
      finishAttempt();
    },
    [finishAttempt],
  );

  if (!letterData) return null;

  return (
    <div
      className={[styles.stage, isComplete ? styles.complete : ''].join(' ')}
      aria-label="Letter tracing practice"
    >
      <canvas ref={guideCanvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className={styles.canvasLayer} />
      <canvas
        ref={drawCanvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className={[styles.canvasLayer, styles.drawLayer].join(' ')}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      {isComplete ? (
        <button type="button" className={styles.retryOverlay} onClick={resetBoard} aria-label="Tap to try again">
          <span className={styles.retryHint}>Tap to try again</span>
        </button>
      ) : null}
    </div>
  );
});
