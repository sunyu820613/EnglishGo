import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './Celebration.module.css';

interface CelebrationProps {
  onDone: () => void;
  reducedMotion: boolean;
}

const STAR_PATH =
  'M12 2.5l2.9 6.06 6.6.78-4.86 4.6 1.28 6.56L12 17.3l-5.92 3.2 1.28-6.56-4.86-4.6 6.6-.78z';
const SPARKLE_COUNT = 6;
const HOLD_MS = 550;

/** A brief sparkle burst shown when a quiz/match step is answered correctly,
 * then calls onDone to auto-advance. Skipped entirely under reduced motion. */
export function Celebration({ onDone, reducedMotion }: CelebrationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      onDone();
      return;
    }
    const el = containerRef.current;
    if (el) {
      const sparkles = el.querySelectorAll(`.${styles.sparkle}`);
      gsap.fromTo(
        sparkles,
        { scale: 0, opacity: 1, x: 0, y: 0 },
        {
          scale: 1,
          opacity: 0,
          x: (i) => Math.cos((i / SPARKLE_COUNT) * Math.PI * 2) * 70,
          y: (i) => Math.sin((i / SPARKLE_COUNT) * Math.PI * 2) * 70,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.02,
        },
      );
    }
    const timeout = setTimeout(onDone, HOLD_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div ref={containerRef} className={styles.stage} aria-hidden="true">
      {Array.from({ length: SPARKLE_COUNT }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" className={styles.sparkle}>
          <path d={STAR_PATH} fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
