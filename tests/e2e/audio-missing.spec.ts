import { test, expect } from '@playwright/test';

test('missing audio file degrades silently without crashing the page', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', (err) => pageErrors.push(err));

  // Force the letter-name audio request to 404, simulating a missing/corrupted asset.
  await page.route('**/audio/letters/a_name.m4a', (route) =>
    route.fulfill({ status: 404, body: 'not found' }),
  );

  await page.goto('/alphabet/A');
  const playButton = page.getByRole('button', { name: 'Play the letter A' });
  await expect(playButton).toBeVisible();
  await playButton.click();

  // Give the failed play() promise time to reject and be caught.
  await page.waitForTimeout(500);

  // Page must still be responsive: no uncaught JS errors, button not stuck disabled.
  expect(pageErrors).toEqual([]);
  await expect(playButton).toBeEnabled();

  // A different, valid audio file must still be playable afterwards.
  const wordButton = page.getByRole('button', { name: 'Play the word Apple' });
  await wordButton.click();
  await page.waitForTimeout(200);
  expect(pageErrors).toEqual([]);
});
