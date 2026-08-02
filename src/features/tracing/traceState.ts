/** A stroke is complete once progress has reached its final sample. */
export function isStrokeComplete(sampleIndex: number, sampleCount: number): boolean {
  return sampleIndex >= sampleCount - 1;
}
