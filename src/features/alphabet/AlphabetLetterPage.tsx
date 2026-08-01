import { useEffect, useLayoutEffect, useRef } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { SoundButton } from '../../components/SoundButton';
import { WordCard } from '../../components/WordCard';
import { alphabet } from '../../data/alphabet';
import { letterAudioPath, wordAudioPath, wordImagePath } from '../../data/paths';
import { PhonicsCompare } from '../phonics/PhonicsCompare';
import { useProgressStore } from '../../store/progressStore';
import { useSettingsStore } from '../../store/settingsStore';
import page from '../../styles/page.module.css';
import styles from './AlphabetLetterPage.module.css';

export function AlphabetLetterPage() {
  const { letter: letterParam } = useParams<{ letter: string }>();
  const letter = letterParam?.toUpperCase();
  const index = alphabet.findIndex((entry) => entry.letter === letter);
  const entry = index >= 0 ? alphabet[index] : undefined;

  const markLetterLearned = useProgressStore((s) => s.markLetterLearned);
  const voiceGender = useSettingsStore((s) => s.voiceGender);
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

  return (
    <div className={page.page}>
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
          <Link to="/alphabet" className={styles.navLink}>
            All letters
          </Link>
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
            <span className={styles.hero}>{entry.letter}</span>
            <SoundButton
              src={letterAudioPath(genderedName)}
              label={`Play the letter ${entry.letter}`}
              caption="Letter name"
              size="primary"
            />
          </section>

          <section className={styles.content}>
            <div className={styles.phonicsRow}>
              <SoundButton
                src={letterAudioPath(entry.phonicsAudio)}
                label={`Play the ${entry.letter} sound`}
                caption="Letter sound"
              />
              <PhonicsCompare letter={entry} />
            </div>

            <div className={styles.words}>
              {entry.words.map((word) => (
                <WordCard
                  key={word.id}
                  word={word.text}
                  imageSrc={wordImagePath(word.image)}
                  imageAlt={word.text}
                  audioSrc={wordAudioPath(word.audio)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
