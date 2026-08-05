# Task 05 — Port "Mini Stories" reward feature from `main` (Flutter) to `react-rewrite`

**Status:** Not started. Handed off because the Claude session that scoped this hit
its context limit. Everything needed to implement without re-exploring the
codebase is below — do not re-derive it from `git log main`, it's already
extracted here.

**Branch:** `react-rewrite`. Assets are already copied (see "Already done"
below) — start from the data layer.

---

## 1. What this feature is

From `docs/REWARD_SYSTEM.md` (checked into both branches, still authoritative):

> 迷你故事 | 完成 A/B/C、D/E/F… 每 3 字母一段 | 收藏册（故事页）

Every 3 letters (A/B/C, D/E/F, G/H/I, ...) unlock a short illustrated mini-story,
readable from the Rewards ("My Collection") page. A story unlocks once **every
required letter has reached 3 stars** (same mastery bar as the letter badge —
see `getLetterStars` in [`src/store/letterStars.ts`](../../src/store/letterStars.ts)).

Locked stories show as a locked row with "Complete A, B, C to unlock" instead
of the title. Unlocked stories are tappable and open a reader.

**Reader has two modes now, picked per-story:** the original page-by-page
image reader (one image + one line of text per page, "Next" button, "The
End" on the last page returns to Rewards) — still the mode for 8 of the 9
stories — and a new **video mode**: `story_abc` now has a 15s narrated video
(the 5 illustrations animated + TTS narration + burned-in subtitles of the
exact same page text) instead of a static slideshow. See §2b/§4/§5 for where
the video lives and how the viewer should branch on it.

## 2. Reference implementation (`main` branch, Flutter — already read, quoted in full)

### 2a. Data model — `lib/data/stories/models.dart`

```dart
class StoryPage {
  const StoryPage({required this.text, required this.image});
  final String text;
  final String image;
}

class MiniStory {
  const MiniStory({
    required this.id,
    required this.title,
    required this.requiredLetters,
    required this.pages,
  });
  final String id;
  final String title;
  final List<String> requiredLetters;
  final List<StoryPage> pages;

  /// A story unlocks once every required letter has reached 3 stars.
  bool isUnlockedBy(Map<String, int> starsByLetter) {
    return requiredLetters.every(
      (String letter) => (starsByLetter[letter] ?? 0) >= 3,
    );
  }
}
```

### 2b. Content — `main`'s `assets/data/stories.json` only had 1 of 9 stories written

`main` only ever wrote `story_abc`. **This has since been completed**: all 9
letter-group stories (A/B/C through Y/Z) are now fully written, in the same
5-page/tone/style as `story_abc`, in
[`05-mini-stories-content.md`](05-mini-stories-content.md) — including a
ready-to-paste `src/data/stories.ts` array. Use that file directly for step 2
below instead of retyping `story_abc` from `main`.

**Illustrations are also done** — all 45 images (`story_abc_1..5` +
`story_def_1..5` through `story_yz_1..5`) exist in
`public/images/stories/`, generated via the same DashScope pipeline `main`
used for the word illustrations. See `05-mini-stories-content.md`'s
"Illustrations: all 45 generated" section for the generation script/prompt
file locations. Graceful missing-image fallback (§5 step 6) is still worth
keeping for robustness, but nothing is actually missing.

**`story_abc` also has a narrated video** at
`public/videos/stories/story_abc.mp4` (15s, 1280×720, h264+aac, ~3.6MB) —
the same 5 illustrations animated by a separate pipeline
(`seedance_story/` at the repo root, ByteDance Seedance 2.0 image-to-video
via the Volcengine Ark API, not DashScope — a different vendor/pipeline
than the illustrations), with synthesized narration audio and burned-in
subtitles reading the exact same 5 lines of page text (see
`seedance_story/output/story_en.ass` for the timing). The other 8 stories
do **not** have a video yet — this is a per-story opt-in, not a full
migration off the image reader. `MiniStory` needs an optional `video` field
(§5 step 1) so the data model can express "this story has a video" without
forcing one on every story.

### 2c. Unlock/list UI — `lib/features/rewards/rewards_page.dart` (`_StoryList`/`_StoryTile`, condensed)

- A "Mini Stories" section below the sticker grid.
- One row per story: icon (book if unlocked, lock if not) + title (unlocked)
  or `"Complete ${requiredLetters.join(', ')} to unlock"` (locked).
- Locked rows are not tappable (`onTap: unlocked ? ... : null`); unlocked rows
  navigate to the story viewer.
- Semantics label distinguishes locked/unlocked for screen readers.

### 2d. Viewer — `lib/features/rewards/story_viewer_page.dart` (condensed)

- One page at a time: rounded image (260×260, `BoxFit.cover`, graceful
  fallback icon if the image fails to load) + centered text below it + a
  single button.
- Button reads "Next" on every page except the last, where it reads "The
  End" and navigates back to Rewards instead of advancing.
- `_pageIndex` is local component state, resets each time the page mounts.

## 3. Target codebase (`react-rewrite`) — current state

**Nothing from this feature exists yet.** Confirmed by grep — no `story`/
`stories` hits anywhere under `src/`.

Relevant existing patterns to match (read these before writing code):

- **Data layer pattern**: [`src/data/alphabet.ts`](../../src/data/alphabet.ts) +
  [`src/data/alphabet.types.ts`](../../src/data/alphabet.types.ts) — plain
  exported TS arrays/types, no async loader, no schema validation at
  runtime (the Flutter version's `StoryDataException`/schema-version check
  does **not** need to be ported — this app just imports a typed `.ts`
  module directly, same as `alphabet.ts`).
- **Asset path helpers**: [`src/data/paths.ts`](../../src/data/paths.ts) — every
  asset kind gets a tiny `xxxPath(relative: string): string` function that
  prefixes the `/public` URL. Add a `storyImagePath()` following the exact
  same shape as `wordImagePath()`, and a `storyVideoPath()` the same way but
  prefixing `/videos/stories/`.
- **Star calculation**: [`src/store/letterStars.ts`](../../src/store/letterStars.ts)
  `getLetterStars(letter, progress): number` — reuse this directly, don't
  reimplement star math. `progress` shape comes from
  [`src/store/progressStore.ts`](../../src/store/progressStore.ts) (`wordsHeard`,
  `quizPassedLetters`, `matchPassedLetters`, `tracedLetters`).
- **Page container pattern**: every page wraps content in
  `<div className={page.page}><div className={page.container}>` using
  [`src/styles/page.module.css`](../../src/styles/page.module.css)'s shared
  responsive padding — see [`RewardsPage.tsx`](../../src/features/rewards/RewardsPage.tsx)
  for the exact usage.
- **Button component**: [`src/components/KidButton.tsx`](../../src/components/KidButton.tsx)
  — `<KidButton variant="primary" size="primary">Next</KidButton>`, no other
  button component exists, use this for the viewer's Next/The End button.
- **CSS**: CSS Modules + design tokens as `var(--space-*)`, `var(--color-*)`,
  `var(--font-*)`, `var(--text-*)`, `var(--radius-*)`, `var(--shadow-*)` — see
  [`RewardsPage.module.css`](../../src/features/rewards/RewardsPage.module.css)
  for exact token names in active use. No emoji icons anywhere in this
  codebase — if a lock icon is needed, use a small inline SVG (check
  `src/features/alphabet/AlphabetLetterPage.tsx` and `AlphabetGlobe.tsx` for
  the star icon's inline-SVG style to match).
- **Routing**: [`src/app/router.tsx`](../../src/app/router.tsx) — flat list of
  `{ path, element }` under the single `AppShell` layout route. Nested paths
  already in use: `alphabet/:letter`, `alphabet/:letter/trace`,
  `alphabet/:letter/lesson`. Add the story viewer the same way:
  `rewards/story/:storyId`.

## 4. Already done (don't redo)

- All 45 story images are in `public/images/stories/`: `story_abc_1.webp` …
  `_5.webp` (copied from `main`, same bytes verified) plus `story_def_1.webp`
  through `story_yz_5.webp` (40 newly generated this session via the same
  DashScope `wan2.7-image-pro` pipeline `main` used — see
  `05-mini-stories-content.md` for the script/prompt file locations and a
  contact-sheet preview). Nothing left to generate.
- Full 9-story text content is written — see §2b.
- `story_abc`'s narrated video is at `public/videos/stories/story_abc.mp4`
  — see §2b. Not yet referenced from `stories.ts` (that's §5 step 2) or
  rendered anywhere (that's §5 step 6).

## 5. Implementation plan

1. **`src/data/stories.types.ts`** — `StoryPage { text: string; image: string }`
   and `MiniStory { id: string; title: string; requiredLetters: string[]; pages: StoryPage[]; video?: string }`,
   mirroring `alphabet.types.ts`'s style. `video` is optional and only set
   for `story_abc` right now — everything else stays exactly as before for
   the 8 stories without one.
2. **`src/data/stories.ts`** — paste the full 9-story array from
   [`05-mini-stories-content.md`](05-mini-stories-content.md)'s "Ready-to-paste"
   section (image paths as bare filenames, e.g. `'story_abc_1.webp'` — the
   `storyImagePath()` helper adds the `/images/stories/` prefix, matching how
   `alphabet.ts` stores bare word image filenames), then add
   `video: 'story_abc.mp4'` to the `story_abc` entry only.
3. **`src/data/paths.ts`** — add:
   ```ts
   export function storyImagePath(relative: string): string {
     return `/images/stories/${relative}`;
   }
   export function storyVideoPath(relative: string): string {
     return `/videos/stories/${relative}`;
   }
   ```
4. **`src/store/storyUnlock.ts`** (new, small pure-function module, no new
   Zustand store needed — unlock state is fully derived, same philosophy as
   `letterStars.ts`):
   ```ts
   import type { MiniStory } from '../data/stories.types';

   export function isStoryUnlocked(story: MiniStory, starsByLetter: Record<string, number>): boolean {
     return story.requiredLetters.every((letter) => (starsByLetter[letter] ?? 0) >= 3);
   }
   ```
   Direct TS port of `MiniStory.isUnlockedBy`.
5. **`src/features/rewards/RewardsPage.tsx`** — add a "Mini Stories" section
   below the existing sticker grid:
   - Build `starsByLetter` once via `alphabet.map(e => e.letter)` +
     `getLetterStars(letter, progress)` (the four progress arrays are already
     destructured at the top of this file).
   - Render one row per `stories` entry using `isStoryUnlocked`. Unlocked →
     `<Link to={`/rewards/story/${story.id}`}>` with the title. Locked → plain
     (non-link) row with `Complete {requiredLetters.join(', ')} to unlock`.
   - New CSS classes in `RewardsPage.module.css` for the story row/list,
     following the existing token usage in that file (don't invent new
     spacing/color values).
6. **`src/features/rewards/StoryViewerPage.tsx`** + `.module.css` (new files):
   - Reads `:storyId` from `useParams()`, looks it up in `stories`.
   - **If `story.video` is set** (currently only `story_abc`): render a
     `<video>` element (`storyVideoPath(story.video)`, native `controls`,
     `playsInline`) instead of the page-by-page reader — the video already
     has narration + burned-in subtitles for every line, so there's no
     separate text/image UI to build for this path. Still show a way back to
     `/rewards` (e.g. a persistent back link/button above or below the
     player — the video has no "Next"/"The End" button concept, it's one
     continuous clip). Don't autoplay with sound on mount (browser autoplay
     policies + this app's general audio-needs-a-gesture pattern, see
     `src/audio/AudioService.ts`'s module doc) — let the native controls'
     play button start it.
   - **Else** (no `video`, the other 8 stories): the original page-by-page
     reader — local `useState` for `pageIndex` (0-based, reset on mount, no
     need to persist reading position), current page's image
     (`storyImagePath(page.image)`) + text + a `KidButton` that advances
     `pageIndex` or, on the last page, navigates back to `/rewards`
     (`useNavigate()` from `react-router-dom`).
   - Story-not-found and page-image-load-failure should degrade gracefully
     (don't crash) — match this codebase's general pattern of graceful asset
     fallback rather than the Flutter version's `errorBuilder` verbatim.
7. **`src/app/router.tsx`** — add
   `{ path: 'rewards/story/:storyId', element: <StoryViewerPage /> }`.

## 6. Tests required (this repo's bar: `tester` role runs before `code-reviewer`, nothing ships without both)

- `src/store/storyUnlock.test.ts` — unit tests for `isStoryUnlocked`: all
  required letters ≥3 stars → true; one below 3 → false; empty
  `requiredLetters` edge case if relevant.
- `src/data/stories.test.ts` — light data-integrity check mirroring
  `alphabet.test.ts`'s style (e.g. every story has ≥1 page, non-empty id/title).
- Extend `RewardsPage`'s existing tests (or add
  `RewardsPage.test.tsx` if none exists yet — check first) to cover: locked
  story row renders with the correct "Complete X, Y, Z" text and is not a
  link; unlocked story row is a link to the right path.
- `StoryViewerPage.test.tsx` (new): for an image-mode story (e.g.
  `story_def`), renders first page's text/image, "Next" advances through
  pages, last page's button reads "The End" and navigating it goes back to
  `/rewards`; for `story_abc` (video mode), renders a `<video>` element
  pointing at `storyVideoPath('story_abc.mp4')` instead of the page reader;
  unknown `storyId` doesn't crash.
- Run the full suite after: `npx vitest run` and `npx tsc --noEmit`, both
  must be clean (this project's hard gate — see root `CLAUDE.md`).
- Playwright e2e is optional for this task (existing `tests/e2e/*.spec.ts`
  cover other features) — add one only if time allows, don't block
  completion on it.

## 7. Explicit non-goals (already decided, don't re-litigate)

- Runtime JSON schema validation / a `StoryRepository`-style loader class —
  this app imports typed `.ts` data directly everywhere else, stay
  consistent, don't add an async loading layer for a small static array.
- A dedicated Zustand store for story unlock state — it's fully derived from
  existing progress state, same as letter stars.
- Generating narrated videos for the other 8 stories — `story_abc`'s video
  was a separate one-off pipeline run (`seedance_story/`, different vendor/
  API than the illustrations), not something to batch-repeat for D/E/F
  through Y/Z as part of this task. If that's wanted later it's a distinct
  follow-up, not blocking this port.
- A synced audio narration track for the *image-reader* mode (the 8
  non-video stories) — out of scope, the Flutter version never had this
  either; only `story_abc`'s dedicated video has narration, baked into the
  video file itself.

## 8. When done

Append an entry to [`docs/AGENT_HANDOFF.md`](../AGENT_HANDOFF.md) (see that
file's existing entries for the expected format: what was built, files
touched, verification results, what's left).
