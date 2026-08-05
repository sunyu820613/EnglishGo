import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { alphabet } from '../../data/alphabet';
import { stories } from '../../data/stories';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useProgressStore } from '../../store/progressStore';
import { getLetterStars } from '../../store/letterStars';
import page from '../../styles/page.module.css';
import { LessonProgressDots } from './LessonProgressDots';
import { StepQuiz } from './steps/StepQuiz';
import { StepMatch } from './steps/StepMatch';
import { StepTrace } from './steps/StepTrace';
import { StepReward } from './steps/StepReward';
import styles from './LessonPage.module.css';

const TOTAL_STEPS = 4;

export function LessonPage() {
  const { letter: letterParam } = useParams<{ letter: string }>();
  const letter = letterParam?.toUpperCase();
  const entry = alphabet.find((e) => e.letter === letter);
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();

  const markWordHeard = useProgressStore((s) => s.markWordHeard);
  const markQuizPassed = useProgressStore((s) => s.markQuizPassed);
  const markMatchPassed = useProgressStore((s) => s.markMatchPassed);
  const markLetterTraced = useProgressStore((s) => s.markLetterTraced);
  const wordsHeard = useProgressStore((s) => s.wordsHeard);
  const quizPassedLetters = useProgressStore((s) => s.quizPassedLetters);
  const matchPassedLetters = useProgressStore((s) => s.matchPassedLetters);
  const tracedLetters = useProgressStore((s) => s.tracedLetters);

  const [step, setStep] = useState(0);
  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));

  // The quiz jumps straight in  Eno separate "listen to each word" steps,
  // since the letter detail page above already covers that  Eso credit both
  // example words toward the 1st star as soon as the quiz starts.
  useEffect(() => {
    if (!entry) return;
    markWordHeard(entry.words[0]!.id);
    markWordHeard(entry.words[1]!.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.letter]);

  if (!entry || !letter) {
    return <Navigate to={letter ? `/alphabet/${letter}` : '/alphabet'} replace />;
  }

  const stars = getLetterStars(letter, { wordsHeard, quizPassedLetters, matchPassedLetters, tracedLetters });

  return (
    <div className={page.page}>
      <div className={page.container}>
        <nav className={styles.nav}>
          <button
            type="button"
            className={styles.leaveButton}
            aria-label="Leave lesson"
            onClick={() => navigate(`/alphabet/${letter}`)}
          >
            &larr; Leave
          </button>
        </nav>
        <LessonProgressDots totalSteps={TOTAL_STEPS} currentStep={step} />

        {step === 0 ? (
          <StepQuiz
            letterEntry={entry}
            allLetters={alphabet}
            reducedMotion={reducedMotion}
            onCompleted={() => {
              markQuizPassed(letter);
              next();
            }}
          />
        ) : null}

        {step === 1 ? (
          <StepMatch
            letter={letter}
            reducedMotion={reducedMotion}
            onCompleted={() => {
              markMatchPassed(letter);
              next();
            }}
          />
        ) : null}

        {step === 2 ? (
          <StepTrace
            letter={letter}
            onTraceComplete={() => markLetterTraced(letter)}
            onNext={next}
            onSkip={next}
          />
        ) : null}

        {step === 3 ? (
          <StepReward
            letter={letter}
            stars={stars}
            traced={tracedLetters.includes(letter)}
            unlockedStories={stories.filter((s) =>
              s.requiredLetters.includes(letter) &&
              s.requiredLetters.every((l) => getLetterStars(l, { wordsHeard, quizPassedLetters, matchPassedLetters, tracedLetters }) >= 3),
            )}
            onFinish={() => navigate(`/alphabet/${letter}`)}
          />
        ) : null}
      </div>
    </div>
  );
}
