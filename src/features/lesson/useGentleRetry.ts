import { useState } from 'react';

/** Shared "never fail" retry rule for the quiz/match steps: 1st wrong tap
 * just hints at that card; on the 2nd wrong tap, the caller should hide one
 * remaining incorrect option (LEARNING_MODEL.md §1/§3). */
export function useGentleRetry() {
  const [attempts, setAttempts] = useState(0);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);

  const registerWrongAttempt = (index: number) => {
    setAttempts((a) => a + 1);
    setWrongIndex(index);
  };

  return { attempts, wrongIndex, reduced: attempts >= 2, registerWrongAttempt };
}
