import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import styles from './QuizOptionCard.module.css';

export type QuizOptionState = 'idle' | 'success' | 'hint';

interface QuizOptionCardProps {
  state?: QuizOptionState;
  onClick: () => void;
  ariaLabel: string;
  reducedMotion?: boolean;
  children: ReactNode;
}

/** A tappable quiz/match answer card. `success` bounces, `hint` (wrong
 * answer) shakes gently — never a harsh red "wrong" flash, per
 * LEARNING_MODEL.md's no-fail-state rule. */
export function QuizOptionCard({ state = 'idle', onClick, ariaLabel, reducedMotion = false, children }: QuizOptionCardProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;

    if (state === 'success') {
      gsap.fromTo(el, { scale: 1 }, { scale: 1.08, duration: 0.2, ease: 'back.out(2)', yoyo: true, repeat: 1 });
    } else if (state === 'hint') {
      gsap.fromTo(
        el,
        { rotate: 0 },
        { rotate: 6, duration: 0.09, ease: 'power1.inOut', yoyo: true, repeat: 3 },
      );
    }
  }, [state, reducedMotion]);

  return (
    <button
      ref={ref}
      type="button"
      className={[styles.card, styles[state]].filter(Boolean).join(' ')}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
