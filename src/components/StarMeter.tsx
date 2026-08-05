import styles from './StarMeter.module.css';

interface StarMeterProps {
  filled: number;
  total?: number;
}

const STAR_PATH =
  'M12 2.5l2.9 6.06 6.6.78-4.86 4.6 1.28 6.56L12 17.3l-5.92 3.2 1.28-6.56-4.86-4.6 6.6-.78z';

/** Row of stars (filled vs outline) representing lesson mastery for one
 * letter. Empty stars stay outline, never a "greyed out"/failure look. */
export function StarMeter({ filled, total = 3 }: StarMeterProps) {
  return (
    <div className={styles.meter} aria-label={`Stars: ${filled} of ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const isFilled = i < filled;
        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className={[styles.star, isFilled ? styles.filled : styles.outline].join(' ')}
            aria-hidden="true"
          >
            <path d={STAR_PATH} fill={isFilled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        );
      })}
    </div>
  );
}
