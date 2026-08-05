import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { stories } from '../../data/stories';
import { storyImagePath, storyVideoPath } from '../../data/paths';
import { audioService } from '../../audio/useAudioService';
import { KidButton } from '../../components/KidButton';
import page from '../../styles/page.module.css';
import styles from './StoryViewerPage.module.css';

export function StoryViewerPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const story = stories.find((s) => s.id === storyId);

  if (!story) {
    return (
      <div className={page.page}>
        <div className={page.container}>
          <nav className={styles.nav}>
            <Link to="/rewards" className={styles.navLink}>
              &larr; Back to Collection
            </Link>
          </nav>
          <p className={styles.notFound}>Story not found.</p>
        </div>
      </div>
    );
  }

  if (story.video) {
    return <VideoPlayer story={story} />;
  }

  return <ImageReader story={story} />;
}

function VideoPlayer({ story }: { story: (typeof stories)[number] }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      audioService.setBgmEnabled(false);
    };

    const onPauseOrEnd = () => {
      audioService.setBgmEnabled(true);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPauseOrEnd);
    video.addEventListener('ended', onPauseOrEnd);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPauseOrEnd);
      video.removeEventListener('ended', onPauseOrEnd);
      if (!video.paused) {
        audioService.setBgmEnabled(true);
      }
    };
  }, []);

  return (
    <div className={page.page}>
      <div className={page.container}>
        <nav className={styles.nav}>
          <Link to="/rewards" className={styles.navLink}>
            &larr; Back to Collection
          </Link>
        </nav>
        <h1 className={styles.title}>{story.title}</h1>
        <div className={styles.videoWrapper}>
          <video
            ref={videoRef}
            className={styles.video}
            src={storyVideoPath(story.video!)}
            controls
            playsInline
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}

function ImageReader({ story }: { story: (typeof stories)[number] }) {
  const [pageIndex, setPageIndex] = useState(0);
  const navigate = useNavigate();
  const currentPage = story.pages[pageIndex];
  const isLastPage = pageIndex === story.pages.length - 1;

  const handleNext = () => {
    if (isLastPage) {
      navigate('/rewards');
    } else {
      setPageIndex((i) => i + 1);
    }
  };

  return (
    <div className={page.page}>
      <div className={page.container}>
        <nav className={styles.nav}>
          <Link to="/rewards" className={styles.navLink}>
            &larr; Back to Collection
          </Link>
        </nav>
        <h1 className={styles.title}>{story.title}</h1>

        {currentPage ? (
          <div className={styles.reader}>
            <div className={styles.imageFrame}>
              <img
                src={storyImagePath(currentPage.image)}
                alt=""
                className={styles.pageImage}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling;
                  if (fallback) {
                    (fallback as HTMLElement).style.display = 'flex';
                  }
                }}
              />
              <div className={styles.imageFallback} aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            </div>
            <p className={styles.pageText}>{currentPage.text}</p>
            <div className={styles.pageIndicator}>
              {pageIndex + 1} / {story.pages.length}
            </div>
            <KidButton
              variant="primary"
              size="primary"
              onClick={handleNext}
              aria-label={isLastPage ? 'Return to collection' : 'Next page'}
            >
              {isLastPage ? 'The End' : 'Next'}
            </KidButton>
          </div>
        ) : (
          <p className={styles.notFound}>This story has no pages.</p>
        )}
      </div>
    </div>
  );
}
