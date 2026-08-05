import styles from './LessonProgressDots.module.css';

interface LessonProgressDotsProps {
  totalSteps: number;
  currentStep: number;
}

export function LessonProgressDots({ totalSteps, currentStep }: LessonProgressDotsProps) {
  return (
    <div className={styles.dots} aria-label={`Step ${currentStep + 1} of ${totalSteps}`}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <span key={i} className={i <= currentStep ? styles.dotActive : styles.dot} />
      ))}
    </div>
  );
}
