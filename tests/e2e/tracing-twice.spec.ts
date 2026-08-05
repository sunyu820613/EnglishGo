import { test, expect, type Page } from '@playwright/test';

const A_STROKES = [
  [[120, 60], [75, 180]],
  [[120, 60], [165, 180]],
  [[100, 135], [140, 135]],
] as const;

async function traceStroke(page: Page, box: { x: number; y: number; width: number; height: number }, stroke: readonly (readonly [number, number])[]) {
  const scaleX = box.width / 240;
  const scaleY = box.height / 300;
  const toScreen = ([vx, vy]: readonly [number, number]) => ({
    x: box.x + vx * scaleX,
    y: box.y + vy * scaleY,
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

test('debug finishCase', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (msg) => {
    if (msg.text().includes('[TRACE-DEBUG]')) logs.push(msg.text());
  });

  await page.goto('/alphabet/A/trace');
  const canvas = page.locator('[aria-label="Letter tracing practice"]');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('canvas not laid out');

  // First trace
  for (const stroke of A_STROKES) {
    await traceStroke(page, box, stroke);
  }
  await expect(page.getByRole('button', { name: 'Tap to try again' })).toBeVisible();
  await page.waitForTimeout(300);

  console.log('Logs:', JSON.stringify(logs));

  await page.getByRole('button', { name: 'Tap to try again' }).click();
  await page.waitForTimeout(200);

  // Second trace
  for (const stroke of A_STROKES) {
    await traceStroke(page, box, stroke);
  }
  await expect(page.getByRole('button', { name: 'Tap to try again' })).toBeVisible();
  await page.waitForTimeout(300);

  console.log('Logs:', JSON.stringify(logs));
});
