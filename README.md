# RUSH 5OUR — Homepage

Production build of the RUSH 5OUR homepage: six sections reproduced from the
client mockups in `../mockups-homepage/`, with a GSAP motion system layered on
top.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
GSAP 3 + ScrollTrigger · Lenis · CSS Modules

---

## Quick start

```bash
npm install        # install dependencies
npm run dev        # dev server → http://localhost:3000
npm run build      # production build
npm start          # serve the production build locally
npm run lint       # ESLint + React Compiler checks
npx tsc --noEmit   # type-check only
```

Node 20.19+ (or 22.13+) is recommended. The project was built and verified on
Node 22.

---

## Deploying to Vercel

The project is zero-config on Vercel — no `vercel.json`, no environment
variables are needed for the current build.

```bash
npm i -g vercel    # once
vercel             # preview deployment
vercel --prod      # production deployment
```

Or connect the Git repository at [vercel.com/new](https://vercel.com/new) and
accept the detected defaults:

| Setting          | Value           |
| ---------------- | --------------- |
| Framework        | Next.js         |
| Build command    | `next build`    |
| Output directory | (default)       |
| Install command  | `npm install`   |

Any other Node host works too: `npm run build && npm start`.

---

## Project structure

```
app/
  layout.tsx          Root layout, metadata, the pre-paint motion gate
  page.tsx            Composes the six homepage sections
  fonts.ts            next/font/local setup + metric overrides  ← FONT SWAP
  globals.css         Design tokens, reset, shared typography primitives

components/
  home/               One component + stylesheet per mockup section
    HeroSection.*         1 — hero
    ConceptSection.*      2 — what is RUSH 5OUR
    VideosSection.*       3 — featured videos
    MerchSection.*        4 — merch + locked drops
    CultureSection.*      5 — this is a culture
    FaqSection.*          6 — FAQ + footer
  ui/                 Shared, prop-driven pieces
    Nav, Logo, RedButton, Eyebrow, HandAccent, ScrollCue, IconRing,
    Icon, SocialIcon, Preloader, Cursor, VideoPlayer, ContactForm
  motion/
    MotionProvider.tsx  Lenis, GSAP registration, reduced-motion, ready state

data/                 All copy and lists — the backend seam
  site, hero, concept, videos, merch, culture, faq

lib/
  theme.ts            Brand tokens in TypeScript (mirrors globals.css)
  motion/
    gsap.ts             Plugin registration + brand eases
    split.ts            Text splitting and the scramble/decode effect
    helpers.ts          Shared timeline building blocks
    useCarousel.ts      Carousel behaviour (index, autoplay, swipe)
    useMediaQuery.ts    Reduced-motion / pointer hooks
    intro.ts            Preloader → hero handoff

public/assets/
  fonts/              Anton, Oswald, Inter, Sedgwick Ave (.woff2)
  images/             Hero, merch, drop and video thumbnails
```

Each section is self-contained: its own component, stylesheet and data file.
Sections can be reviewed, reordered or replaced without touching each other.

---

## How the mockups became responsive CSS

The mockups are phone frames — the hero is **882 × 1536**, sections 2–6 are
**950** wide. Rather than eyeballing sizes, every measurement in the section
stylesheets is the literal pixel value read off the mockup, multiplied by a
unit that scales one mockup pixel to the viewport:

```css
--u:  calc(min(100vw, 1040px) / 950);  /* sections 2–6 */
--hu: calc(100vw / 882);               /* hero          */
--nu: calc(min(100vw, 560px) / 882);   /* nav           */
```

So `height: calc(527 * var(--u))` is "527px on the mockup". The composition
stays proportionally identical at any width, and on large screens the units
stop growing so the page becomes a centred column.

Two supporting pieces make that exact:

- **`.cz` (cap-height trim)** in `globals.css` cancels the browser's built-in
  leading using each font's own metrics, so the box starts at the cap top and
  ends at the last baseline. That is why a `margin-top: calc(27 * var(--u))`
  really is the 27px measured between two baselines on the mockup.
- **Font metric overrides** in `app/fonts.ts` pin ascent/descent so `.cz` gives
  the same result on every OS.

Sections 5 and 6 were measured directly from `5.png` and `6.png` by sampling
pixel extents; the values in their stylesheets come from those measurements.

---

## Swapping in real assets

Everything currently in place is either a client asset or a clearly-marked
placeholder. Nothing requires a code change beyond a path.

### Fonts

Current: **Anton** (display), **Oswald** (buttons/tabs), **Inter** (body),
**Sedgwick Ave** (handwritten). All are licensed OFL and self-hosted.

To use the client's licensed fonts:

1. Drop the `.woff2` into `public/assets/fonts/`.
2. Change the `src` in `app/fonts.ts`.
3. Update that font's `ascent-override` / `descent-override` declarations to
   the new metrics, and the matching `--a` / `--d` / `--c` values in the
   `.f-display` / `.f-sans` / `.f-cond` blocks of `globals.css`.

Step 3 is what keeps the mockup spacing exact — see the `.cz` note above.

### Images

Replace the file in `public/assets/images/` or point the path in the relevant
data file somewhere else:

| Asset                | Data file        | Notes                                    |
| -------------------- | ---------------- | ---------------------------------------- |
| Hero photo           | `data/hero.ts`   | `tall` for phones, `wide` for desktop    |
| Product shots        | `data/merch.ts`  | Square-ish, centred, dark background     |
| Drop card images     | `data/merch.ts`  | Locked cards are blurred automatically   |
| Video thumbnails     | `data/videos.ts` | 16:9 preferred                           |
| Brand graphic (bar)  | `data/merch.ts`  | `bar.art`                                |

### Logo

The `R5` mark is currently recreated in CSS to match the mockup exactly. To use
a real file, replace the two spans inside `components/ui/Logo.tsx` with an
`<Image>` and delete the `.mark` rules from `Logo.module.css`.

### Video links

Set `videoUrl` on any entry in `data/videos.ts` (or `hero.storyVideo.videoUrl`)
to the plain share URL — the one the platform's "Copy link" button gives you.

| Platform | Example | Player |
| --- | --- | --- |
| TikTok | `https://www.tiktok.com/@rush5our/video/7680567561460731166` | portrait |
| YouTube | `https://youtu.be/ID` or `watch?v=ID` | landscape |
| YouTube Shorts | `https://www.youtube.com/shorts/ID` | portrait |
| Vimeo | `https://vimeo.com/123456789` | landscape |
| Direct file | `https://…/clip.mp4` | native `<video>` |

Parsing lives in `lib/video.ts`. Tracking parameters (`?is_from_webapp=…`,
`?si=…`) are ignored, so pasting the whole URL is fine. Vertical formats are
detected automatically and open in a portrait lightbox.

An empty string is safe — the player shows the thumbnail with a "coming soon"
note. So is an unrecognised URL: rather than failing silently in a `<video>`
tag, it falls back to the same poster state.

**Do not paste TikTok's `<blockquote>` embed snippet.** It loads TikTok's
`embed.js`, which swaps it for TikTok's own card — its chrome, caption and
author bar, none of it styleable, and it cannot sit inside our lightbox. The
share link renders the same video in our player.

**Thumbnails:** TikTok's oEmbed endpoint returns one —
`https://www.tiktok.com/oembed?url=<video url>` → `thumbnail_url`. Those URLs
are signed and expire, so download the image into `public/assets/images/`
rather than hotlinking it.

---

## Backend integration

Data is deliberately separate from presentation, and components are
prop-driven, so each of these is a small, local change.

| Seam              | Where                                    | What to do                                                                   |
| ----------------- | ---------------------------------------- | ---------------------------------------------------------------------------- |
| **Contact form**  | `components/ui/ContactForm.tsx`          | Replace the `submitContact` stub with a `fetch` to `app/api/contact/route.ts`; pending/success/error states already exist |
| **Video lists**   | `data/videos.ts` → `<VideosSection />`   | Fetch in a server component, pass `featured` / `videos` as props             |
| **Merch & drops** | `data/merch.ts` → `<MerchSection />`     | Pass `products` / `dropCards` as props                                       |
| **FAQ**           | `data/faq.ts` → `<FaqSection />`         | Pass `items` as props                                                        |
| **Hunt locations**| `data/site.ts`, `data/concept.ts`        | Add a `lib/api/` loader and pass results down                                |

The recommended pattern:

```tsx
// app/page.tsx (server component)
const videos = await getVideos();          // lib/api/videos.ts
<VideosSection videos={videos} />          // already accepts this prop
```

Sections fall back to the static data when no prop is given, so the swap can be
done one section at a time.

---

## The motion system

Animation is the part the client is judging, so it is built as a system rather
than as per-section one-offs.

**Where things live**

- `MotionProvider` owns the environment: GSAP registration, Lenis smooth
  scrolling driven from GSAP's ticker (one RAF loop, not two), in-page anchor
  handling, and a `ready` flag that waits for real fonts before any text is
  split.
- `lib/motion/helpers.ts` holds the shared building blocks — `headReveal`,
  `charsIn`, `writeHand`, `runTrace`, `tilt`, `magnetic`, `lift`. A headline
  reveals the same way in the hero as in the FAQ because it is the same
  function.
- Each section builds its own timelines inside a `gsap.context` scoped to its
  root, and reverts on unmount.

**Load sequence**

1. An inline script in `layout.tsx` adds `.motion` to `<html>` before first
   paint, which hides `[data-a]` elements so nothing flashes un-animated. A
   4-second failsafe removes it if the animation system never boots.
2. The preloader counts up, then wipes away in two panels.
3. Part-way through that wipe it opens the **intro gate** (`lib/motion/intro.ts`),
   so the hero's entrance is already running as the loader leaves — the load
   reads as one move, not two.
4. The hero timeline runs: background push-in, camera flash, masked headline
   characters rising, sub-copy lines lifting, CTA wipe, marker accents written
   on, scroll cue last.

**Continuous and scroll motion**

- Hero: the red glow breathes, the lamp flickers irregularly, smoke drifts,
  and on desktop the photo, glow and smoke shift against each other under the
  cursor with a red light trailing it.
- Scroll: background parallax and push-in, headline lines drifting apart, a
  black veil handing off to the next section, and accents moving at their own
  depths.
- Sections 2–6: scroll-triggered reveals, staggered card entrances, borders
  traced by a travelling light, icons that draw their own strokes, cards that
  lift and tilt toward the cursor.

**Performance** — every tween uses transform, opacity or clip-path only, so
nothing touches layout. `will-change` is set only on elements that actually
animate continuously.

**Reduced motion** — `prefers-reduced-motion: reduce` skips Lenis, the
preloader, the custom cursor and every decorative timeline; content is revealed
immediately and a CSS rule neutralises remaining animations and transitions.

---

## Accessibility notes

- The accordion uses real buttons with `aria-expanded` / `aria-controls`;
  collapsed panels are `inert`.
- Modals (video, contact) trap initial focus, close on `Escape` and on backdrop
  click, and restore focus to the trigger.
- Split headlines keep their readable text on an `aria-label`, with the visual
  lines hidden from assistive tech.
- Decorative layers — glows, smoke, grain, marker accents — are `aria-hidden`.
- The custom cursor only hides the native one once it has actually mounted, so
  a JS failure can never leave the page pointerless.
- Focus rings are visible brand red at a 4px offset.

---

## Hydration and browser extensions

`<html>` and `<body>` both carry `suppressHydrationWarning` in
`app/layout.tsx`, for two different reasons:

- **`<html>`** — the pre-paint motion gate adds `.motion` before React
  hydrates, so the server and client `className` legitimately differ.
- **`<body>`** — browser extensions stamp attributes onto it before React
  loads (ColorZilla's `cz-shortcut-listen`, Grammarly's `data-gr-*`, and
  others). Without this, anyone with such an extension sees a hydration
  error on every refresh.

Both are scoped to that one element's own attributes. Anything *inside*
`<body>` still hydrates strictly — verified by injecting an attribute onto a
child element and confirming React still reports it. Neither element renders
dynamic attributes of ours, so nothing real is being masked.

---

## Video metrics

**The view counts and durations on screen are mockup figures, not real data.**
This is a deliberate choice so the client demo matches the approved comp; they
are to be swapped in one pass before launch. All of them live in
`data/videos.ts` (`views` and `duration` on each entry).

Real counts cannot come from the oEmbed endpoint that supplies our thumbnails
— it returns no engagement fields whatsoever. They need TikTok's **Display
API**:

1. Create a TikTok developer app → client key + client secret
2. Have the **@rush5our account** authorize it once via OAuth, granting the
   `video.list` scope
3. Store the refresh token (an environment variable is enough to start)
4. Call `/v2/video/query/` server-side for `view_count`, `like_count`,
   `comment_count`, `share_count`, and cache with ISR (hourly is plenty) so
   TikTok is not called on every page view

`VideoItem.views` is already optional, so wiring this up changes the loader,
not the components.

> Scraping the public video page is **not** a supported route. The numbers are
> present in its embedded JSON, but it breaks TikTok's terms, the page ships
> captcha/verification machinery, and their bot protection blocks datacenter
> IPs — so it would fail from Vercel regardless. It is also unreliable: the
> stats blocks are not tied to the video id in a way that can be attributed
> confidently.

---

## Known placeholders

These are intentional and marked in the code:

- `videoUrl` is set only on "$5 or mystery gift"; the rest show a poster.
- `views` and `duration` on every video are mockup figures — see
  **Video metrics** above.
- Social, shop, "view all" and drop links point at `#`.
- Merch and drop imagery is cut from the client mockup.
- The fourth featured video reuses the hero photo (no thumbnail supplied).
- `submitContact` logs and resolves rather than sending.
