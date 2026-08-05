export interface StoryPage {
  text: string;
  /** Relative to /images/stories/ */
  image: string;
}

export interface MiniStory {
  id: string;
  title: string;
  requiredLetters: string[];
  /** Pages of the story (image + text). */
  pages: StoryPage[];
  /** Optional narrated video path, relative to /videos/stories/.
   * When set (e.g. 'story_abc.mp4'), the viewer renders a <video> element
   * instead of the page-by-page reader. Only story_abc has this today. */
  video?: string;
}
