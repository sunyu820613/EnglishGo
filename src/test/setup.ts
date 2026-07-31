import '@testing-library/jest-dom/vitest';

// jsdom does not implement matchMedia; stub it so components/hooks that
// read prefers-reduced-motion (e.g. usePrefersReducedMotion) don't throw.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}
