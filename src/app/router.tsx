import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { AlphabetOverviewPage } from '../features/alphabet/AlphabetOverviewPage';
import { AlphabetLetterPage } from '../features/alphabet/AlphabetLetterPage';
import { ThemesPage } from '../features/themes/ThemesPage';
import { PhonemesOverviewPage } from '../features/phonemes/PhonemesOverviewPage';
import { PhonemeDetailPage } from '../features/phonemes/PhonemeDetailPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <AlphabetOverviewPage /> },
      { path: 'alphabet', element: <AlphabetOverviewPage /> },
      { path: 'alphabet/:letter', element: <AlphabetLetterPage /> },
      { path: 'themes', element: <ThemesPage /> },
      { path: 'phonemes', element: <PhonemesOverviewPage /> },
      { path: 'phonemes/:slug', element: <PhonemeDetailPage /> },
    ],
  },
]);
