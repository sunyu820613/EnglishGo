/** Fibonacci/golden-spiral sphere distribution — the 26 letters keep a
 * fixed position on this sphere forever; only the parent Group's rotation
 * ever changes, never the individual points. */
export interface LetterSpherePosition {
  letter: string;
  position: [number, number, number];
  normal: [number, number, number];
}

export const GLOBE_RADIUS = 3.4;

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function buildAlphabetGlobeLayout(letters: string[]): LetterSpherePosition[] {
  const n = letters.length;
  return letters.map((letter, i) => {
    const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN_ANGLE * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    return {
      letter,
      normal: [x, y, z],
      position: [x * GLOBE_RADIUS, y * GLOBE_RADIUS, z * GLOBE_RADIUS],
    };
  });
}
