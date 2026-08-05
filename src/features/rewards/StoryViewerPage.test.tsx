import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { StoryViewerPage } from './StoryViewerPage';

function renderAt(storyId: string) {
  return render(
    <MemoryRouter initialEntries={[`/rewards/story/${storyId}`]}>
      <Routes>
        <Route path="/rewards/story/:storyId" element={<StoryViewerPage />} />
        <Route path="/rewards" element={<div>Rewards page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('StoryViewerPage video mode (all 9 stories)', () => {
  const stories = ['story_abc', 'story_def', 'story_ghi', 'story_jkl',
    'story_mno', 'story_pqr', 'story_stu', 'story_vwx', 'story_yz'];
  stories.forEach((storyId) => {
    it(`renders a video element for ${storyId}`, () => {
      const { container } = renderAt(storyId);
      const video = container.querySelector('video');
      expect(video).toBeInTheDocument();
    });
  });
});

describe('StoryViewerPage video mode (story_abc)', () => {
  it('renders a video element with the correct src', () => {
    const { container } = renderAt('story_abc');

    expect(screen.getByText('A Sunny Day')).toBeInTheDocument();
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video!.getAttribute('src')).toBe('/videos/stories/story_abc.mp4');
  });

  it('does not render the page-by-page reader', () => {
    renderAt('story_abc');

    expect(screen.queryByText('1 / 5')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument();
  });
});

describe('StoryViewerPage unknown story', () => {
  it('renders \"Story not found\" without crashing', () => {
    renderAt('not-a-real-story');

    expect(screen.getByText('Story not found.')).toBeInTheDocument();
  });
});
