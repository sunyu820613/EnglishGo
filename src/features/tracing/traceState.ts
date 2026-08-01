/** A stroke counts as done once this fraction of its sampled points has
 * been covered — not 100%, since precise endpoint coverage is unrealistic
 * for young children's pointer input. */
export const STROKE_COMPLETE_THRESHOLD = 0.8;

/** Marking a window of samples (not just the single nearest one) around
 * each covered point tolerates a fast swipe skipping past a sample. */
export const COVERAGE_WINDOW = 3;

export function markCovered(covered: Set<number>, index: number, sampleCount: number, window = COVERAGE_WINDOW): void {
  const from = Math.max(0, index - window);
  const to = Math.min(sampleCount - 1, index + window);
  for (let i = from; i <= to; i++) covered.add(i);
}

export function coverageRatio(covered: Set<number>, sampleCount: number): number {
  return sampleCount === 0 ? 0 : covered.size / sampleCount;
}

export function isStrokeComplete(covered: Set<number>, sampleCount: number): boolean {
  return coverageRatio(covered, sampleCount) >= STROKE_COMPLETE_THRESHOLD;
}
