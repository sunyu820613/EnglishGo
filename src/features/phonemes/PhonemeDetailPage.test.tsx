import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PhonemeDetailPage } from './PhonemeDetailPage';

function renderAt(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/phonemes/${slug}`]}>
      <Routes>
        <Route path="/phonemes/:slug" element={<PhonemeDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PhonemeDetailPage', () => {
  it('renders the full M2 experience for a sample phoneme (/iː/)', () => {
    renderAt('i');

    expect(screen.getAllByText('/iː/').length).toBeGreaterThan(0);
    // Front + side rig canvases.
    expect(screen.getByRole('img', { name: /Front mouth-shape view/ })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Side mouth cross-section view/ })).toBeInTheDocument();
    // 4 voice/speed variant buttons, all enabled (placeholder audio, see phonemes.ts).
    for (const label of ['Female · Normal', 'Male · Normal', 'Female · Slow', 'Male · Slow']) {
      // RegExp with anchors for an exact match — @testing-library/dom's
      // ByRoleOptions has no `exact` flag (unlike getByText), and without
      // anchoring, "Male · Normal" is a substring of "Female · Normal"
      // ("Fe" + "male · Normal"), matching both.
      expect(screen.getByRole('button', { name: new RegExp(`^${label}$`) })).toBeEnabled();
    }
    // At least 2 example words.
    expect(screen.getAllByText('see').length).toBeGreaterThan(0);
    expect(screen.getAllByText('tree').length).toBeGreaterThan(0);
    // Minimal-pair comparison section.
    expect(screen.getByRole('heading', { name: 'Compare similar sounds' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play both sounds' })).toBeInTheDocument();
    // No "coming soon" placeholder for a fully-built sample phoneme.
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
  });

  it('falls back to the M1 "coming soon" placeholder for phonemes without rig data', () => {
    renderAt('p'); // /p/ has no animationRig in M2

    expect(screen.getByText('/p/')).toBeInTheDocument();
    expect(
      screen.getByText(/Mouth-shape animations for this sound are coming soon/),
    ).toBeInTheDocument();
    expect(screen.getByText('Front view — animation coming soon')).toBeInTheDocument();
    expect(screen.getByText('Side view — animation coming soon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Male voice' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Slow' })).toBeDisabled();
  });

  it('redirects to the overview page for an unknown slug', () => {
    render(
      <MemoryRouter initialEntries={['/phonemes/not-a-real-slug']}>
        <Routes>
          <Route path="/phonemes/:slug" element={<PhonemeDetailPage />} />
          <Route path="/phonemes" element={<div>Overview page</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Overview page')).toBeInTheDocument();
  });
});
