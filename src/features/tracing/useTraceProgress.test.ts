import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { TraceStroke } from '../../data/tracing.types';

let mockPoint: readonly [number, number] = [0, 0];
const mockTolerance = 5;

vi.mock('./traceGeometry', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./traceGeometry')>();
  return {
    ...actual,
    clientToViewBoxPoint: () => mockPoint,
    toleranceInViewBoxUnits: () => mockTolerance,
  };
});

const { useTraceProgress } = await import('./useTraceProgress');

/** Two straight horizontal strokes, easy to reason about in on-path terms. */
const strokes: TraceStroke[] = [
  { d: 'M0,0 L100,0', start: { x: 0, y: 0 }, startAngleDeg: 0 },
  { d: 'M0,50 L100,50', start: { x: 0, y: 50 }, startAngleDeg: 0 },
];

function fakeSvg(): SVGSVGElement {
  return {} as unknown as SVGSVGElement;
}

async function moveAlong(
  result: { current: ReturnType<typeof useTraceProgress> },
  points: readonly [number, number][],
) {
  for (const p of points) {
    mockPoint = p;
    await act(async () => {
      result.current.handlePointerMove({ clientX: p[0], clientY: p[1] });
      await new Promise((r) => requestAnimationFrame(r));
    });
  }
}

describe('useTraceProgress', () => {
  it('ignores pointer movement while the pointer is not down (hover must not advance progress)', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTraceProgress(strokes, onComplete));
    act(() => {
      result.current.svgRef.current = fakeSvg();
    });

    await moveAlong(result, [[0, 0], [25, 0], [50, 0], [75, 0], [100, 0]]);

    expect(result.current.strokeStatuses[0]).toBe('active');
    expect(result.current.guideDot).toBeNull();
  });

  it('advances to the next stroke once the active one is covered, resetting coverage', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTraceProgress(strokes, onComplete));
    act(() => {
      result.current.svgRef.current = fakeSvg();
      result.current.handlePointerDown();
    });

    await moveAlong(
      result,
      Array.from({ length: 21 }, (_, i) => [i * 5, 0] as [number, number]),
    );

    expect(result.current.activeStrokeIndex).toBe(1);
    expect(result.current.strokeStatuses).toEqual(['done', 'active']);
    expect(result.current.activeCoverage).toBe(0);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('calls onComplete exactly once after the last stroke is covered', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTraceProgress(strokes, onComplete));
    act(() => {
      result.current.svgRef.current = fakeSvg();
      result.current.handlePointerDown();
    });

    await moveAlong(
      result,
      Array.from({ length: 21 }, (_, i) => [i * 5, 0] as [number, number]),
    );
    await moveAlong(
      result,
      Array.from({ length: 21 }, (_, i) => [i * 5, 50] as [number, number]),
    );
    // A couple more moves after completion should not trigger a second call.
    await moveAlong(result, [[100, 50], [90, 50]]);

    expect(result.current.isComplete).toBe(true);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('clears the guide dot on pointer up', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTraceProgress(strokes, onComplete));
    act(() => {
      result.current.svgRef.current = fakeSvg();
      result.current.handlePointerDown();
    });
    await moveAlong(result, [[10, 0]]);
    expect(result.current.guideDot).not.toBeNull();

    act(() => {
      result.current.handlePointerUp();
    });
    expect(result.current.guideDot).toBeNull();
  });

  it('initiallyComplete renders every stroke as done without requiring interaction', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTraceProgress(strokes, onComplete, { initiallyComplete: true }));

    expect(result.current.isComplete).toBe(true);
    expect(result.current.strokeStatuses).toEqual(['done', 'done']);
    expect(onComplete).not.toHaveBeenCalled();
  });
});
