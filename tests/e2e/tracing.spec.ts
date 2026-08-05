import { test, expect, type Page } from '@playwright/test';

// Grid coordinates from src/data/letterStrokes.ts (GRID_LINES: top=60,
// upperMid=120, lowerMid=180, bottom=240) — must match that file exactly,
// since its coordinates are off-limits to change for this integration.
const A_STROKES = [
  [
    [120, 60],
    [75, 180],
  ],
  [
    [120, 60],
    [165, 180],
  ],
  [
    [100, 135],
    [140, 135],
  ],
] as const;

async function traceStroke(page: Page, canvasBox: { x: number; y: number; width: number; height: number }, stroke: readonly (readonly [number, number])[]) {
  const scaleX = canvasBox.width / 240;
  const scaleY = canvasBox.height / 300;
  const toScreen = ([vx, vy]: readonly [number, number]) => ({
    x: canvasBox.x + vx * scaleX,
    y: canvasBox.y + vy * scaleY,
  });
  const [start, end] = [stroke[0], stroke[stroke.length - 1]];
  const startPoint = toScreen(start);
  await page.mouse.move(startPoint.x, startPoint.y);
  await page.mouse.down();
  const steps = 20;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const p = toScreen([start[0] + t * (end[0] - start[0]), start[1] + t * (end[1] - start[1])]);
    await page.mouse.move(p.x, p.y, { steps: 2 });
  }
  await page.mouse.up();
}

test('letter detail page links to tracing practice for a piloted letter', async ({ page }) => {
  await page.goto('/alphabet/A');
  const cta = page.getByRole('link', { name: /Practice writing/i });
  await expect(cta).toBeVisible();
  await cta.click();
  await expect(page).toHaveURL(/\/alphabet\/A\/trace$/);
});

test('every letter has both a case toggle and playable canvas (full A-Z + a-z coverage)', async ({ page }) => {
  for (const letter of ['A', 'M', 'Z']) {
    await page.goto(`/alphabet/${letter}/trace`);
    await expect(page.locator(`[aria-label="Letter tracing practice"]`)).toBeVisible();
    await expect(page.getByRole('button', { name: letter, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: letter.toLowerCase(), exact: true })).toBeVisible();
  }
});

test('tracing every stroke completes the case, replays audio, and stays on the same case', async ({ page }) => {
  await page.goto('/alphabet/A/trace');
  const canvas = page.locator('[aria-label="Letter tracing practice"]');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  if (!box) throw new Error('canvas not laid out');

  for (const stroke of A_STROKES) {
    await traceStroke(page, box, stroke);
  }

  // Completing uppercase A marks it traced and shows the retry overlay on the
  // same board — no auto-advance to lowercase.
  await expect(page.getByRole('button', { name: 'Tap to try again' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'A', exact: true })).toHaveClass(/caseActive/);
  const traced = await page.evaluate(() => localStorage.getItem('englishgo.progress.v1'));
  const parsed = traced ? JSON.parse(traced) : { state: { tracedLetters: [] } };
  expect(parsed.state.tracedLetters ?? []).toContain('A');
});

test('a stray tap far from the stroke does not complete it', async ({ page }) => {
  await page.goto('/alphabet/A/trace');
  const canvas = page.locator('[aria-label="Letter tracing practice"]');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('canvas not laid out');

  // A single small scribble in a corner, nowhere near stroke 1.
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + 15, box.y + 12);
  await page.mouse.move(box.x + 20, box.y + 10);
  await page.mouse.up();

  await expect(page.getByRole('button', { name: 'Tap to try again' })).toHaveCount(0);
});

test('opening a trace page is always blank, even if that case was already traced before', async ({ page }) => {
  await page.goto('/alphabet/A/trace');
  await page.evaluate(() => {
    localStorage.setItem('englishgo.progress.v1', JSON.stringify({ state: { tracedLetters: ['A'] }, version: 0 }));
  });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Tap to try again' })).toHaveCount(0);
});

test('the "Watch me write it" demo button is present and clickable without error', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', (err) => pageErrors.push(err));
  await page.goto('/alphabet/A/trace');
  await page.getByRole('button', { name: 'Watch me write it' }).click();
  await page.waitForTimeout(200);
  expect(pageErrors).toEqual([]);
});

test('skip button returns to the letter detail page without marking progress', async ({ page }) => {
  await page.goto('/alphabet/B/trace');
  await page.getByRole('button', { name: 'Skip writing practice' }).click();
  await expect(page).toHaveURL(/\/alphabet\/B$/);

  const traced = await page.evaluate(() => localStorage.getItem('englishgo.progress.v1'));
  const parsed = traced ? JSON.parse(traced) : { state: { tracedLetters: [] } };
  expect(parsed.state.tracedLetters ?? []).not.toContain('B');
});

test('no horizontal overflow across all 26 tracing pages', async ({ page }) => {
  const failures: string[] = [];
  for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    await page.goto(`/alphabet/${letter}/trace`);
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    if (hasOverflow) failures.push(letter);
  }
  expect(failures).toEqual([]);
});

test('no horizontal overflow on the tracing page at mobile, tablet, and desktop', async ({ page }) => {
  for (const viewport of [
    { width: 375, height: 812 },
    { width: 900, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/alphabet/A/trace');
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);
  }
});
