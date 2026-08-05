import { test, expect, type Page } from '@playwright/test';

// Grid coordinates from src/data/letterStrokes.ts (must match exactly — see
// tests/e2e/tracing.spec.ts for the source of truth on these).
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

async function traceLetterA(page: Page) {
  const canvas = page.locator('[aria-label="Letter tracing practice"]');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('canvas not laid out');
  const scaleX = box.width / 240;
  const scaleY = box.height / 300;
  const toScreen = ([vx, vy]: readonly [number, number]) => ({
    x: box.x + vx * scaleX,
    y: box.y + vy * scaleY,
  });
  for (const stroke of A_STROKES) {
    const [start, end] = [stroke[0], stroke[stroke.length - 1]];
    const startPoint = toScreen(start);
    await page.mouse.move(startPoint.x, startPoint.y);
    await page.mouse.down();
    for (let i = 1; i <= 20; i++) {
      const t = i / 20;
      const p = toScreen([start[0] + t * (end[0] - start[0]), start[1] + t * (end[1] - start[1])]);
      await page.mouse.move(p.x, p.y, { steps: 2 });
    }
    await page.mouse.up();
  }
}

async function reachTrace(page: Page) {
  await page.goto('/alphabet/A/lesson');
  await expect(page.getByLabel('Step 1 of 4')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Listen and find!' })).toBeVisible();

  await page.getByRole('button', { name: 'Option Apple' }).click();
  await expect(page.getByRole('heading', { name: 'Find the letter A!' })).toBeVisible();

  await page.getByRole('button', { name: 'Letter A' }).click();
  await expect(page.getByRole('heading', { name: 'Trace the letter!' })).toBeVisible();
}

test('completes the quiz, skipping trace: 3 stars, but not "fully learned"', async ({ page }) => {
  await reachTrace(page);

  await page.getByRole('button', { name: 'Skip' }).click();
  await expect(page.getByRole('heading', { name: 'Nice work!' })).toBeVisible();
  await expect(page.getByText(`Come back and trace A for extra practice!`)).toBeVisible();
  // Match already satisfies the 3rd star even without tracing.
  await expect(page.getByLabel('Stars: 3 of 3')).toBeVisible();

  const raw = await page.evaluate(() => localStorage.getItem('englishgo.progress.v1'));
  const state = JSON.parse(raw ?? '{}').state;
  expect(state.wordsHeard).toEqual(expect.arrayContaining(['apple', 'ant']));
  expect(state.quizPassedLetters).toContain('A');
  expect(state.matchPassedLetters).toContain('A');
  expect(state.tracedLetters ?? []).not.toContain('A');
});

test('actually tracing the letter earns the "Wonderful!" fully-learned message', async ({ page }) => {
  await reachTrace(page);

  await traceLetterA(page);
  await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();

  await expect(page.getByRole('heading', { name: 'Wonderful!' })).toBeVisible();
  await expect(page.getByText('You learned A!')).toBeVisible();
  await expect(page.getByLabel('Stars: 3 of 3')).toBeVisible();
});

test('gentle retry: two wrong quiz taps hide one distractor, never a failure state', async ({ page }) => {
  await page.goto('/alphabet/A/lesson');
  await expect(page.getByRole('heading', { name: 'Listen and find!' })).toBeVisible();

  // Cards render only an <img> (no visible text), so filtering by text
  // content can't distinguish them — exclude the correct option by its
  // accessible name instead.
  const clickAWrongOption = async () => {
    const buttons = await page.getByRole('button', { name: /^Option / }).all();
    for (const button of buttons) {
      if ((await button.getAttribute('aria-label')) !== 'Option Apple') {
        await button.click();
        return;
      }
    }
    throw new Error('no wrong option found');
  };

  await clickAWrongOption();
  await expect(page.getByRole('button', { name: /^Option / })).toHaveCount(3);

  await clickAWrongOption();
  await expect(page.getByRole('button', { name: /^Option / })).toHaveCount(2);

  // Still solvable — the correct option is never removed.
  await page.getByRole('button', { name: 'Option Apple' }).click();
  await expect(page.getByRole('heading', { name: 'Find the letter A!' })).toBeVisible();
});

test('leave lesson returns to the letter detail page without crashing', async ({ page }) => {
  await page.goto('/alphabet/A/lesson');
  await page.getByRole('button', { name: 'Leave lesson' }).click();
  await expect(page).toHaveURL(/\/alphabet\/A$/);
});
