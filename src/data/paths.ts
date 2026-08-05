/**
 * Turns the relative paths stored in the data layer into absolute URLs
 * under /public that the browser can fetch. Centralised here so components
 * never hand-build audio/image URLs themselves.
 *
 * Uses import.meta.env.BASE_URL so paths work correctly when deployed under
 * a subpath (e.g. /EnglishGo/ on GitHub Pages).
 */
const base = import.meta.env.BASE_URL;

function p(path: string): string {
  // BASE_URL is already suffixed with /, but ensure no double slashes
  const baseNorm = base.endsWith('/') ? base : base + '/';
  const pathClean = path.startsWith('/') ? path.slice(1) : path;
  return `${baseNorm}${pathClean}`;
}

export function letterAudioPath(relative: string): string {
  return p(`audio/letters/${relative}`);
}

export function wordAudioPath(relative: string): string {
  return p(`audio/words/${relative}`);
}

export function phraseAudioPath(relative: string): string {
  return p(`audio/phrases/${relative}`);
}

export function wordImagePath(relative: string): string {
  return p(`images/words/${relative}`);
}

export function phonemeAudioPath(relative: string): string {
  return p(`audio/phonemes/${relative}`);
}

export function exampleWordAudioPath(slug: string): string {
  return p(`audio/example_words/${slug}.m4a`);
}

export function storyImagePath(relative: string): string {
  return p(`images/stories/${relative}`);
}

export function storyVideoPath(relative: string): string {
 return p(`videos/stories/${relative}`);
}

/** Gendered word audio path. Falls back to non-gendered path when the
 * gender-specific sub-directory doesn't have the file (the browser will
 * 404 silently and AudioService will console.warn). */
export function wordAudioPathGendered(relative: string, gender: 'male' | 'female'): string {
  return p(`audio/words/${gender}/${relative}`);
}
