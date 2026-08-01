/** Shared coordinate space for every hand-drawn stroke — a 200x200 square
 * with baseline at y=170, cap-height top at y=30, x-height top at y=90. */
export const TRACE_VIEW_BOX = '0 0 200 200';

export interface TraceStroke {
  /** SVG path `d`, authored in the TRACE_VIEW_BOX coordinate space. */
  d: string;
  /** Pen-down point, same coordinate space as `d`. */
  start: { x: number; y: number };
  /**
   * Direction the stroke travels at its start, in degrees (0 = pointing
   * +x/right, 90 = pointing +y/down) — matches SVG `rotate()` convention.
   * Drives the direction-arrow glyph rendered at `start`.
   */
  startAngleDeg: number;
}

/** One case (uppercase or lowercase) of one letter, strokes in writing order. */
export interface LetterTraceData {
  strokes: TraceStroke[];
}

/** Key is a single case-sensitive character, e.g. 'A' or 'a'. */
export type TracingKey = string;
