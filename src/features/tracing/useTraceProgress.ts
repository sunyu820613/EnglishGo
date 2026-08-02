import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TraceStroke } from '../../data/tracing.types';
import { clientToViewBoxPoint, nearestSampleAhead, sampleStroke, toleranceInViewBoxUnits, type Point } from './traceGeometry';
import { isStrokeComplete } from './traceState';

export type StrokeStatus = 'locked' | 'active' | 'done';

export interface GuideDotState {
  x: number;
  y: number;
  /** true = snapped to the pointer (inside tolerance), false = snapped
   * back to the furthest point reached so far (pointer strayed outside it). */
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
  const rafRef = useRef<number | null>(null);
  const pendingPointRef = useRef<Point | null>(null);
  const isPointerDownRef = useRef(false);
  const completedRef = useRef(initiallyComplete);

  const [activeStrokeIndex, setActiveStrokeIndex] = useState(
    initiallyComplete ? Math.max(0, strokes.length - 1) : 0,
  );
  /** How far along the active stroke's samples progress has reached
   * (monotonic — never decreases while tracing the same stroke). */
  const [sampleIndex, setSampleIndex] = useState(
    initiallyComplete ? Math.max(0, (samples[samples.length - 1]?.length ?? 1) - 1) : 0,
  );
  const [guideDot, setGuideDot] = useState<GuideDotState | null>(null);
  const [isComplete, setIsComplete] = useState(initiallyComplete);

  const reset = useCallback(() => {
    setActiveStrokeIndex(0);
    setSampleIndex(0);
    setGuideDot(null);
    setIsComplete(false);
    completedRef.current = false;
  }, []);

  useEffect(() => {
    setSampleIndex(0);
    setGuideDot(null);
  }, [activeStrokeIndex]);

  const processPoint = useCallback(
    (point: Point) => {
      const svg = svgRef.current;
      const activeSamples = samples[activeStrokeIndex];
      if (!svg || !activeSamples) return;

      const tolerance = toleranceInViewBoxUnits(svg, VIEW_BOX_WIDTH);
      const nearest = nearestSampleAhead(activeSamples, sampleIndex, point);
      const onPath = nearest.distance <= tolerance;

      if (onPath) {
        setSampleIndex(nearest.index);
        setGuideDot({ x: point[0], y: point[1], following: true });
      } else {
        const held = activeSamples[sampleIndex];
        if (held) setGuideDot({ x: held[0], y: held[1], following: false });
      }

      const reachedIndex = onPath ? nearest.index : sampleIndex;
      if (isStrokeComplete(reachedIndex, activeSamples.length)) {
        if (activeStrokeIndex < strokes.length - 1) {
          setActiveStrokeIndex((i) => i + 1);
        } else if (!completedRef.current) {
          completedRef.current = true;
          setIsComplete(true);
          onComplete();
        }
      }
    },
    [activeStrokeIndex, onComplete, sampleIndex, samples, strokes.length],
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

  /** Points from the active stroke's start up through the current
   * progress — draw this as solid "ink" so the child sees what they've
   * traced so far, not just a binary done/not-done stroke. */
  const inkPoints = samples[activeStrokeIndex]?.slice(0, sampleIndex + 1) ?? [];

  return {
    svgRef,
    activeStrokeIndex,
    strokeStatuses,
    guideDot,
    isComplete,
    inkPoints,
    reset,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
