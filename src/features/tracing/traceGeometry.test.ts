import { describe, expect, it } from 'vitest';
import {
  SAMPLE_COUNT,
  TRACE_TOLERANCE_CSS_PX,
  nearestSample,
  sampleStroke,
  toleranceInViewBoxUnits,
} from './traceGeometry';

describe('sampleStroke', () => {
  it('returns SAMPLE_COUNT points along a straight line, start and end matching the path', () => {
    const samples = sampleStroke('M0,0 L100,0');
    expect(samples).toHaveLength(SAMPLE_COUNT);
    expect(samples[0]).toEqual([0, 0]);
    const last = samples[SAMPLE_COUNT - 1];
    expect(last?.[0]).toBeCloseTo(100);
    expect(last?.[1]).toBeCloseTo(0);
  });

  it('spaces samples evenly by arc length', () => {
    const samples = sampleStroke('M0,0 L100,0', 5);
    expect(samples.map(([x]) => Math.round(x))).toEqual([0, 25, 50, 75, 100]);
  });
});

describe('nearestSample', () => {
  it('finds the closest point and its distance', () => {
    const samples: [number, number][] = [
      [0, 0],
      [10, 0],
      [20, 0],
    ];
    expect(nearestSample(samples, [11, 3])).toEqual({ index: 1, distance: Math.hypot(1, 3) });
  });

  it('picks the first index on an exact tie', () => {
    const samples: [number, number][] = [
      [0, 0],
      [10, 0],
    ];
    expect(nearestSample(samples, [5, 0]).index).toBe(0);
  });
});

describe('toleranceInViewBoxUnits', () => {
  function fakeSvg(renderedWidth: number): SVGSVGElement {
    return {
      getBoundingClientRect: () => ({ width: renderedWidth }) as DOMRect,
    } as unknown as SVGSVGElement;
  }

  it('scales the CSS-px tolerance by the viewBox-to-screen ratio', () => {
    // Rendered at 2x the viewBox width -> tolerance shrinks by half in viewBox units.
    expect(toleranceInViewBoxUnits(fakeSvg(400), 200)).toBeCloseTo(TRACE_TOLERANCE_CSS_PX / 2);
  });

  it('returns 0 instead of dividing by zero when not yet laid out', () => {
    expect(toleranceInViewBoxUnits(fakeSvg(0), 200)).toBe(0);
  });
});
