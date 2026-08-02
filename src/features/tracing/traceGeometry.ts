import { svgPathProperties } from 'svg-path-properties';

export const SAMPLE_COUNT = 100;

/** Corridor half-width, in CSS px, that counts as "on the path" — matches
 * the product spec's "~24dp corridor" (Flutter-era wording), translated to
 * CSS px since this is now a web viewport. */
export const TRACE_TOLERANCE_CSS_PX = 24;

export type Point = readonly [number, number];

/** Equal-arc-length samples along a stroke's `d`, in viewBox units. */
export function sampleStroke(d: string, count = SAMPLE_COUNT): Point[] {
  const props = new svgPathProperties(d);
  const total = props.getTotalLength();
  return Array.from({ length: count }, (_, i) => {
    const { x, y } = props.getPointAtLength((i / (count - 1)) * total);
    return [x, y] as const;
  });
}

/** How far ahead of the current progress point (in sample-index units) a
 * touch is allowed to match — mirrors the original Flutter tracer's
 * "look ahead a bit, but never search the whole path" window, which is
 * what makes the interaction reward tracing *in order* rather than
 * scribbling anywhere on the letter. */
export const LOOKAHEAD_SAMPLES = 20;

/** Closest sample to `point` within [fromIndex, fromIndex + LOOKAHEAD_SAMPLES],
 * never searching backward — progress along a stroke is monotonic. */
export function nearestSampleAhead(
  samples: readonly Point[],
  fromIndex: number,
  point: Point,
): { index: number; distance: number } {
  const windowEnd = Math.min(samples.length - 1, fromIndex + LOOKAHEAD_SAMPLES);
  let best = { index: fromIndex, distance: Infinity };
  for (let i = fromIndex; i <= windowEnd; i++) {
    const s = samples[i];
    if (!s) continue;
    const distance = Math.hypot(s[0] - point[0], s[1] - point[1]);
    if (distance < best.distance) best = { index: i, distance };
  }
  return best;
}

/** Convert a pointer event's client coords into the SVG's own viewBox units. */
export function clientToViewBoxPoint(svg: SVGSVGElement, clientX: number, clientY: number): Point {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  // Only null before the SVG is attached/laid out — falls back to a point
  // guaranteed to read as "off the path" rather than throwing, so a stray
  // early event just gets ignored by the tolerance check instead of crashing.
  if (!ctm) return [0, 0];
  const local = pt.matrixTransform(ctm.inverse());
  return [local.x, local.y];
}

/** Tolerance in viewBox units, given the SVG's current on-screen size and
 * viewBox width — must be recomputed per-move since it depends on the
 * live rendered size, not a constant baked into viewBox space. */
export function toleranceInViewBoxUnits(svg: SVGSVGElement, viewBoxWidth: number): number {
  const rect = svg.getBoundingClientRect();
  if (rect.width === 0) return 0;
  return TRACE_TOLERANCE_CSS_PX * (viewBoxWidth / rect.width);
}
