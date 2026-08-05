import { useEffect, useLayoutEffect, useRef } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { WordChip } from '../../components/WordChip';
import { alphabet } from '../../data/alphabet';
import { letterAudioPath, wordAudioPath, wordImagePath } from '../../data/paths';
import { LetterSoundVariants } from '../phonics/LetterSoundVariants';
import { PhonicsCompare } from '../phonics/PhonicsCompare';
import { hasLowercaseTracingData, hasTracingData } from '../../data/letterStrokes';
import { useProgressStore } from '../../store/progressStore';
import { useSettingsStore } from '../../store/settingsStore';
import { getLetterStars } from '../../store/letterStars';
import { StarMeter } from '../../components/StarMeter';
import page from '../../styles/page.module.css';
import styles from './AlphabetLetterPage.module.css';

export function AlphabetLetterPage() {
  const { letter: letterParam } = useParams<{ letter: string }>();
  const letter = letterParam?.toUpperCase();
  const index = alphabet.findIndex((entry) => entry.letter === letter);
  const entry = index >= 0 ? alphabet[index] : undefined;

  const markLetterLearned = useProgressStore((s) => s.markLetterLearned);
  const voiceGender = useSettingsStore((s) => s.voiceGender);
  const wordsHeard = useProgressStore((s) => s.wordsHeard);
  const quizPassedLetters = useProgressStore((s) => s.quizPassedLetters);
  const matchPassedLetters = useProgressStore((s) => s.matchPassedLetters);
  const tracedLetters = useProgressStore((s) => s.tracedLetters);
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (letter) markLetterLearned(letter);
  }, [letter, markLetterLearned]);

  // Short layered entrance each time the letter changes — never blocks
  // interaction, and skips entirely under prefers-reduced-motion.
  useLayoutEffect(() => {
    const el = layoutRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from([el.querySelector(`.${styles.heroSection}`), ...el.querySelectorAll(`.${styles.content} > *`)], {
        opacity: 0,
        y: 14,
        duration: 0.28,
        stagger: 0.06,
        ease: 'power1.out',
        // Otherwise GSAP leaves an inline `transform: matrix(1,0,0,1,0,0)`
        // behind — a no-op visually, but it still creates a new CSS
        // stacking context that can trap a descendant's z-index (e.g. the
        // word-image pop-to-zoom) below later, unrelated siblings.
        clearProps: 'transform',
      });
    }, el);
    return () => ctx.revert();
  }, [letter]);

  if (!entry) {
    return <Navigate to="/alphabet" replace />;
  }

  const genderedName =
    voiceGender === 'male'
      ? (entry.letterAudioMale ?? entry.letterAudio)
      : (entry.letterAudioFemale ?? entry.letterAudio);

  const prev = index > 0 ? alphabet[index - 1] : undefined;
  const next = index < alphabet.length - 1 ? alphabet[index + 1] : undefined;
  const stars = getLetterStars(entry.letter, { wordsHeard, quizPassedLetters, matchPassedLetters, tracedLetters });

  return (
    <div className={`${page.page} ${styles.page}`}>
      <div className={page.container}>
        <nav className={styles.letterNav}>
          {prev ? (
            <Link
              to={`/alphabet/${prev.letter}`}
              className={`${styles.navLink} ${styles.navSlotStart}`}
            >
              &larr; {prev.letter}
            </Link>
          ) : (
            <span className={styles.navSlotStart} />
          )}
          {next ? (
            <Link
              to={`/alphabet/${next.letter}`}
              className={`${styles.navLink} ${styles.navSlotEnd}`}
            >
              {next.letter} &rarr;
            </Link>
          ) : (
            <span className={styles.navSlotEnd} />
          )}
        </nav>

        <div className={styles.layout} ref={layoutRef}>
          <section className={styles.heroSection}>
            <span className={styles.hero}>
              {entry.letter}
              <span className={styles.heroLower}>{entry.letter.toLowerCase()}</span>
            </span>
            <StarMeter filled={stars} />
          </section>

          <section className={styles.content}>
            <PhonicsCompare
              letter={entry}
              nameAudioSrc={letterAudioPath(genderedName)}
              soundAudioSrc={letterAudioPath(entry.phonicsAudio)}
              hideSoundRow={Boolean(entry.soundVariants)}
            />

            {entry.soundVariants ? (
              // The letter's primary sound is the variants list's first
              // row (same words as `entry.words`), so this table replaces
              // the standalone word-chip row instead of sitting below it.
              <LetterSoundVariants letter={entry.letter} variants={entry.soundVariants} />
            ) : (
              <div className={styles.words}>
                {entry.words.map((word) => (
                  <WordChip
                    key={word.id}
                    text={word.text}
                    imageSrc={wordImagePath(word.image)}
                    audioSrc={wordAudioPath(word.audio)}
                    baseAudio={word.audio}
                  />
                ))}
              </div>
            )}

            <div className={styles.actionsRow}>
              <Link to={`/alphabet/${entry.letter}/lesson`} className={`${styles.actionCta} ${styles.quizCta}`}>
                <svg viewBox="0 0 24 24" className={styles.actionIcon} aria-hidden="true">
                  <rect x="5" y="4" width="14" height="17" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M9 3h6v3H9z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path
                    d="M8.5 13l2.3 2.3L16 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Start Quiz
              </Link>

              {hasTracingData(entry.letter) ? (
                <Link to={`/alphabet/${entry.letter}/trace`} className={`${styles.actionCta} ${styles.practiceCta}`}>
                  <svg viewBox="0 0 24 24" className={styles.actionIcon} aria-hidden="true">
                    <path
                      d="M4 20l1-4L15.5 5.5l3.5 3.5L8.5 19.5 4 20z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path d="M13 7.5l3.5 3.5" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Practice writing {entry.letter}
                  {hasLowercaseTracingData(entry.letter) ? entry.letter.toLowerCase() : ''}
                </Link>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
