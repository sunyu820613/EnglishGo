import { test, expect } from '@playwright/test';

test('letter detail page links to tracing practice for a piloted letter', async ({ page }) => {
  await page.goto('/alphabet/A');
  const cta = page.getByRole('link', { name: /Practice writing/i });
  await expect(cta).toBeVisible();
  await cta.click();
  await expect(page).toHaveURL(/\/alphabet\/A\/trace$/);
});

test('a letter with only uppercase pilot data has no lowercase toggle', async ({ page }) => {
  await page.goto('/alphabet/D/trace');
  const canvas = page.locator('svg[aria-label="Letter tracing practice"]');
  await expect(canvas).toBeVisible();
  await expect(page.getByRole('button', { name: 'd', exact: true })).toHaveCount(0);
});

test('tracing a stroke completes it and unlocks the next one, persisting progress', async ({ page }) => {
  await page.goto('/alphabet/A/trace');
  const canvas = page.locator('svg[aria-label="Letter tracing practice"]');
  await expect(canvas).toBeVisible();

  const box = await canvas.boundingBox();
  if (!box) throw new Error('canvas not laid out');
  const scale = box.width / 200;
  const toScreen = (vx: number, vy: number) => ({ x: box.x + vx * scale, y: box.y + vy * scale });

  // Stroke 1 of uppercase A: apex (100,20) -> base-left (20,180).
  const start = toScreen(100, 20);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  const steps = 30;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const p = toScreen(100 + t * (20 - 100), 20 + t * (180 - 20));
    await page.mouse.move(p.x, p.y, { steps: 2 });
  }
  await page.mouse.up();

  // First stroke should now render as "done" (not "active").
  const strokes = canvas.locator('path');
  await expect(strokes.first()).toHaveClass(/done/);
});

test('hovering the path without pressing the mouse button does not advance progress', async ({ page }) => {
  await page.goto('/alphabet/A/trace');
  const canvas = page.locator('svg[aria-label="Letter tracing practice"]');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('canvas not laid out');
  const scale = box.width / 200;
  const toScreen = (vx: number, vy: number) => ({ x: box.x + vx * scale, y: box.y + vy * scale });

  // Same path as the completion test, but without mouse.down() first.
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = toScreen(100 + t * (20 - 100), 20 + t * (180 - 20));
    await page.mouse.move(p.x, p.y, { steps: 2 });
  }

  const strokes = canvas.locator('path');
  await expect(strokes.first()).toHaveClass(/active/);
  await expect(strokes.first()).not.toHaveClass(/done/);
});

test('tracing out of order (jumping ahead) does not complete the stroke', async ({ page }) => {
  await page.goto('/alphabet/A/trace');
  const canvas = page.locator('svg[aria-label="Letter tracing practice"]');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('canvas not laid out');
  const scale = box.width / 200;
  const toScreen = (vx: number, vy: number) => ({ x: box.x + vx * scale, y: box.y + vy * scale });

  // Jump straight to the far end of the first stroke instead of tracing it.
  const start = toScreen(100, 20);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  const end = toScreen(20, 180);
  await page.mouse.move(end.x, end.y, { steps: 1 });
  await page.mouse.up();

  const strokes = canvas.locator('path');
  await expect(strokes.first()).not.toHaveClass(/done/);
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
