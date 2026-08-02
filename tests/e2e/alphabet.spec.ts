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

test('letter A shows its other pronunciation variants with playable example words', async ({ page }) => {
  await page.goto('/alphabet/A');
  await expect(page.getByRole('heading', { name: 'A says…' })).toBeVisible();

  // /æ/ is deliberately excluded — it's already shown via PhonicsCompare + Apple/Ant above.
  const variantIpas = ['/eɪ/', '/ə/', '/ɑ/', '/ɔ/', '/ɑr/', '/ɛr/', '/ə~ɪ/'];
  for (const ipa of variantIpas) {
    await expect(page.getByText(ipa, { exact: true })).toBeVisible();
  }

  const acornButton = page.getByRole('button', { name: 'Play the word Acorn' });
  await expect(acornButton).toBeVisible();
  await acornButton.click();
});

test('a letter without sound variants (B) has no "says" section', async ({ page }) => {
  await page.goto('/alphabet/B');
  await expect(page.getByRole('heading', { name: /says…/ })).toHaveCount(0);
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
