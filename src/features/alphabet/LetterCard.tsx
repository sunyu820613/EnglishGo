import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { wordImagePath } from '../../data/paths';
import type { AlphabetLetter } from '../../data/alphabet.types';
import styles from './LetterCard.module.css';

interface LetterCardProps {
  entry: AlphabetLetter;
  learned: boolean;
  /** Stagger delay (seconds) applied to this card's entrance tween. */
  entranceDelay: number;
}

/**
 * Front: Aa. Back: first example word + picture + a link into the lesson.
 * Tap toggles the flip (works without hover, per the "no hover-only
 * interaction on mobile" rule) — the back face is where navigation lives, so
 * flipping never traps a keyboard/touch user without a way to actually open
 * the letter.
 */
export function LetterCard({ entry, learned, entranceDelay }: LetterCardProps) {
  const [flipped, setFlipped] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const word = entry.words[0];

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.from(el, {
        opacity: 0,
        y: 12,
        duration: 0.32,
        delay: entranceDelay,
        ease: 'power1.out',
      });
    });
    return () => ctx.revert();
  }, [entranceDelay]);

  return (
    <div className={styles.scene} ref={rootRef}>
      <div
        className={[styles.card, flipped ? styles.flipped : ''].join(' ')}
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={`Letter ${entry.letter}. ${flipped ? 'Showing example word.' : 'Tap to preview.'}`}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
      >
        <div className={[styles.face, styles.front, learned ? styles.learned : ''].join(' ')}>
          <span className={styles.upper}>{entry.letter}</span>
          <span className={styles.lower}>{entry.letter.toLowerCase()}</span>
          {learned ? <span className={styles.learnedBadge} aria-hidden="true" /> : null}
        </div>
        <div className={[styles.face, styles.back].join(' ')}>
          <img
            className={styles.thumb}
            src={wordImagePath(word.image)}
            alt=""
            loading="lazy"
            width={56}
            height={56}
          />
          <span className={styles.word}>{word.text}</span>
          <Link
            to={`/alphabet/${entry.letter}`}
            className={styles.open}
            onClick={(e) => e.stopPropagation()}
          >
            Start lesson &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
