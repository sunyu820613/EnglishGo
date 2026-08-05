import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { AlphabetOverviewPage } from '../features/alphabet/AlphabetOverviewPage';
import { AlphabetLetterPage } from '../features/alphabet/AlphabetLetterPage';
import { TraceLetterPage } from '../features/tracing/TraceLetterPage';
import { ThemesPage } from '../features/themes/ThemesPage';
import { PhonemesOverviewPage } from '../features/phonemes/PhonemesOverviewPage';
import { PhonemeDetailPage } from '../features/phonemes/PhonemeDetailPage';
import { LessonPage } from '../features/lesson/LessonPage';
import { RewardsPage } from '../features/rewards/RewardsPage';
import { StoryViewerPage } from '../features/rewards/StoryViewerPage';

const routes = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <AlphabetOverviewPage /> },
      { path: 'alphabet', element: <AlphabetOverviewPage /> },
      { path: 'alphabet/:letter', element: <AlphabetLetterPage /> },
      { path: 'alphabet/:letter/trace', element: <TraceLetterPage /> },
      { path: 'alphabet/:letter/lesson', element: <LessonPage /> },
      { path: 'rewards', element: <RewardsPage /> },
      { path: 'rewards/story/:storyId', element: <StoryViewerPage /> },
      { path: 'themes', element: <ThemesPage /> },
      { path: 'phonemes', element: <PhonemesOverviewPage /> },
      { path: 'phonemes/:slug', element: <PhonemeDetailPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes, { basename: '/EnglishGo/' });
