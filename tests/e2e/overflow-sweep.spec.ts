import { test, expect } from '@playwright/test';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 900, height: 1024 },
  { width: 1440, height: 900 },
];

test('no overflow across all 26 letter pages and all breakpoints', async ({ page }) => {
  const failures: string[] = [];
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    for (const letter of LETTERS) {
      await page.goto(`/alphabet/${letter}`);
      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      if (hasOverflow) failures.push(`${letter} @ ${viewport.width}x${viewport.height}`);
    }
  }
  expect(failures).toEqual([]);
});

test('no overflow on home and alphabet overview at all breakpoints', async ({ page }) => {
  const failures: string[] = [];
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    for (const path of ['/', '/alphabet']) {
      await page.goto(path);
      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      if (hasOverflow) failures.push(`${path} @ ${viewport.width}x${viewport.height}`);
    }
  }
  expect(failures).toEqual([]);
});
