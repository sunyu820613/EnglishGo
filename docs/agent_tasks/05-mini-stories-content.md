# Mini Stories — full content (all 9 letter groups)

Companion to [`05-mini-stories-port.md`](05-mini-stories-port.md). That task
doc originally treated "write the remaining 8 stories" as an out-of-scope
follow-up — it no longer is. All 9 groups (A–Z in groups of 3, last group of
2) are written below, same length/tone/structure as the existing `story_abc`.

**Consistency method:** each story is built from that letter group's own
*primary two example words* in [`src/data/alphabet.ts`](../../src/data/alphabet.ts)
(the first `words` entry, not the phonics-variant tables), the same way
`story_abc` weaves Cat/Car (C), Ball/Bear (B), Apple/Ant (A) into one scene.
Word source, extracted from `alphabet.ts` so nobody has to re-check it:

| Letters | Word 1 | Word 2 |
|---|---|---|
| A | apple | ant |
| B | ball | bear |
| C | cat | car |
| D | dog | duck |
| E | egg | elephant |
| F | fish | frog |
| G | goat | grapes |
| H | hat | horse |
| I | ice cream | iguana |
| J | juice | jellyfish |
| K | kite | koala |
| L | lion | leaf |
| M | moon | monkey |
| N | nest | nose |
| O | orange | owl |
| P | panda | pig |
| Q | queen | quail |
| R | rabbit | robot |
| S | sun | star |
| T | tiger | train |
| U | umbrella | unicorn |
| V | van | violin |
| W | whale | watch |
| X | xylophone | x-ray |
| Y | yak | yo-yo |
| Z | zebra | zoo |

**Tone constraints followed** (per `docs/REWARD_SYSTEM.md`'s "禁止清单" and
this project's general no-fear/no-failure rule, same as `story_abc`): no
conflict, no danger, no losing/failing, everyone is included when they ask
to join, ends warm/cheerful. Every story is 5 pages, present tense, short
sentences (reading level matches `story_abc`).

## ✅ Illustrations: all 45 generated, character-consistent

All 9 groups' images exist in `public/images/stories/`: `story_abc_1..5`
through `story_yz_1..5`, generated via Alibaba Cloud `wan2.7-image-pro`
(DashScope, see `docs/AGENT_HANDOFF.md`'s 2026-07-25 Phase 4 entry for the
licensing note: paid API, commercial use permitted, no IP guarantee from
the platform).

**Generation method — read this before regenerating anything:** the first
attempt called the API once per page independently
(`tool/imggen/generate_story_v2.js`, now superseded — kept only as a
reference of what *not* to do), and the model redrew each character from
scratch every time, so e.g. `story_abc`'s cat/bear/ant looked visibly
different in the page-4/5 group shots than in their page-1/2/3 solo shots.

The fix, and the one actually used for the current images: `wan2.7-image-pro`
supports a **sequential-set mode** (`enable_sequential: true` in
`parameters`) that generates all N pages of one story in a *single* API
call from one combined narrative prompt ("First image: ... Second image:
... " etc., with explicit "the same X" callbacks on every recurring
character) — the model sees the whole set together and keeps character
design consistent across pages. Script:
`tool/imggen/generate_story_sequential.cjs` (takes optional story-id args to
regenerate a subset, e.g. `node generate_story_sequential.cjs story_abc`).
Its `STORIES` object holds the combined per-story prompt actually sent —
that's the source of truth now, not the terser per-page briefs below (kept
only as content-authoring documentation of what each page depicts).

Contact sheets to re-check visually: `tool/imggen/preview/contact_sheet_stories_v2.png`
(def/ghi/jkl/mno/pqr/stu/vwx/yz) and
`tool/imggen/preview/contact_sheet_stories_consistent_batch1.png`
(abc/def/ghi/jkl). Not committed anywhere in `assets/manifests/` — this app
doesn't have that Flutter-side manifest system (see `05-mini-stories-port.md`
§3).

