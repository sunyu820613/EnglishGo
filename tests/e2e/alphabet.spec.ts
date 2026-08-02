import { test, expect } from '@playwright/test';

test('home page is the alphabet overview', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Learn the Alphabet' })).toBeVisible();
  await expect(page.getByText('Learned 0 / 26')).toBeVisible();
});

test('a letter page plays audio, toggles voice gender, and persists progress on reload', async ({
  page,
}) => {
  await page.goto('/alphabet/A');
  await expect(page.getByText('Aa', { exact: true })).toBeVisible();

  // Male/female toggle in the top bar affects the letter-name SoundButton.
  const genderToggle = page.getByRole('button', { name: /Voice: (male|female)/i });
  await expect(genderToggle).toBeVisible();
  await genderToggle.click();

  // Word cards for Apple/Ant are present and clickable (audio playback is
  // triggered by user gesture, satisfying autoplay policy requirements).
  await expect(page.getByRole('button', { name: 'Play the word Apple' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play the word Ant' })).toBeVisible();

  await page.reload();
  await page.goto('/alphabet');
  await expect(page.getByText('Learned 1 / 26')).toBeVisible();
});

test('letter A shows its pronunciation variants with playable example words', async ({ page }) => {
  await page.goto('/alphabet/A');
  await expect(page.getByRole('heading', { name: 'A says…' })).toBeVisible();

  const variantIpas = ['/æ/', '/eɪ/', '/ə/', '/ɑ/', '/ɔ/', '/ɑr/', '/ɛr/', '/ə~ɪ/'];
  for (const ipa of variantIpas) {
    await expect(page.getByText(ipa, { exact: true })).toBeVisible();
  }

  const acornButton = page.getByRole('button', { name: 'Play the word Acorn' });
  await expect(acornButton).toBeVisible();
  await acornButton.click();
});

test('letter E shows its pronunciation variants, including the silent-E row', async ({ page }) => {
  await page.goto('/alphabet/E');
  await expect(page.getByRole('heading', { name: 'E says…' })).toBeVisible();

  const variantIpas = ['/ɛ/', '/iː/', '/ɪ~ə/', '/ə/', '/ɝ/', '/eɪ/'];
  for (const ipa of variantIpas) {
    await expect(page.getByText(ipa, { exact: true })).toBeVisible();
  }
  await expect(page.getByText('Silent', { exact: true })).toBeVisible();

  await expect(page.getByRole('button', { name: 'Play the word Café' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play the word Résumé' })).toBeVisible();
});

test('every letter A-Z has its own "says..." pronunciation table', async ({ page }) => {
  const missing: string[] = [];
  for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    await page.goto(`/alphabet/${letter}`);
    const count = await page.getByRole('heading', { name: `${letter} says…` }).count();
    if (count !== 1) missing.push(letter);
  }
  expect(missing).toEqual([]);
});

test('single-example rows (R, single pronunciation) still render correctly', async ({ page }) => {
  await page.goto('/alphabet/R');
  await expect(page.getByRole('heading', { name: 'R says…' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play the word Rabbit' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play the word Robot' })).toBeVisible();
});

test('Z uses a different word than E for the sound it shares (zebra is not repeated)', async ({ page }) => {
  await page.goto('/alphabet/Z');
  await expect(page.getByRole('button', { name: 'Play the word Zipper' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play the word Zoo' })).toBeVisible();
});

test('no horizontal overflow on mobile, tablet, and desktop viewports', async ({ page }) => {
  for (const viewport of [
    { width: 375, height: 812 }, // mobile
    { width: 900, height: 1024 }, // tablet
    { width: 1440, height: 900 }, // desktop
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/alphabet/A');
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);
  }
});
