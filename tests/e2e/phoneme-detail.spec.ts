import { test, expect } from '@playwright/test';

const SAMPLE_PHONEMES = [
  { slug: 'i', ipa: 'iː' },
  { slug: 'ae', ipa: 'æ' },
  { slug: 'th', ipa: 'θ' },
  { slug: 'r', ipa: 'r' },
  { slug: 'ng', ipa: 'ŋ' },
];

const VIEWPORTS = [
  { width: 375, height: 812 }, // mobile
  { width: 900, height: 1024 }, // tablet
  { width: 1440, height: 900 }, // desktop
];

test.describe('M2 sample phoneme pages', () => {
  for (const { slug, ipa } of SAMPLE_PHONEMES) {
    test(`/phonemes/${slug} shows the full animated experience`, async ({ page }) => {
      await page.goto(`/phonemes/${slug}`);

      await expect(page.getByText(`/${ipa}/`).first()).toBeVisible();

      // Front + side mouth-shape animation canvases.
      await expect(page.getByRole('img', { name: /Front mouth-shape view/ })).toBeVisible();
      await expect(
        page.getByRole('img', { name: /Side mouth cross-section view/ }),
      ).toBeVisible();

      // No "coming soon" placeholder for a fully-built sample phoneme.
      await expect(page.getByText(/animation coming soon/i)).toHaveCount(0);

      // 4 voice/speed variant buttons, all clickable.
      for (const label of ['Female · Normal', 'Male · Normal', 'Female · Slow', 'Male · Slow']) {
        const button = page.getByRole('button', { name: label, exact: true });
        await expect(button).toBeEnabled();
      }

      // At least 2 example words.
      const wordButtons = page.getByRole('button', { name: /^Play the word / });
      expect(await wordButtons.count()).toBeGreaterThanOrEqual(2);
    });
  }

  test('minimal-pair comparison is clickable and plays audio for both sounds', async ({ page }) => {
    await page.goto('/phonemes/i');

    await expect(page.getByRole('heading', { name: 'Compare similar sounds' })).toBeVisible();

    const soundButtons = page.getByRole('button', { name: /^Play the sound / });
    // Primary big SoundButton + one per comparison column = at least 3.
    expect(await soundButtons.count()).toBeGreaterThanOrEqual(3);
    await soundButtons.first().click();

    const playBothButton = page.getByRole('button', { name: 'Play both sounds' });
    await expect(playBothButton).toBeEnabled();
    await playBothButton.click();
  });

  test('no horizontal overflow across all 5 sample phoneme pages at 3 breakpoints', async ({
    page,
  }) => {
    const failures: string[] = [];
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      for (const { slug } of SAMPLE_PHONEMES) {
        await page.goto(`/phonemes/${slug}`);
        const hasOverflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        if (hasOverflow) failures.push(`${slug} @ ${viewport.width}x${viewport.height}`);
      }
    }
    expect(failures).toEqual([]);
  });

  test('a non-sample phoneme page still shows the M1 "coming soon" placeholder', async ({
    page,
  }) => {
    await page.goto('/phonemes/p');
    await expect(
      page.getByText(/Mouth-shape animations for this sound are coming soon/),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Male voice' })).toBeDisabled();
  });
});
