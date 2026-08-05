/**
 * Turns the relative paths stored in the data layer into absolute URLs
 * under /public that the browser can fetch. Centralised here so components
 * never hand-build audio/image URLs themselves.
 */
export function letterAudioPath(relative: string): string {
  return `/audio/letters/${relative}`;
}

export function wordAudioPath(relative: string): string {
  return `/audio/words/${relative}`;
}

export function phraseAudioPath(relative: string): string {
  return `/audio/phrases/${relative}`;
}

export function wordImagePath(relative: string): string {
  return `/images/words/${relative}`;
}

export function phonemeAudioPath(relative: string): string {
  return `/audio/phonemes/${relative}`;
}

export function exampleWordAudioPath(slug: string): string {
  return `/audio/example_words/${slug}.m4a`;
}
export function storyImagePath(relative: string): string {
  return `/images/stories/${relative}`;
}

export function storyVideoPath(relative: string): string {
 return `/videos/stories/${relative}`;
}

/** Gendered word audio path. Falls back to non-gendered path when the
 * gender-specific sub-directory doesn't have the file (the browser will
 * 404 silently and AudioService will console.warn). */
export function wordAudioPathGendered(relative: string, gender: 'male' | 'female'): string {
  return `/audio/words/${gender}/${relative}`;
}
