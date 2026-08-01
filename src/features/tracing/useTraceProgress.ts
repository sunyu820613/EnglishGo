import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TraceStroke } from '../../data/tracing.types';
import { clientToViewBoxPoint, nearestSample, sampleStroke, toleranceInViewBoxUnits, type Point } from './traceGeometry';
import { coverageRatio, isStrokeComplete, markCovered } from './traceState';

export type StrokeStatus = 'locked' | 'active' | 'done';

export interface GuideDotState {
  x: number;
  y: number;
  /** true = snapped to the pointer (inside tolerance), false = snapped
   * back to the nearest point on the path (pointer strayed outside it). */
  following: boolean;
}

const VIEW_BOX_WIDTH = 200;

export interface UseTraceProgressOptions {
  /** Skip interaction and render every stroke already done — used when
   * revisiting a case that was completed in an earlier visit. */
  initiallyComplete?: boolean;
}

export function useTraceProgress(
  strokes: readonly TraceStroke[],
  onComplete: () => void,
  { initiallyComplete = false }: UseTraceProgressOptions = {},
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const samples = useMemo(() => strokes.map((stroke) => sampleStroke(stroke.d)), [strokes]);
  const coveredRef = useRef<Set<number>>(new Set());
  const rafRef = useRef<number | null>(null);
  const pendingPointRef = useRef<Point | null>(null);
  const isPointerDownRef = useRef(false);
  const completedRef = useRef(initiallyComplete);

  const [activeStrokeIndex, setActiveStrokeIndex] = useState(
    initiallyComplete ? Math.max(0, strokes.length - 1) : 0,
  );
  const [guideDot, setGuideDot] = useState<GuideDotState | null>(null);
  const [isComplete, setIsComplete] = useState(initiallyComplete);

  useEffect(() => {
    coveredRef.current = new Set();
    setGuideDot(null);
  }, [activeStrokeIndex]);

  const processPoint = useCallback(
    (point: Point) => {
      const svg = svgRef.current;
      const activeSamples = samples[activeStrokeIndex];
      if (!svg || !activeSamples) return;

      const tolerance = toleranceInViewBoxUnits(svg, VIEW_BOX_WIDTH);
      const nearest = nearestSample(activeSamples, point);
      const onPath = nearest.distance <= tolerance;

      if (onPath) {
        markCovered(coveredRef.current, nearest.index, activeSamples.length);
        setGuideDot({ x: point[0], y: point[1], following: true });
      } else {
        const nearestPoint = activeSamples[nearest.index];
        if (nearestPoint) setGuideDot({ x: nearestPoint[0], y: nearestPoint[1], following: false });
      }

      if (isStrokeComplete(coveredRef.current, activeSamples.length)) {
        if (activeStrokeIndex < strokes.length - 1) {
          setActiveStrokeIndex((i) => i + 1);
        } else if (!completedRef.current) {
          completedRef.current = true;
          setIsComplete(true);
          onComplete();
        }
      }
    },
    [activeStrokeIndex, onComplete, samples, strokes.length],
  );

  const handlePointerDown = useCallback(() => {
    isPointerDownRef.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    isPointerDownRef.current = false;
    pendingPointRef.current = null;
    setGuideDot(null);
  }, []);

  const handlePointerMove = useCallback(
    (e: { clientX: number; clientY: number }) => {
      if (completedRef.current || !isPointerDownRef.current) return;
      const svg = svgRef.current;
      if (!svg) return;
      pendingPointRef.current = clientToViewBoxPoint(svg, e.clientX, e.clientY);
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (pendingPointRef.current) processPoint(pendingPointRef.current);
      });
    },
    [processPoint],
  );

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const strokeStatuses: StrokeStatus[] = strokes.map((_, i) =>
    i < activeStrokeIndex || (i === activeStrokeIndex && isComplete) ? 'done' : i === activeStrokeIndex ? 'active' : 'locked',
  );

  const activeCoverage = samples[activeStrokeIndex]
    ? coverageRatio(coveredRef.current, samples[activeStrokeIndex].length)
    : 0;

  return {
    svgRef,
    activeStrokeIndex,
    strokeStatuses,
    guideDot,
    isComplete,
    activeCoverage,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
