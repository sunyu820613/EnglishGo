/**
 * Linearly interpolates between two equal-length, equal-arc-length-sampled
 * tongue outlines (see scripts/extract-tongue-paths.mjs /
 * src/data/phonemeTonguePaths.ts) and returns an SVG path `d` string.
 * Both arrays are always length 200 (SAMPLE_COUNT), so no length handling
 * is needed.
 */
export function lerpTonguePath(
  a: readonly (readonly [number, number])[],
  b: readonly (readonly [number, number])[],
  t: number,
): string {
  const points = a.map(([ax, ay], i) => {
    const [bx, by] = b[i] ?? [ax, ay];
    return [ax * (1 - t) + bx * t, ay * (1 - t) + by * t] as const;
  });
  const [first, ...rest] = points;
  if (!first) return 'M0,0 Z';
  let d = `M${first[0]},${first[1]}`;
  for (const [x, y] of rest) {
    d += ` L${x},${y}`;
  }
  return d + ' Z';
}
