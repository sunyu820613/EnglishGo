import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
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

  useEffect(() => {
    if (letter) markLetterLearned(letter);
  }, [letter, markLetterLearned]);

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
            <Link to={`/alphabet/${prev.letter}`} className={styles.navLink}>
              &larr; {prev.letter}
            </Link>
          ) : (
            <span />
          )}
          <Link to="/alphabet" className={styles.navLink}>
            All letters
          </Link>
          {next ? (
            <Link to={`/alphabet/${next.letter}`} className={styles.navLink}>
              {next.letter} &rarr;
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <div className={styles.layout}>
          <section className={styles.heroSection}>
            <span className={styles.hero}>{entry.letter}</span>
            <SoundButton
              src={letterAudioPath(genderedName)}
              label={`Play the letter ${entry.letter}`}
              size="primary"
            />
          </section>

          <section className={styles.content}>
            <div className={styles.phonicsRow}>
              <SoundButton
                src={letterAudioPath(entry.phonicsAudio)}
                label={`Play the ${entry.letter} sound`}
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