## 🎬 `story_abc` also has a narrated video

`public/videos/stories/story_abc.mp4` — 15s, 1280×720, h264+aac, ~3.6MB. The
same 5 `story_abc` illustrations animated into one continuous clip via a
separate pipeline at the repo root, `seedance_story/` (ByteDance Seedance
2.0 image-to-video, Volcengine Ark API — a different vendor from the
DashScope illustration pipeline; needs its own `ARK_API_KEY`/
`VOLCENGINE_ARK_API_KEY`, see `seedance_story/generate_story.py`), with
synthesized narration audio and burned-in subtitles for the same 5 lines of
page text (timing in `seedance_story/output/story_en.ass`).

This is a per-story opt-in (`MiniStory.video?: string`, see
`05-mini-stories-port.md` §5 step 1) — only `story_abc` has one. The other 8
stories still use the page-by-page image+text reader; nothing about them
changes. Producing videos for the rest is explicitly **not** in scope here
(see `05-mini-stories-port.md` §7's non-goals) — `seedance_story/` exists
and works if that's wanted later, but that's a separate, deliberately-sized
follow-up (8 more paid video-gen calls + narration + subtitle timing per
story), not a rerun of a batch script the way the illustrations were.

---

## story_def — "Friends by the Pond" (D, E, F)

| Page | Text | Image file | Illustration brief |
|---|---|---|---|
| 1 | Dog sees a fluffy duck by the pond. | `story_def_1.webp` | A friendly cartoon dog on a grassy pond bank, looking at a small fluffy duckling in the water. Soft daylight, storybook style matching story_abc. |
| 2 | Elephant carries a big egg to the picnic. | `story_def_2.webp` | A cheerful elephant carrying a large speckled egg (basket-style, not literal weight), walking toward a picnic blanket. |
| 3 | "Can I hop along?" says Frog, holding a shiny fish. | `story_def_3.webp` | A small green frog mid-hop, holding a shiny cartoon fish, smiling toward the dog and elephant. |
| 4 | Dog, Elephant, and Frog share their picnic by the pond. | `story_def_4.webp` | All three animals sitting together on a picnic blanket by the pond, food spread out, all smiling. |
| 5 | The duck quacks, the egg hatches, and everyone cheers. "What a happy day!" | `story_def_5.webp` | The duckling, a newly hatched chick from the egg, and all three animals celebrating together, sunny sky. |

```json
{
  "id": "story_def",
  "title": "Friends by the Pond",
  "requiredLetters": ["D", "E", "F"],
  "pages": [
    { "text": "Dog sees a fluffy duck by the pond.", "image": "story_def_1.webp" },
    { "text": "Elephant carries a big egg to the picnic.", "image": "story_def_2.webp" },
    { "text": "\"Can I hop along?\" says Frog, holding a shiny fish.", "image": "story_def_3.webp" },
    { "text": "Dog, Elephant, and Frog share their picnic by the pond.", "image": "story_def_4.webp" },
    { "text": "The duck quacks, the egg hatches, and everyone cheers. \"What a happy day!\"", "image": "story_def_5.webp" }
  ]
}
```

## story_ghi — "A Snack in the Sun" (G, H, I)

| Page | Text | Image file | Illustration brief |
|---|---|---|---|
| 1 | Goat munches sweet grapes in the garden. | `story_ghi_1.webp` | A cartoon goat happily eating a bunch of purple grapes in a sunny garden. |
| 2 | Horse wears a big straw hat and trots by. | `story_ghi_2.webp` | A friendly horse wearing an oversized straw sunhat, trotting along a garden path. |
| 3 | "Can I join you?" says Iguana, licking an ice cream cone. | `story_ghi_3.webp` | A colorful iguana holding an ice cream cone, smiling at the goat and horse. |
| 4 | Goat, Horse, and Iguana share a snack together. | `story_ghi_4.webp` | The three animals sitting together on a garden bench/blanket, sharing grapes and ice cream. |
| 5 | They laugh under the warm sun. "Yummy day!" they say. | `story_ghi_5.webp` | Wide happy shot of all three animals laughing together under a bright sun, garden in background. |

```json
{
  "id": "story_ghi",
  "title": "A Snack in the Sun",
  "requiredLetters": ["G", "H", "I"],
  "pages": [
    { "text": "Goat munches sweet grapes in the garden.", "image": "story_ghi_1.webp" },
    { "text": "Horse wears a big straw hat and trots by.", "image": "story_ghi_2.webp" },
    { "text": "\"Can I join you?\" says Iguana, licking an ice cream cone.", "image": "story_ghi_3.webp" },
    { "text": "Goat, Horse, and Iguana share a snack together.", "image": "story_ghi_4.webp" },
    { "text": "They laugh under the warm sun. \"Yummy day!\" they say.", "image": "story_ghi_5.webp" }
  ]
}
```

## story_jkl — "Up in the Breeze" (J, K, L)

| Page | Text | Image file | Illustration brief |
|---|---|---|---|
| 1 | Jellyfish floats and sips a cup of juice. | `story_jkl_1.webp` | A whimsical friendly jellyfish (floating in the air like a balloon, not underwater — matches this app's playful non-literal style) holding a small juice cup with a straw. |
| 2 | Koala flies a red kite in the wind. | `story_jkl_2.webp` | A koala on a grassy hill flying a bright red kite against a breezy blue sky. |
| 3 | "Can I play too?" says Lion, catching a falling leaf. | `story_jkl_3.webp` | A friendly, non-scary young lion reaching up to catch a single falling autumn leaf, smiling. |
| 4 | Jellyfish, Koala, and Lion play in the breezy park. | `story_jkl_4.webp` | All three together in a park scene, kite in the air, leaves floating, jellyfish drifting nearby. |
| 5 | The kite dances, the leaf twirls. "What a fun day!" they cheer. | `story_jkl_5.webp` | Joyful wide shot: kite mid-air, leaf twirling, all three characters cheering with arms/limbs up. |

```json
{
  "id": "story_jkl",
  "title": "Up in the Breeze",
  "requiredLetters": ["J", "K", "L"],
  "pages": [
    { "text": "Jellyfish floats and sips a cup of juice.", "image": "story_jkl_1.webp" },
    { "text": "Koala flies a red kite in the wind.", "image": "story_jkl_2.webp" },
    { "text": "\"Can I play too?\" says Lion, catching a falling leaf.", "image": "story_jkl_3.webp" },
    { "text": "Jellyfish, Koala, and Lion play in the breezy park.", "image": "story_jkl_4.webp" },
    { "text": "The kite dances, the leaf twirls. \"What a fun day!\" they cheer.", "image": "story_jkl_5.webp" }
  ]
}
```

## story_mno — "Under the Moon" (M, N, O)

| Page | Text | Image file | Illustration brief |
|---|---|---|---|
| 1 | Monkey swings and holds a juicy orange. | `story_mno_1.webp` | A cheerful monkey swinging from a branch, holding a bright orange in one hand. |
| 2 | Owl blinks and peeks out of a cozy nest. | `story_mno_2.webp` | A round, friendly owl peeking out of a twig nest in a tree at dusk. |
| 3 | "Look at the moon!" says Monkey, wiggling his nose. | `story_mno_3.webp` | Monkey pointing up at a big soft moon, scrunching his nose playfully. |
| 4 | Monkey and Owl watch the moon rise together. | `story_mno_4.webp` | Monkey on a branch and Owl by her nest, both looking up at the rising moon, twilight sky. |
| 5 | They share the orange and say goodnight. "Sweet dreams!" | `story_mno_5.webp` | Cozy nighttime scene: the two friends sharing orange slices under a starry sky, sleepy and warm. |

```json
{
  "id": "story_mno",
  "title": "Under the Moon",
  "requiredLetters": ["M", "N", "O"],
  "pages": [
    { "text": "Monkey swings and holds a juicy orange.", "image": "story_mno_1.webp" },
    { "text": "Owl blinks and peeks out of a cozy nest.", "image": "story_mno_2.webp" },
    { "text": "\"Look at the moon!\" says Monkey, wiggling his nose.", "image": "story_mno_3.webp" },
    { "text": "Monkey and Owl watch the moon rise together.", "image": "story_mno_4.webp" },
    { "text": "They share the orange and say goodnight. \"Sweet dreams!\"", "image": "story_mno_5.webp" }
  ]
}
```

## story_pqr — "A Garden Tea Party" (P, Q, R)

| Page | Text | Image file | Illustration brief |
|---|---|---|---|
| 1 | Panda waters flowers next to a pink pig. | `story_pqr_1.webp` | A panda with a small watering can tending flowers, a friendly pink pig standing beside her in a garden. |
| 2 | "Come to my garden," says the Queen, feeding her quail. | `story_pqr_2.webp` | A gentle, child-friendly storybook queen (simple crown, warm smile, no formal/political imagery) feeding a small quail in the same garden. |
| 3 | Rabbit hops in, pushing a little toy robot. | `story_pqr_3.webp` | A rabbit hopping into the garden scene, pushing a small friendly cartoon toy robot on wheels. |
| 4 | Panda, Quail, and Rabbit help the Queen pick flowers. | `story_pqr_4.webp` | All four (Panda, Quail, Rabbit, Queen) picking flowers together in the garden. |
| 5 | Pig and Robot join the fun. "Best tea party ever!" they cheer. | `story_pqr_5.webp` | Wide happy group shot: Panda, Pig, Queen, Quail, Rabbit, and the toy Robot around a small tea party setup, everyone cheering. |

```json
{
  "id": "story_pqr",
  "title": "A Garden Tea Party",
  "requiredLetters": ["P", "Q", "R"],
  "pages": [
    { "text": "Panda waters flowers next to a pink pig.", "image": "story_pqr_1.webp" },
    { "text": "\"Come to my garden,\" says the Queen, feeding her quail.", "image": "story_pqr_2.webp" },
    { "text": "Rabbit hops in, pushing a little toy robot.", "image": "story_pqr_3.webp" },
    { "text": "Panda, Quail, and Rabbit help the Queen pick flowers.", "image": "story_pqr_4.webp" },
    { "text": "Pig and Robot join the fun. \"Best tea party ever!\" they cheer.", "image": "story_pqr_5.webp" }
  ]
}
```

## story_stu — "A Ride to the Stars" (S, T, U)

| Page | Text | Image file | Illustration brief |
|---|---|---|---|
| 1 | Tiger hops on a fast toy train. | `story_stu_1.webp` | A friendly cartoon tiger cub hopping aboard a colorful toy train. |
| 2 | Unicorn holds a rainbow umbrella in the rain. | `story_stu_2.webp` | A pastel unicorn holding a rainbow-colored umbrella, light rain, cheerful (not gloomy) mood. |
| 3 | "Look, the sun is out again!" says Tiger, waving to a bright star. | `story_stu_3.webp` | Tiger pointing up at both a bright sun and a twinkling star visible together (storybook logic, not literal), umbrella closing. |
| 4 | Tiger and Unicorn ride the train past sunny fields. | `story_stu_4.webp` | The train (with Tiger and Unicorn aboard) passing through bright sunny green fields. |
| 5 | At night, they wish on a twinkling star. "Sweet dreams!" | `story_stu_5.webp` | Nighttime scene: Tiger and Unicorn looking up at one big twinkling star from the train window, cozy and calm. |

```json
{
  "id": "story_stu",
  "title": "A Ride to the Stars",
  "requiredLetters": ["S", "T", "U"],
  "pages": [
    { "text": "Tiger hops on a fast toy train.", "image": "story_stu_1.webp" },
    { "text": "Unicorn holds a rainbow umbrella in the rain.", "image": "story_stu_2.webp" },
    { "text": "\"Look, the sun is out again!\" says Tiger, waving to a bright star.", "image": "story_stu_3.webp" },
    { "text": "Tiger and Unicorn ride the train past sunny fields.", "image": "story_stu_4.webp" },
    { "text": "At night, they wish on a twinkling star. \"Sweet dreams!\"", "image": "story_stu_5.webp" }
  ]
}
```

## story_vwx — "The Toy Box at Midnight" (V, W, X)

V/W/X's own words (van, violin, whale, watch, xylophone, x-ray) don't map
cleanly onto 3 storybook-animal characters the way other groups do, so this
one uses the "toys come alive at night" trope instead (a common, gentle
children's-book device — no new vocabulary invented, every word above is
still a literal toy in the scene).

| Page | Text | Image file | Illustration brief |
|---|---|---|---|
| 1 | In the toy box, a red van and a small violin sleep side by side. | `story_vwx_1.webp` | Inside a wooden toy box: a small red toy van and a miniature violin resting together, soft nightlight glow. |
| 2 | Whale the stuffie yawns and checks his toy watch. Midnight! | `story_vwx_2.webp` | A plush stuffed whale toy, sleepy-eyed, looking at a small toy wristwatch showing 12:00. |
| 3 | The xylophone chimes, and a glowing X-ray toy blinks like a nightlight. | `story_vwx_3.webp` | A colorful toy xylophone with a couple of notes visually "chiming" (small musical-note sparkles), next to a friendly glowing toy shaped like an X-ray/bone pattern used purely as a fun nightlight shape, not medical/clinical in tone. |
| 4 | All the toys wake up and dance around the room. | `story_vwx_4.webp` | The van, violin, plush whale, xylophone, and glowing X-ray toy all "dancing"/bouncing playfully around a child's bedroom floor, moonlight through the window. |
| 5 | When morning comes, they hop back into the toy box. "See you tonight!" they whisper. | `story_vwx_5.webp` | Morning light through the window; all the toys settling back into the toy box, peaceful. |

```json
{
  "id": "story_vwx",
  "title": "The Toy Box at Midnight",
  "requiredLetters": ["V", "W", "X"],
  "pages": [
    { "text": "In the toy box, a red van and a small violin sleep side by side.", "image": "story_vwx_1.webp" },
    { "text": "Whale the stuffie yawns and checks his toy watch. Midnight!", "image": "story_vwx_2.webp" },
    { "text": "The xylophone chimes, and a glowing X-ray toy blinks like a nightlight.", "image": "story_vwx_3.webp" },
    { "text": "All the toys wake up and dance around the room.", "image": "story_vwx_4.webp" },
    { "text": "When morning comes, they hop back into the toy box. \"See you tonight!\" they whisper.", "image": "story_vwx_5.webp" }
  ]
}
```

## story_yz — "A Day at the Zoo" (Y, Z)

Only 2 letters (last group, 26 = 8×3 + 2), same 5-page length as the rest.

| Page | Text | Image file | Illustration brief |
|---|---|---|---|
| 1 | At the zoo, Yak swings a bright yo-yo up and down. | `story_yz_1.webp` | A shaggy, friendly yak at a zoo enclosure playing with a bright yo-yo. |
| 2 | Zebra trots over. "Can I try?" she asks. | `story_yz_2.webp` | A zebra trotting up to the yak, looking curious and friendly, pointing at the yo-yo. |
| 3 | Yak and Zebra take turns with the yo-yo all afternoon. | `story_yz_3.webp` | Yak and Zebra taking turns playing with the yo-yo together, both smiling. |
| 4 | Visitors clap and cheer for the striped, furry friends. | `story_yz_4.webp` | A few cheerful cartoon zoo-visitor children (simple, generic, non-specific) clapping and watching from behind a low fence. |
| 5 | "Best day at the zoo!" says Yak, as the sun sets. | `story_yz_5.webp` | Yak and Zebra together at sunset, zoo in the background, warm golden light. |

```json
{
  "id": "story_yz",
  "title": "A Day at the Zoo",
  "requiredLetters": ["Y", "Z"],
  "pages": [
    { "text": "At the zoo, Yak swings a bright yo-yo up and down.", "image": "story_yz_1.webp" },
    { "text": "Zebra trots over. \"Can I try?\" she asks.", "image": "story_yz_2.webp" },
    { "text": "Yak and Zebra take turns with the yo-yo all afternoon.", "image": "story_yz_3.webp" },
    { "text": "Visitors clap and cheer for the striped, furry friends.", "image": "story_yz_4.webp" },
    { "text": "\"Best day at the zoo!\" says Yak, as the sun sets.", "image": "story_yz_5.webp" }
  ]
}
```

---

## Ready-to-paste `src/data/stories.ts` content

All 9 entries (including the pre-existing `story_abc`) in the shape
`05-mini-stories-port.md` §5 step 2 asks for. This is the complete array —
the implementing agent can paste this directly instead of retyping from the
tables above.

```ts
import type { MiniStory } from './stories.types';

export const stories: MiniStory[] = [
  {
    id: 'story_abc',
    title: 'A Sunny Day',
    requiredLetters: ['A', 'B', 'C'],
    video: 'story_abc.mp4',
    pages: [
      { text: 'Cat has a red ball.', image: 'story_abc_1.webp' },
      { text: 'Bear has a big apple.', image: 'story_abc_2.webp' },
      { text: '"Can I play too?" says Ant.', image: 'story_abc_3.webp' },
      { text: 'Cat, Bear, and Ant play together all day.', image: 'story_abc_4.webp' },
      { text: 'Then they ride home in the car. "That was fun!"', image: 'story_abc_5.webp' },
    ],
  },
  {
    id: 'story_def',
    title: 'Friends by the Pond',
    requiredLetters: ['D', 'E', 'F'],
    pages: [
      { text: 'Dog sees a fluffy duck by the pond.', image: 'story_def_1.webp' },
      { text: 'Elephant carries a big egg to the picnic.', image: 'story_def_2.webp' },
      { text: '"Can I hop along?" says Frog, holding a shiny fish.', image: 'story_def_3.webp' },
      { text: 'Dog, Elephant, and Frog share their picnic by the pond.', image: 'story_def_4.webp' },
      { text: 'The duck quacks, the egg hatches, and everyone cheers. "What a happy day!"', image: 'story_def_5.webp' },
    ],
  },
  {
    id: 'story_ghi',
    title: 'A Snack in the Sun',
    requiredLetters: ['G', 'H', 'I'],
    pages: [
      { text: 'Goat munches sweet grapes in the garden.', image: 'story_ghi_1.webp' },
      { text: 'Horse wears a big straw hat and trots by.', image: 'story_ghi_2.webp' },
      { text: '"Can I join you?" says Iguana, licking an ice cream cone.', image: 'story_ghi_3.webp' },
      { text: 'Goat, Horse, and Iguana share a snack together.', image: 'story_ghi_4.webp' },
      { text: 'They laugh under the warm sun. "Yummy day!" they say.', image: 'story_ghi_5.webp' },
    ],
  },
  {
    id: 'story_jkl',
    title: 'Up in the Breeze',
    requiredLetters: ['J', 'K', 'L'],
    pages: [
      { text: 'Jellyfish floats and sips a cup of juice.', image: 'story_jkl_1.webp' },
      { text: 'Koala flies a red kite in the wind.', image: 'story_jkl_2.webp' },
      { text: '"Can I play too?" says Lion, catching a falling leaf.', image: 'story_jkl_3.webp' },
      { text: 'Jellyfish, Koala, and Lion play in the breezy park.', image: 'story_jkl_4.webp' },
      { text: 'The kite dances, the leaf twirls. "What a fun day!" they cheer.', image: 'story_jkl_5.webp' },
    ],
  },
  {
    id: 'story_mno',
    title: 'Under the Moon',
    requiredLetters: ['M', 'N', 'O'],
    pages: [
      { text: 'Monkey swings and holds a juicy orange.', image: 'story_mno_1.webp' },
      { text: 'Owl blinks and peeks out of a cozy nest.', image: 'story_mno_2.webp' },
      { text: '"Look at the moon!" says Monkey, wiggling his nose.', image: 'story_mno_3.webp' },
      { text: 'Monkey and Owl watch the moon rise together.', image: 'story_mno_4.webp' },
      { text: 'They share the orange and say goodnight. "Sweet dreams!"', image: 'story_mno_5.webp' },
    ],
  },
  {
    id: 'story_pqr',
    title: 'A Garden Tea Party',
    requiredLetters: ['P', 'Q', 'R'],
    pages: [
      { text: 'Panda waters flowers next to a pink pig.', image: 'story_pqr_1.webp' },
      { text: '"Come to my garden," says the Queen, feeding her quail.', image: 'story_pqr_2.webp' },
      { text: 'Rabbit hops in, pushing a little toy robot.', image: 'story_pqr_3.webp' },
      { text: 'Panda, Quail, and Rabbit help the Queen pick flowers.', image: 'story_pqr_4.webp' },
      { text: 'Pig and Robot join the fun. "Best tea party ever!" they cheer.', image: 'story_pqr_5.webp' },
    ],
  },
  {
    id: 'story_stu',
    title: 'A Ride to the Stars',
    requiredLetters: ['S', 'T', 'U'],
    pages: [
      { text: 'Tiger hops on a fast toy train.', image: 'story_stu_1.webp' },
      { text: 'Unicorn holds a rainbow umbrella in the rain.', image: 'story_stu_2.webp' },
      { text: '"Look, the sun is out again!" says Tiger, waving to a bright star.', image: 'story_stu_3.webp' },
      { text: 'Tiger and Unicorn ride the train past sunny fields.', image: 'story_stu_4.webp' },
      { text: 'At night, they wish on a twinkling star. "Sweet dreams!"', image: 'story_stu_5.webp' },
    ],
  },
  {
    id: 'story_vwx',
    title: 'The Toy Box at Midnight',
    requiredLetters: ['V', 'W', 'X'],
    pages: [
      { text: 'In the toy box, a red van and a small violin sleep side by side.', image: 'story_vwx_1.webp' },
      { text: 'Whale the stuffie yawns and checks his toy watch. Midnight!', image: 'story_vwx_2.webp' },
      { text: 'The xylophone chimes, and a glowing X-ray toy blinks like a nightlight.', image: 'story_vwx_3.webp' },
      { text: 'All the toys wake up and dance around the room.', image: 'story_vwx_4.webp' },
      { text: 'When morning comes, they hop back into the toy box. "See you tonight!" they whisper.', image: 'story_vwx_5.webp' },
    ],
  },
  {
    id: 'story_yz',
    title: 'A Day at the Zoo',
    requiredLetters: ['Y', 'Z'],
    pages: [
      { text: 'At the zoo, Yak swings a bright yo-yo up and down.', image: 'story_yz_1.webp' },
      { text: 'Zebra trots over. "Can I try?" she asks.', image: 'story_yz_2.webp' },
      { text: 'Yak and Zebra take turns with the yo-yo all afternoon.', image: 'story_yz_3.webp' },
      { text: 'Visitors clap and cheer for the striped, furry friends.', image: 'story_yz_4.webp' },
      { text: '"Best day at the zoo!" says Yak, as the sun sets.', image: 'story_yz_5.webp' },
    ],
  },
];
```
