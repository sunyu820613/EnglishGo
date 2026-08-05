import { Link } from 'react-router-dom';
import { alphabet } from '../../data/alphabet';
import { wordImagePath } from '../../data/paths';
import { useProgressStore } from '../../store/progressStore';
import { getLetterStars } from '../../store/letterStars';
import { stories } from '../../data/stories';
import { isStoryUnlocked } from '../../store/storyUnlock';
import page from '../../styles/page.module.css';
import styles from './RewardsPage.module.css';

const ALL_WORDS = alphabet.flatMap((e) => e.words);

export function RewardsPage() {
  const wordsHeard = useProgressStore((s) => s.wordsHeard);
  const quizPassedLetters = useProgressStore((s) => s.quizPassedLetters);
  const matchPassedLetters = useProgressStore((s) => s.matchPassedLetters);
  const tracedLetters = useProgressStore((s) => s.tracedLetters);

  const progress = { wordsHeard, quizPassedLetters, matchPassedLetters, tracedLetters };
  const starsByLetter = Object.fromEntries(
    alphabet.map((e) => [e.letter, getLetterStars(e.letter, progress)]),
  );

  const totalStars = alphabet.reduce(
    (sum, e) => sum + (starsByLetter[e.letter] ?? 0),
    0,
  );

  const stickers = ALL_WORDS.filter((w) => wordsHeard.includes(w.id));

  return (
    <div className={page.page}>
      <div className={page.container}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>
            &larr; Home
          </Link>
        </nav>
        <h1 className={styles.title}>My Collection</h1>
        <p className={styles.starCount}>{totalStars} stars collected</p>

        <h2 className={styles.sectionHeading}>Stickers ({stickers.length})</h2>
        {stickers.length === 0 ? (
          <p className={styles.emptyState}>Complete lessons to earn stickers!</p>
        ) : (
          <div className={styles.stickerGrid}>
            {stickers.map((word) => (
              <div key={word.id} className={styles.sticker}>
                <img src={wordImagePath(word.image)} alt={word.text} className={styles.stickerImage} loading="lazy" />
              </div>
            ))}
          </div>
        )}
        <h2 className={styles.sectionHeading}>Mini Stories</h2>
        <div className={styles.storyList}>
          {stories.map((story) => {
            const unlocked = isStoryUnlocked(story, starsByLetter);
            return unlocked ? (
              <Link
                key={story.id}
                to={`/rewards/story/${story.id}`}
                className={styles.storyRow}
              >
                <span className={styles.storyIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M20 21.5V3.5a1.5 1.5 0 0 0-1.5-1.5H6.5A2.5 2.5 0 0 0 4 4.5v15" />
                    <path d="M6.5 17H20" />
                  </svg>
                </span>
                <span className={styles.storyTitle}>{story.title}</span>
              </Link>
            ) : (
              <div key={story.id} className={styles.storyRowLocked}>
                <span className={styles.storyIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <span className={styles.storyLockedText}>
                  Complete {story.requiredLetters.join(', ')} to unlock
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
