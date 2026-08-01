import type { LetterTraceData, TracingKey } from './tracing.types';

/**
 * Hand-drawn stroke paths for tracing practice, one entry per case per
 * letter. V1 pilot: A, B, C only (uppercase + lowercase each). Extend by
 * appending entries here — no other file needs to change to add a letter
 * (TraceLetterPage / route are generic over the alphabet param).
 */
export const tracingPaths: Partial<Record<TracingKey, LetterTraceData>> = {
  A: {
    strokes: [
      { d: 'M100,30 L30,170', start: { x: 100, y: 30 }, startAngleDeg: 116.57 },
      { d: 'M100,30 L170,170', start: { x: 100, y: 30 }, startAngleDeg: 63.43 },
      { d: 'M57,115 L143,115', start: { x: 57, y: 115 }, startAngleDeg: 0 },
    ],
  },
  a: {
    strokes: [
      {
        d: 'M130,110 C130,92 114,80 96,80 C74,80 58,98 58,119 C58,140 74,158 96,158 C114,158 128,148 130,132 L130,170',
        start: { x: 130, y: 110 },
        startAngleDeg: 270,
      },
    ],
  },
  B: {
    strokes: [
      { d: 'M40,30 L40,170', start: { x: 40, y: 30 }, startAngleDeg: 90 },
      {
        d: 'M40,30 C110,30 130,45 130,64 C130,85 110,98 40,98 C110,98 138,112 138,134 C138,158 112,170 40,170',
        start: { x: 40, y: 30 },
        startAngleDeg: 0,
      },
    ],
  },
  b: {
    strokes: [
      { d: 'M50,30 L50,170', start: { x: 50, y: 30 }, startAngleDeg: 90 },
      {
        d: 'M50,108 C95,108 115,120 115,140 C115,162 92,170 50,170',
        start: { x: 50, y: 108 },
        startAngleDeg: 0,
      },
    ],
  },
  C: {
    strokes: [{ d: 'M135,39 A70,70 0 1,0 135,161', start: { x: 135, y: 39 }, startAngleDeg: 220 }],
  },
  c: {
    strokes: [{ d: 'M120,95 A40,40 0 1,0 120,165', start: { x: 120, y: 95 }, startAngleDeg: 220 }],
  },
};

export function hasTracingData(letter: string): boolean {
  return letter.toUpperCase() in tracingPaths && letter.toLowerCase() in tracingPaths;
}
