import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StarMeter } from '../../../components/StarMeter';
import { KidButton } from '../../../components/KidButton';
import styles from './StepReward.module.css';

import type { MiniStory } from '../../../data/stories.types';

interface StepRewardProps {
  letter: string;
  stars: number;
  /** Whether this letter has actually been traced (now or in an earlier
   * session) — the star count alone can't tell us this, since ★3 is
   * satisfied by match OR trace, but skipping trace here shouldn't still
   * be celebrated as "fully learned" if it's never been traced at all. */
  traced: boolean;
  /** Stories that just became unlocked by completing this letter. */
  unlockedStories: MiniStory[];
  onFinish: () => void;
}

export function StepReward({ letter, stars, traced, unlockedStories, onFinish }: StepRewardProps) {
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(unlockedStories.length > 0);
  const firstStory = unlockedStories[0];

  return (
    <div className={styles.step}>
      <h2 className={styles.heading}>{traced ? 'Wonderful!' : 'Nice work!'}</h2>
      <StarMeter filled={stars} />
      <p className={styles.message}>
        {traced ? `You learned ${letter}!` : `Come back and trace ${letter} for extra practice!`}
      </p>
      <KidButton onClick={onFinish}>Back to {letter}</KidButton>
      <Link to="/rewards" className={styles.storyLink}>
        Stories & Rewards &rarr;
      </Link>

      {showNotification && firstStory ? (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Story unlocked">
          <div className={styles.notification}>
            <h3 className={styles.notifHeading}>A new story is here!</h3>
            <p className={styles.notifTitle}>{firstStory.title}</p>
            <p className={styles.notifMessage}>
              You completed all the letters. Now you can read a story together!
            </p>
            <div className={styles.notifActions}>
              <KidButton
                variant="primary"
                size="primary"
                onClick={() => navigate(`/rewards/story/${firstStory.id}`)}
              >
                Read Story
              </KidButton>
              <KidButton
                variant="ghost"
                size="kid"
                onClick={() => setShowNotification(false)}
              >
                Close
              </KidButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
