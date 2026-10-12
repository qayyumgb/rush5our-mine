/**
 * VIDEOS PAGE COPY — mockups/Videos/*.png
 *
 * Presentation lives in components/videos/*; this file holds only the
 * words and links of the page, so copy can be edited — or swapped for a
 * CMS fetch — without touching a component. Everything that is a video
 * (the five short series and their Reels, the Picking Up Girls long-form
 * videos, the featured player) lives in data/videos.ts, where the real
 * Cloudflare R2 / YouTube links drop in later.
 *
 * ARTWORK: each section's atmosphere (the red grunge, brushes, handwriting,
 * wordmarks, the posters) is lifted from its mockup — public/assets/images/
 * videos-*.webp — with the type filled in. Screen-resolution copies; when
 * the client supplies the source artwork, replace those files and nothing
 * else.
 */

import type { TitleRun } from "@/data/videos";

export type { TitleRun };

/* ------------------------------------------------------------------------ */
/* Section 1 — WATCH THE MOVEMENT. (mockups/Videos/1.png)                    */
/* ------------------------------------------------------------------------ */

export interface VideosHeroContent {
  eyebrow: string;
  /** Headline lines in order; `red` lines are set in the brand red. */
  title: { text: string; red?: boolean }[];
  sublines: string[];
  /** Points at the series list further down the page. */
  cta: { label: string; href: string };
}

export const videosHero: VideosHeroContent = {
  eyebrow: "Real people. Real moments.",
  title: [{ text: "Watch" }, { text: "the" }, { text: "Movement.", red: true }],
  sublines: ["Every video builds the culture.", "Every moment brings us closer."],
  cta: { label: "Browse all videos", href: "#series" },
};

/* ------------------------------------------------------------------------ */
/* Section 2 — VIDEO SERIES (mockups/Videos/2.png)                           */
/* The five series themselves are `shortSeries` in data/videos.ts.          */
/* ------------------------------------------------------------------------ */

export interface VideosSeriesContent {
  eyebrow: string;
  title: TitleRun[];
  /** The short stacked lines at the headline's right. */
  aside: string[];
  tagline: string;
  cta: string;
  closing: { eyebrow: string; title: TitleRun[] };
}

export const videosSeries: VideosSeriesContent = {
  eyebrow: "Explore our",
  title: [{ text: "Video " }, { text: "Series", red: true }],
  aside: ["Real", "people.", "Real moments.", "All right here."],
  tagline: "Different series. Same movement.",
  cta: "Watch series",
  closing: {
    eyebrow: "New videos every day.",
    title: [{ text: "Tap in & " }, { text: "Watch now", red: true }],
  },
};

/* ------------------------------------------------------------------------ */
/* Section 3 — WATCH RUSH 5OUR (mockups/Videos/3.png)                        */
/* The featured player and the episodes are `pickingUpGirls` in             */
/* data/videos.ts.                                                           */
/* ------------------------------------------------------------------------ */

export interface VideosWatchContent {
  eyebrow: string;
  title: TitleRun[];
  /** The handwritten "More than content." at the headline's right. */
  more: string;
  sub: string;
  cta: string;
  fullSeries: string;
  youtube: { label: string; href: string };
  tagline: string;
}

export const videosWatch: VideosWatchContent = {
  eyebrow: "Watch",
  title: [{ text: "Rush " }, { text: "5our", red: true }],
  more: "More than content.",
  sub: "Real people. Real moments. Watch the movement.",
  cta: "Watch this series",
  /** The pill over the featured player — the series' YouTube catalogue. */
  fullSeries: "View full series on YouTube",
  youtube: { label: "Browse all videos on YouTube", href: "https://www.youtube.com/@RUSH5OUR" },
  tagline: "New videos when it happens.",
};

/* ------------------------------------------------------------------------ */
/* Section 4 — THE COMMUNITY IS TALKING (mockups/Videos/4.png)               */
/* ------------------------------------------------------------------------ */

export interface CommunityPost {
  id: string;
  handle: string;
  /** Relative time, as the platform prints it. */
  when: string;
  /** The post, line by line as the mockup breaks it. */
  text: string[];
  /** Formatted counts. */
  likes: string;
  comments: string;
  shares: string;
  /** Portrait photo behind the post, and the poster's avatar. */
  photo: string;
  avatar: string;
  /** PLACEHOLDER — the post itself. `#` until the real posts are wired. */
  href: string;
}

