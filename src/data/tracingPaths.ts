import type { LetterTraceData, TracingKey } from './tracing.types';

/**
 * Stroke paths for tracing practice.
 *
 * Uppercase A-Z: ported from the original Flutter app's
 * `lib/core/tracing/letter_paths.dart` (elementary manuscript stroke
 * order, normalized 0-100 square, straight-segment polylines) — scaled
 * 2x into this app's 0-200 viewBox. That was the only letterform data
 * source available; there was no equivalent lowercase set, so lowercase
 * is still a hand-authored pilot (a/b/c only — see hasLowercaseTracingData).
 */
export const tracingPaths: Partial<Record<TracingKey, LetterTraceData>> = {
  A: {
    strokes: [
      { d: 'M100,20 L20,180', start: { x: 100, y: 20 }, startAngleDeg: 116.57 },
      { d: 'M100,20 L180,180', start: { x: 100, y: 20 }, startAngleDeg: 63.43 },
      { d: 'M52,120 L148,120', start: { x: 52, y: 120 }, startAngleDeg: 0 },
    ],
  },
 a: {
   strokes: [
      {
        d: 'M120,90 C108,78 68,78 55,93 C42,108 42,140 55,155 C68,170 108,170 120,158 C126,152 126,148 120,142',
        start: { x: 120, y: 90 },
        startAngleDeg: 180,
      },
      {
        d: 'M120,145 L120,178',
        start: { x: 120, y: 145 },
        startAngleDeg: 90,
      },
   ],
 },
  B: {
    strokes: [
      { d: 'M40,20 L40,180', start: { x: 40, y: 20 }, startAngleDeg: 90 },
      { d: 'M40,20 L110,20 L132,40 L132,70 L110,92 L40,92', start: { x: 40, y: 20 }, startAngleDeg: 0 },
      { d: 'M40,92 L120,92 L144,116 L144,156 L120,180 L40,180', start: { x: 40, y: 92 }, startAngleDeg: 0 },
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
    strokes: [
      {
        d: 'M156,44 L116,20 L64,28 L30,64 L22,100 L30,136 L64,172 L116,180 L156,156',
        start: { x: 156, y: 44 },
        startAngleDeg: -149.04,
      },
    ],
  },
  c: {
    strokes: [{ d: 'M120,95 A40,40 0 1,0 120,165', start: { x: 120, y: 95 }, startAngleDeg: 220 }],
  },
  D: {
    strokes: [
      { d: 'M40,20 L40,180', start: { x: 40, y: 20 }, startAngleDeg: 90 },
      { d: 'M40,20 L100,20 L144,44 L160,100 L144,156 L100,180 L40,180', start: { x: 40, y: 20 }, startAngleDeg: 0 },
    ],
  },
  E: {
    strokes: [
      { d: 'M44,20 L44,180', start: { x: 44, y: 20 }, startAngleDeg: 90 },
      { d: 'M44,20 L156,20', start: { x: 44, y: 20 }, startAngleDeg: 0 },
      { d: 'M44,100 L124,100', start: { x: 44, y: 100 }, startAngleDeg: 0 },
      { d: 'M44,180 L156,180', start: { x: 44, y: 180 }, startAngleDeg: 0 },
    ],
  },
  F: {
    strokes: [
      { d: 'M44,20 L44,180', start: { x: 44, y: 20 }, startAngleDeg: 90 },
      { d: 'M44,20 L156,20', start: { x: 44, y: 20 }, startAngleDeg: 0 },
      { d: 'M44,100 L124,100', start: { x: 44, y: 100 }, startAngleDeg: 0 },
    ],
  },
  G: {
    strokes: [
      {
        d: 'M156,44 L116,20 L64,28 L30,64 L22,100 L30,136 L64,172 L116,180 L156,156 L156,110 L104,110',
        start: { x: 156, y: 44 },
        startAngleDeg: -149.04,
      },
    ],
  },
  H: {
    strokes: [
      { d: 'M40,20 L40,180', start: { x: 40, y: 20 }, startAngleDeg: 90 },
      { d: 'M160,20 L160,180', start: { x: 160, y: 20 }, startAngleDeg: 90 },
      { d: 'M40,100 L160,100', start: { x: 40, y: 100 }, startAngleDeg: 0 },
    ],
  },
  I: {
    strokes: [{ d: 'M100,20 L100,180', start: { x: 100, y: 20 }, startAngleDeg: 90 }],
  },
  J: {
    strokes: [
      {
        d: 'M136,20 L136,130 L124,164 L92,180 L60,168 L40,144',
        start: { x: 136, y: 20 },
        startAngleDeg: 90,
      },
    ],
  },
  K: {
    strokes: [
      { d: 'M40,20 L40,180', start: { x: 40, y: 20 }, startAngleDeg: 90 },
      { d: 'M152,20 L40,104', start: { x: 152, y: 20 }, startAngleDeg: 143.13 },
      { d: 'M40,104 L152,180', start: { x: 40, y: 104 }, startAngleDeg: 34.16 },
    ],
  },
  L: {
    strokes: [
      { d: 'M44,20 L44,180', start: { x: 44, y: 20 }, startAngleDeg: 90 },
      { d: 'M44,180 L148,180', start: { x: 44, y: 180 }, startAngleDeg: 0 },
    ],
  },
  M: {
    strokes: [
      { d: 'M28,180 L28,20 L100,110 L172,20 L172,180', start: { x: 28, y: 180 }, startAngleDeg: -90 },
    ],
  },
  N: {
    strokes: [{ d: 'M40,180 L40,20 L160,180 L160,20', start: { x: 40, y: 180 }, startAngleDeg: -90 }],
  },
  O: {
    strokes: [
      {
        d: 'M100,20 L50,30 L24,70 L20,100 L24,130 L50,170 L100,180 L150,170 L176,130 L180,100 L176,70 L150,30 L100,20',
        start: { x: 100, y: 20 },
        startAngleDeg: 168.69,
      },
    ],
  },
  P: {
    strokes: [
      { d: 'M40,20 L40,180', start: { x: 40, y: 20 }, startAngleDeg: 90 },
      { d: 'M40,20 L112,20 L140,44 L140,74 L112,96 L40,96', start: { x: 40, y: 20 }, startAngleDeg: 0 },
    ],
  },
  Q: {
    strokes: [
      {
        d: 'M100,20 L50,30 L24,70 L20,100 L24,130 L50,170 L100,180 L150,170 L176,130 L180,100 L176,70 L150,30 L100,20',
        start: { x: 100, y: 20 },
        startAngleDeg: 168.69,
      },
      { d: 'M116,124 L172,184', start: { x: 116, y: 124 }, startAngleDeg: 46.97 },
    ],
  },
  R: {
    strokes: [
      { d: 'M40,20 L40,180', start: { x: 40, y: 20 }, startAngleDeg: 90 },
      { d: 'M40,20 L112,20 L140,44 L140,74 L112,96 L40,96', start: { x: 40, y: 20 }, startAngleDeg: 0 },
      { d: 'M76,96 L152,180', start: { x: 76, y: 96 }, startAngleDeg: 47.86 },
    ],
  },
  S: {
    strokes: [
      {
        d: 'M152,44 L112,20 L64,24 L38,50 L42,76 L76,96 L124,110 L160,132 L162,158 L132,178 L72,180 L32,158',
        start: { x: 152, y: 44 },
        startAngleDeg: -149.04,
      },
    ],
  },
  T: {
    strokes: [
      { d: 'M30,20 L170,20', start: { x: 30, y: 20 }, startAngleDeg: 0 },
      { d: 'M100,20 L100,180', start: { x: 100, y: 20 }, startAngleDeg: 90 },
    ],
  },
  U: {
    strokes: [
      {
        d: 'M40,20 L40,120 L52,160 L92,180 L124,174 L148,144 L152,110 L152,20',
        start: { x: 40, y: 20 },
        startAngleDeg: 90,
      },
    ],
  },
  V: {
    strokes: [
      { d: 'M28,20 L100,180', start: { x: 28, y: 20 }, startAngleDeg: 65.77 },
      { d: 'M100,180 L172,20', start: { x: 100, y: 180 }, startAngleDeg: -65.77 },
    ],
  },
  W: {
    strokes: [
      { d: 'M16,20 L56,180 L100,90 L144,180 L184,20', start: { x: 16, y: 20 }, startAngleDeg: 75.96 },
    ],
  },
  X: {
    strokes: [
      { d: 'M30,20 L170,180', start: { x: 30, y: 20 }, startAngleDeg: 48.81 },
      { d: 'M170,20 L30,180', start: { x: 170, y: 20 }, startAngleDeg: 131.19 },
    ],
  },
  Y: {
    strokes: [
      { d: 'M28,20 L100,104', start: { x: 28, y: 20 }, startAngleDeg: 49.4 },
      { d: 'M172,20 L100,104', start: { x: 172, y: 20 }, startAngleDeg: 130.6 },
      { d: 'M100,104 L100,180', start: { x: 100, y: 104 }, startAngleDeg: 90 },
    ],
  },
  Z: {
    strokes: [
      { d: 'M30,20 L170,20', start: { x: 30, y: 20 }, startAngleDeg: 0 },
      { d: 'M170,20 L30,180', start: { x: 170, y: 20 }, startAngleDeg: 131.19 },
      { d: 'M30,180 L170,180', start: { x: 30, y: 180 }, startAngleDeg: 0 },
    ],
  },
};

export function hasTracingData(letter: string): boolean {
  return letter.toUpperCase() in tracingPaths;
}

export function hasLowercaseTracingData(letter: string): boolean {
  return letter.toLowerCase() in tracingPaths;
}
