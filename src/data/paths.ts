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