export interface VideosTalkContent {
  eyebrow: string;
  title: string;
  sub: string;
  /** The handwritten note painted across the first post. */
  hand: string;
  /** The handwritten "JOIN THE CONVO". */
  join: string;
  handle: string;
  cta: { label: string; href: string };
  tagline: string;
  posts: CommunityPost[];
}

/**
 * PLACEHOLDER POSTS — the three the mockup shows are real to it; posts 4-6
 * re-use them so the six dots the mockup draws have something behind them.
 * Replace all six with real community posts (and their photos) when they
 * are chosen; see the implementation plan, section 2C.
 */
const TALK_POSTS: CommunityPost[] = [
  {
    id: "brooklynn",
    handle: "@brooklynn",
    when: "4h ago",
    text: ["RUSH 5OUR is taking", "over the city. I love it here.", "#RUSHHUNTS 🔥"],
    likes: "12.4K",
    comments: "342",
    shares: "286",
    photo: "/assets/images/videos-talk-photo-1.webp",
    avatar: "/assets/images/videos-talk-avatar-1.webp",
    href: "#",
  },
  {
    id: "lynmoves",
    handle: "@lynmoves",
    when: "2h ago",
    text: ["Found a sticker", "today 👀", "This movement", "is different.", "Y’all tap in ASAP."],
    likes: "8.1K",
    comments: "198",
    shares: "121",
    photo: "/assets/images/videos-talk-photo-2.webp",
    avatar: "/assets/images/videos-talk-avatar-2.webp",
    href: "#",
  },
  {
    id: "vibewithtre",
    handle: "@vibewithtre",
    when: "8h ago",
    text: ["The content.", "The energy.", "The community.", "This is bigger", "than YT. 🙌", "#RUSH5OUR"],
    likes: "9.7K",
    comments: "256",
    shares: "174",
    photo: "/assets/images/videos-talk-photo-3.webp",
    avatar: "/assets/images/videos-talk-avatar-3.webp",
    href: "#",
  },
];

export const videosTalk: VideosTalkContent = {
  eyebrow: "The community is",
  title: "Talking",
  sub: "Real people. Real support. Bigger than YouTube.",
  hand: "Real people. Real love.",
  join: "Join the convo",
  handle: "@rush5our",
  cta: { label: "Follow the movement", href: "/join" },
  tagline: "Different people. Same movement.",
  /* Ordered so the first post's neighbours are the two the mockup shows
     beside it (previous = @lynmoves, next = @vibewithtre). */
  posts: [TALK_POSTS[0], TALK_POSTS[2], ...TALK_POSTS.map((p) => ({ ...p, id: `${p.id}-2` })), TALK_POSTS[1]],
};

/* ------------------------------------------------------------------------ */
/* Section 5 — YOU'RE PART OF IT. (mockups/Videos/5.png)                     */
/* ------------------------------------------------------------------------ */

export interface VideosPartContent {
  mark: string;
  eyebrow: string;
  titleWhite: string;
  titleRed: string;
  /** Two short paragraphs; `red` runs are set in the brand red. */
  copy: TitleRun[][][];
  cta: { label: string; href: string };
}

export const videosPart: VideosPartContent = {
  mark: "RUSH5OUR.",
  eyebrow: "You’re not just watching.",
  titleWhite: "You’re",
  titleRed: "Part of it.",
  copy: [
    [[{ text: "Every view. Every like. Every share" }], [{ text: "builds the movement." }]],
    [
      [{ text: "Let’s keep " }, { text: "growing.", red: true }],
      [{ text: "Let’s keep " }, { text: "winning.", red: true }],
    ],
  ],
  cta: { label: "Join the movement", href: "/join" },
};

/* ------------------------------------------------------------------------ */
/* The vertical feed viewer (opened from a series card; not in the mockups) */
/* ------------------------------------------------------------------------ */

export const videosFeed = {
  close: "Close",
  mute: "Mute",
  unmute: "Unmute",
  play: "Play",
  pause: "Pause",
  previous: "Previous video",
  next: "Next video",
  viewSeries: "View full series",
  /** Shown over a poster whose video has no `src` yet. */
  comingSoon: "Video coming soon",
};

export default videosHero;
