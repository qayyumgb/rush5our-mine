/**
 * VIDEOS — every video on the site, and the homepage section's copy.
 *
 * One list feeds both places: the Videos page (components/videos/*) shows
 * every series below, and the homepage's Featured Videos section
 * (components/home/VideosSection.tsx) shows the videos marked
 * `featured: true`, via `homeFeatured` at the end of this file. To change
 * what the homepage features, move the flag — nothing else.
 *
 * ▸ BACKEND SEAM — the series are plain arrays shaped like a typical video
 *   API response; a loader can replace them without touching a component.
 */

/* ------------------------------------------------------------------------ */
/* Homepage — section 3, "Featured videos" (mockup 3.png): the copy         */
/* ------------------------------------------------------------------------ */

export interface VideosContent {
  eyebrow: string;
  titleWhite: string;
  titleRed: string;
  subtitle: string;
  accent: { lines: string[] };
  /** The section's one CTA, to the full Videos page. */
  viewAll: { label: string; href: string };
}

export const videosContent: VideosContent = {
  eyebrow: "On the street",
  titleWhite: "Featured",
  titleRed: "Videos",
  subtitle: "Real people. Real moments. No scripts.",
  accent: { lines: ["Press", "play.", "See what", "we do."] },
  viewAll: { label: "View all videos", href: "/videos" },
};

/* =========================================================================
   VIDEOS PAGE — every series and every video the /videos page lists
   (mockups/Videos/2.png and 3.png). The page's copy lives in
   data/videos-page.ts; the components only read this file for anything
   that is a video, so the real media can be dropped in here without
   touching a component.

   ▸ WHERE THINGS STAND — READ BEFORE LAUNCH
     Every series streams from Cloudflare R2 (`R2_BASE`): the five short
     series as 720p H.264 ≤ 20 MB per clip, Picking Up Girls as 720p CRF 26
     (~230 MB per episode). D:/rush5our-videos/upload/manifest.txt maps each
     key to the client's original file. Each clip's poster is its frame at
     1 s, next to it in the bucket.

     Still PLACEHOLDER (marked inline): the series thumbnails (the mockup's
     composites, or the clip's own frame), `platformUrl` on the short series
     (`#`) and the Picking Up Girls playlist link, and the long-form cards'
     copy. To finish: real thumbnails and copy, the TikTok / Instagram /
     YouTube links — and swap `R2_BASE` for the bucket's custom domain.

     Nothing else changes: the components, the feed viewer and the player
     all read from here.
   ========================================================================= */

/** A run of headline text; `red` runs are set in the brand red. */
export interface TitleRun {
  text: string;
  red?: boolean;
}

/** Anything the feed viewer can play from a native <video>. */
export interface FeedVideo {
  id: string;
  /** Shown over the video, bottom left. */
  title: string;
  caption: string;
  /** Vertical (9:16) clips fill the stage; horizontal ones sit centred on a
      blurred fill of their poster, the whole picture visible. */
  orientation: "vertical" | "horizontal";
  /** Shown on the homepage's Featured Videos section (see `homeFeatured`
      and the category tabs, `videoCategories`). Flag a few per series: the
      first featured video of a category leads it on the homepage (a
      horizontal one first, if the category has one), the rest fill the
      swipeable row. */
  featured?: boolean;
  /** The homepage tab it shows under: one of `videoCategories`' ids. */
  category: VideoCategoryId;
  /** The homepage card's picture: 9:16 (1080 × 1920), or 16:9 (1920 × 1080)
      for a horizontal video. Empty = the clip's own frame (`poster`). */
  thumbnail: string;
  /** Runtime as printed on the card's chip, e.g. "1:34". */
  duration: string;
  /** The video file's URL (Cloudflare R2). Empty = not uploaded: the
      viewer shows the poster with a "coming soon" note. */
  src: string;
  /** The clip's frame at 1 s (9:16 or 16:9 to match), shown before the
      video loads. */
  poster: string;
}

/* ------------------------------------------------------------------------ */
/* Categories — the homepage Featured Videos tabs                            */
/* ------------------------------------------------------------------------ */

/** The tabs, in order. "All" shows every featured video; the others show
    the videos whose `category` matches. Relabel or reorder freely; a new
    category needs its id added here and on its videos. */
export const videoCategories = [
  { id: "all", label: "All" },
  { id: "picking-up-girls", label: "Picking Up Girls" },
  { id: "rush-hunts", label: "RUSH HUNTS" },
  { id: "five-or-mystery-gift", label: "$5 or 🎁" },
  { id: "bet-five", label: "Bet $5" },
  { id: "you-got-game", label: "You Got Game?" },
  { id: "rush-reacts", label: "RUSH REACTS" },
] as const;

export type VideoCategoryId = (typeof videoCategories)[number]["id"];

/** One vertical (9:16) video in a short series. */
export type ShortVideo = FeedVideo;

/** One of the five short vertical series. */
export interface ShortSeries {
  id: string;
  /** As the mockup prints it: "01".."05". */
  number: string;
  /** Title lines, each a run of white and red text. */
  title: TitleRun[][];
  description: string[];
  /** PLACEHOLDER — the series card's thumbnail (the mockup's composite). */
  thumbnail: string;
  thumbnailAlt: string;
  /** PLACEHOLDER — where "View full series" goes: the series' playlist on
      its platform (TikTok / Instagram). */
  platformUrl: string;
  videos: ShortVideo[];
}

/** The Cloudflare R2 bucket the short series stream from (public r2.dev
    URL for now — swap for the custom domain once it is attached; nothing
    else changes). */
export const R2_BASE = "https://pub-b67a50ad41d0439ea04e161a383ce295.r2.dev";

export const shortSeries: ShortSeries[] = [
  {
    id: "five-or-mystery-gift",
    number: "01",
    title: [[{ text: "$5 or" }], [{ text: "Mystery gift", red: true }]],
    description: ["Random people. Big reactions.", "Mystery gifts. Real moments."],
    thumbnail: "/assets/images/videos-series-thumb-1.webp", // PLACEHOLDER
    thumbnailAlt: "A man opening a red gift box — $5 or ?",
    platformUrl: "#", // PLACEHOLDER
    videos: [
      { id: "five-or-mystery-gift-01", featured: true, category: "five-or-mystery-gift", title: "Episode 01", caption: "", orientation: "vertical", duration: "1:17", src: `${R2_BASE}/five-or-mystery-gift/01.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/01.jpg`, thumbnail: "" },
      { id: "five-or-mystery-gift-02", featured: true, category: "five-or-mystery-gift", title: "Episode 02", caption: "", orientation: "vertical", duration: "1:50", src: `${R2_BASE}/five-or-mystery-gift/02.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/02.jpg`, thumbnail: "" },
      { id: "five-or-mystery-gift-03", featured: true, category: "five-or-mystery-gift", title: "Episode 03", caption: "", orientation: "vertical", duration: "0:54", src: `${R2_BASE}/five-or-mystery-gift/03.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/03.jpg`, thumbnail: "" },
      { id: "five-or-mystery-gift-04", featured: true, category: "five-or-mystery-gift", title: "Episode 04", caption: "", orientation: "vertical", duration: "1:57", src: `${R2_BASE}/five-or-mystery-gift/04.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/04.jpg`, thumbnail: "" },
      { id: "five-or-mystery-gift-05", category: "five-or-mystery-gift", title: "Episode 05", caption: "", orientation: "vertical", duration: "0:47", src: `${R2_BASE}/five-or-mystery-gift/05.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/05.jpg`, thumbnail: "" },
      { id: "five-or-mystery-gift-06", category: "five-or-mystery-gift", title: "Episode 06", caption: "", orientation: "vertical", duration: "1:32", src: `${R2_BASE}/five-or-mystery-gift/06.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/06.jpg`, thumbnail: "" },
      { id: "five-or-mystery-gift-07", category: "five-or-mystery-gift", title: "Episode 07", caption: "", orientation: "vertical", duration: "2:39", src: `${R2_BASE}/five-or-mystery-gift/07.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/07.jpg`, thumbnail: "" },
      { id: "five-or-mystery-gift-08", category: "five-or-mystery-gift", title: "Episode 08", caption: "", orientation: "vertical", duration: "1:16", src: `${R2_BASE}/five-or-mystery-gift/08.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/08.jpg`, thumbnail: "" },
      { id: "five-or-mystery-gift-09", category: "five-or-mystery-gift", title: "Episode 09", caption: "", orientation: "vertical", duration: "0:15", src: `${R2_BASE}/five-or-mystery-gift/09.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/09.jpg`, thumbnail: "" },
      { id: "five-or-mystery-gift-10", category: "five-or-mystery-gift", title: "Episode 10", caption: "", orientation: "vertical", duration: "0:33", src: `${R2_BASE}/five-or-mystery-gift/10.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/10.jpg`, thumbnail: "" },
      { id: "five-or-mystery-gift-11", category: "five-or-mystery-gift", title: "Episode 11", caption: "", orientation: "vertical", duration: "2:07", src: `${R2_BASE}/five-or-mystery-gift/11.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/11.jpg`, thumbnail: "" },
      { id: "five-or-mystery-gift-12", category: "five-or-mystery-gift", title: "Episode 12", caption: "", orientation: "vertical", duration: "2:09", src: `${R2_BASE}/five-or-mystery-gift/12.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/12.jpg`, thumbnail: "" },
      { id: "five-or-mystery-gift-13", category: "five-or-mystery-gift", title: "Episode 13", caption: "", orientation: "vertical", duration: "1:53", src: `${R2_BASE}/five-or-mystery-gift/13.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/13.jpg`, thumbnail: "" },
      { id: "five-or-mystery-gift-14", category: "five-or-mystery-gift", title: "Episode 14", caption: "", orientation: "vertical", duration: "2:15", src: `${R2_BASE}/five-or-mystery-gift/14.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/14.jpg`, thumbnail: "" },
      { id: "five-or-mystery-gift-15", category: "five-or-mystery-gift", title: "Episode 15", caption: "", orientation: "vertical", duration: "2:15", src: `${R2_BASE}/five-or-mystery-gift/15.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/15.jpg`, thumbnail: "" },
    ],
  },
  {
    id: "bet-five",
    number: "02",
    title: [[{ text: "Bet " }, { text: "$5", red: true }]],
    description: ["POV challenges. Confidence.", "Social experiments. Real bets."],
    thumbnail: "/assets/images/videos-series-thumb-2.webp", // PLACEHOLDER
    thumbnailAlt: "A woman laughing at her phone with dollar bills falling — Bet $5",
    platformUrl: "#", // PLACEHOLDER
    videos: [
      { id: "bet-five-01", featured: true, category: "bet-five", title: "Episode 01", caption: "", orientation: "vertical", duration: "1:35", src: `${R2_BASE}/bet-five/01.mp4`, poster: `${R2_BASE}/bet-five/01.jpg`, thumbnail: "" },
      { id: "bet-five-02", featured: true, category: "bet-five", title: "Episode 02", caption: "", orientation: "vertical", duration: "1:08", src: `${R2_BASE}/bet-five/02.mp4`, poster: `${R2_BASE}/bet-five/02.jpg`, thumbnail: "" },
      { id: "bet-five-03", featured: true, category: "bet-five", title: "Episode 03", caption: "", orientation: "vertical", duration: "1:15", src: `${R2_BASE}/bet-five/03.mp4`, poster: `${R2_BASE}/bet-five/03.jpg`, thumbnail: "" },
      { id: "bet-five-04", featured: true, category: "bet-five", title: "Episode 04", caption: "", orientation: "vertical", duration: "1:11", src: `${R2_BASE}/bet-five/04.mp4`, poster: `${R2_BASE}/bet-five/04.jpg`, thumbnail: "" },
      { id: "bet-five-05", category: "bet-five", title: "Episode 05", caption: "", orientation: "vertical", duration: "2:24", src: `${R2_BASE}/bet-five/05.mp4`, poster: `${R2_BASE}/bet-five/05.jpg`, thumbnail: "" },
      { id: "bet-five-06", category: "bet-five", title: "Episode 06", caption: "", orientation: "vertical", duration: "1:14", src: `${R2_BASE}/bet-five/06.mp4`, poster: `${R2_BASE}/bet-five/06.jpg`, thumbnail: "" },
      { id: "bet-five-07", category: "bet-five", title: "Episode 07", caption: "", orientation: "vertical", duration: "2:38", src: `${R2_BASE}/bet-five/07.mp4`, poster: `${R2_BASE}/bet-five/07.jpg`, thumbnail: "" },
      { id: "bet-five-08", category: "bet-five", title: "Episode 08", caption: "", orientation: "vertical", duration: "1:31", src: `${R2_BASE}/bet-five/08.mp4`, poster: `${R2_BASE}/bet-five/08.jpg`, thumbnail: "" },
      { id: "bet-five-09", category: "bet-five", title: "Episode 09", caption: "", orientation: "vertical", duration: "0:58", src: `${R2_BASE}/bet-five/09.mp4`, poster: `${R2_BASE}/bet-five/09.jpg`, thumbnail: "" },
      { id: "bet-five-10", category: "bet-five", title: "Episode 10", caption: "", orientation: "vertical", duration: "1:44", src: `${R2_BASE}/bet-five/10.mp4`, poster: `${R2_BASE}/bet-five/10.jpg`, thumbnail: "" },
      { id: "bet-five-11", category: "bet-five", title: "Episode 11", caption: "", orientation: "vertical", duration: "1:06", src: `${R2_BASE}/bet-five/11.mp4`, poster: `${R2_BASE}/bet-five/11.jpg`, thumbnail: "" },
      { id: "bet-five-12", category: "bet-five", title: "Episode 12", caption: "", orientation: "vertical", duration: "0:53", src: `${R2_BASE}/bet-five/12.mp4`, poster: `${R2_BASE}/bet-five/12.jpg`, thumbnail: "" },
      { id: "bet-five-13", category: "bet-five", title: "Episode 13", caption: "", orientation: "vertical", duration: "1:29", src: `${R2_BASE}/bet-five/13.mp4`, poster: `${R2_BASE}/bet-five/13.jpg`, thumbnail: "" },
      { id: "bet-five-14", category: "bet-five", title: "Episode 14", caption: "", orientation: "vertical", duration: "1:25", src: `${R2_BASE}/bet-five/14.mp4`, poster: `${R2_BASE}/bet-five/14.jpg`, thumbnail: "" },
      { id: "bet-five-15", category: "bet-five", title: "Episode 15", caption: "", orientation: "vertical", duration: "1:24", src: `${R2_BASE}/bet-five/15.mp4`, poster: `${R2_BASE}/bet-five/15.jpg`, thumbnail: "" },
    ],
  },
  {
    id: "rush-hunts",
    number: "03",
    title: [[{ text: "Rush " }, { text: "Hunts", red: true }]],
    description: ["Citywide scavenger hunts.", "Find. Scan. Win."],
    thumbnail: "/assets/images/videos-series-thumb-3.webp", // PLACEHOLDER
    thumbnailAlt: "A RUSH5OUR QR code poster outside Valencia College — Rush Hunts",
    platformUrl: "#", // PLACEHOLDER
    videos: [
      { id: "rush-hunts-01-boone", featured: true, category: "rush-hunts", title: "Boone", caption: "", orientation: "vertical", duration: "0:34", src: `${R2_BASE}/rush-hunts/01-boone.mp4`, poster: `${R2_BASE}/rush-hunts/01-boone.jpg`, thumbnail: "" },
      { id: "rush-hunts-02-edgewater", featured: true, category: "rush-hunts", title: "Edgewater", caption: "", orientation: "vertical", duration: "0:33", src: `${R2_BASE}/rush-hunts/02-edgewater.mp4`, poster: `${R2_BASE}/rush-hunts/02-edgewater.jpg`, thumbnail: "" },
      { id: "rush-hunts-03-jones", featured: true, category: "rush-hunts", title: "Jones", caption: "", orientation: "vertical", duration: "0:34", src: `${R2_BASE}/rush-hunts/03-jones.mp4`, poster: `${R2_BASE}/rush-hunts/03-jones.jpg`, thumbnail: "" },
      { id: "rush-hunts-04-colonial", featured: true, category: "rush-hunts", title: "Colonial", caption: "", orientation: "vertical", duration: "0:32", src: `${R2_BASE}/rush-hunts/04-colonial.mp4`, poster: `${R2_BASE}/rush-hunts/04-colonial.jpg`, thumbnail: "" },
      { id: "rush-hunts-05-oak-ridge", category: "rush-hunts", title: "Oak Ridge", caption: "", orientation: "vertical", duration: "0:25", src: `${R2_BASE}/rush-hunts/05-oak-ridge.mp4`, poster: `${R2_BASE}/rush-hunts/05-oak-ridge.jpg`, thumbnail: "" },
      { id: "rush-hunts-06-apopka", category: "rush-hunts", title: "Apopka", caption: "", orientation: "vertical", duration: "0:20", src: `${R2_BASE}/rush-hunts/06-apopka.mp4`, poster: `${R2_BASE}/rush-hunts/06-apopka.jpg`, thumbnail: "" },
      { id: "rush-hunts-07-wekiva", category: "rush-hunts", title: "Wekiva", caption: "", orientation: "vertical", duration: "0:28", src: `${R2_BASE}/rush-hunts/07-wekiva.mp4`, poster: `${R2_BASE}/rush-hunts/07-wekiva.jpg`, thumbnail: "" },
      { id: "rush-hunts-08-west-orange", category: "rush-hunts", title: "West Orange", caption: "", orientation: "vertical", duration: "0:19", src: `${R2_BASE}/rush-hunts/08-west-orange.mp4`, poster: `${R2_BASE}/rush-hunts/08-west-orange.jpg`, thumbnail: "" },
      { id: "rush-hunts-09-windermere", category: "rush-hunts", title: "Windermere", caption: "", orientation: "vertical", duration: "0:22", src: `${R2_BASE}/rush-hunts/09-windermere.mp4`, poster: `${R2_BASE}/rush-hunts/09-windermere.jpg`, thumbnail: "" },
      { id: "rush-hunts-10-dr-philips", category: "rush-hunts", title: "Dr. Philips", caption: "", orientation: "vertical", duration: "0:24", src: `${R2_BASE}/rush-hunts/10-dr-philips.mp4`, poster: `${R2_BASE}/rush-hunts/10-dr-philips.jpg`, thumbnail: "" },
      { id: "rush-hunts-11-ucf", category: "rush-hunts", title: "UCF", caption: "", orientation: "vertical", duration: "0:36", src: `${R2_BASE}/rush-hunts/11-ucf.mp4`, poster: `${R2_BASE}/rush-hunts/11-ucf.jpg`, thumbnail: "" },
      { id: "rush-hunts-12-university", category: "rush-hunts", title: "University", caption: "", orientation: "vertical", duration: "0:37", src: `${R2_BASE}/rush-hunts/12-university.mp4`, poster: `${R2_BASE}/rush-hunts/12-university.jpg`, thumbnail: "" },
      { id: "rush-hunts-13-timber-creek", category: "rush-hunts", title: "Timber Creek", caption: "", orientation: "vertical", duration: "0:21", src: `${R2_BASE}/rush-hunts/13-timber-creek.mp4`, poster: `${R2_BASE}/rush-hunts/13-timber-creek.jpg`, thumbnail: "" },
      { id: "rush-hunts-14-lake-nona", category: "rush-hunts", title: "Lake Nona", caption: "", orientation: "vertical", duration: "0:16", src: `${R2_BASE}/rush-hunts/14-lake-nona.mp4`, poster: `${R2_BASE}/rush-hunts/14-lake-nona.jpg`, thumbnail: "" },
      { id: "rush-hunts-15-olympia", category: "rush-hunts", title: "Olympia", caption: "", orientation: "vertical", duration: "0:38", src: `${R2_BASE}/rush-hunts/15-olympia.mp4`, poster: `${R2_BASE}/rush-hunts/15-olympia.jpg`, thumbnail: "" },
    ],
  },
  {
    id: "you-got-game",
    number: "04",
    title: [[{ text: "You got " }, { text: "Game?", red: true }]],
    description: ["Public challenges.", "Think you got game?"],
    thumbnail: "/assets/images/videos-series-thumb-4.webp", // PLACEHOLDER
    thumbnailAlt: "A man and a woman talking across a café table — You got game?",
    platformUrl: "#", // PLACEHOLDER
    videos: [
      { id: "you-got-game-01", featured: true, category: "you-got-game", title: "Episode 01", caption: "", orientation: "vertical", duration: "1:21", src: `${R2_BASE}/you-got-game/01.mp4`, poster: `${R2_BASE}/you-got-game/01.jpg`, thumbnail: "" },
      { id: "you-got-game-02", featured: true, category: "you-got-game", title: "Episode 02", caption: "", orientation: "vertical", duration: "1:34", src: `${R2_BASE}/you-got-game/02.mp4`, poster: `${R2_BASE}/you-got-game/02.jpg`, thumbnail: "" },
      { id: "you-got-game-03", featured: true, category: "you-got-game", title: "Episode 03", caption: "", orientation: "vertical", duration: "1:46", src: `${R2_BASE}/you-got-game/03.mp4`, poster: `${R2_BASE}/you-got-game/03.jpg`, thumbnail: "" },
      { id: "you-got-game-04", featured: true, category: "you-got-game", title: "Episode 04", caption: "", orientation: "vertical", duration: "0:53", src: `${R2_BASE}/you-got-game/04.mp4`, poster: `${R2_BASE}/you-got-game/04.jpg`, thumbnail: "" },
      { id: "you-got-game-05", category: "you-got-game", title: "Episode 05", caption: "", orientation: "vertical", duration: "1:11", src: `${R2_BASE}/you-got-game/05.mp4`, poster: `${R2_BASE}/you-got-game/05.jpg`, thumbnail: "" },
      { id: "you-got-game-06", category: "you-got-game", title: "Episode 06", caption: "", orientation: "vertical", duration: "1:56", src: `${R2_BASE}/you-got-game/06.mp4`, poster: `${R2_BASE}/you-got-game/06.jpg`, thumbnail: "" },
      { id: "you-got-game-07", category: "you-got-game", title: "Episode 07", caption: "", orientation: "vertical", duration: "0:58", src: `${R2_BASE}/you-got-game/07.mp4`, poster: `${R2_BASE}/you-got-game/07.jpg`, thumbnail: "" },
      { id: "you-got-game-08", category: "you-got-game", title: "Episode 08", caption: "", orientation: "vertical", duration: "2:49", src: `${R2_BASE}/you-got-game/08.mp4`, poster: `${R2_BASE}/you-got-game/08.jpg`, thumbnail: "" },
      { id: "you-got-game-09", category: "you-got-game", title: "Episode 09", caption: "", orientation: "vertical", duration: "2:17", src: `${R2_BASE}/you-got-game/09.mp4`, poster: `${R2_BASE}/you-got-game/09.jpg`, thumbnail: "" },
      { id: "you-got-game-10", category: "you-got-game", title: "Episode 10", caption: "", orientation: "vertical", duration: "1:32", src: `${R2_BASE}/you-got-game/10.mp4`, poster: `${R2_BASE}/you-got-game/10.jpg`, thumbnail: "" },
      { id: "you-got-game-11", category: "you-got-game", title: "Episode 11", caption: "", orientation: "vertical", duration: "2:35", src: `${R2_BASE}/you-got-game/11.mp4`, poster: `${R2_BASE}/you-got-game/11.jpg`, thumbnail: "" },
      { id: "you-got-game-12", category: "you-got-game", title: "Episode 12", caption: "", orientation: "vertical", duration: "1:16", src: `${R2_BASE}/you-got-game/12.mp4`, poster: `${R2_BASE}/you-got-game/12.jpg`, thumbnail: "" },
      { id: "you-got-game-13", category: "you-got-game", title: "Episode 13", caption: "", orientation: "vertical", duration: "1:37", src: `${R2_BASE}/you-got-game/13.mp4`, poster: `${R2_BASE}/you-got-game/13.jpg`, thumbnail: "" },
      { id: "you-got-game-14", category: "you-got-game", title: "Episode 14", caption: "", orientation: "vertical", duration: "2:05", src: `${R2_BASE}/you-got-game/14.mp4`, poster: `${R2_BASE}/you-got-game/14.jpg`, thumbnail: "" },
      { id: "you-got-game-15", category: "you-got-game", title: "Episode 15", caption: "", orientation: "vertical", duration: "1:23", src: `${R2_BASE}/you-got-game/15.mp4`, poster: `${R2_BASE}/you-got-game/15.jpg`, thumbnail: "" },
    ],
  },
  {
    id: "rush-reacts",
    number: "05",
    title: [[{ text: "Rush " }, { text: "Reacts", red: true }]],
    description: ["Music. Culture. Reactions.", "Underrated & unseen."],
    thumbnail: "/assets/images/videos-series-thumb-5.webp", // PLACEHOLDER
    thumbnailAlt: "Two men reacting to Drake — Maid of Honour",
    platformUrl: "#", // PLACEHOLDER
    videos: [
      { id: "rush-reacts-01-hoe-phase", featured: true, category: "rush-reacts", title: "Hoe Phase", caption: "", orientation: "vertical", duration: "0:29", src: `${R2_BASE}/rush-reacts/01-hoe-phase.mp4`, poster: `${R2_BASE}/rush-reacts/01-hoe-phase.jpg`, thumbnail: "" },
      { id: "rush-reacts-02-road-trips", featured: true, category: "rush-reacts", title: "Road Trips", caption: "", orientation: "vertical", duration: "0:25", src: `${R2_BASE}/rush-reacts/02-road-trips.mp4`, poster: `${R2_BASE}/rush-reacts/02-road-trips.jpg`, thumbnail: "" },
      { id: "rush-reacts-03-outside-tweaking", featured: true, category: "rush-reacts", title: "Outside Tweaking", caption: "", orientation: "vertical", duration: "0:31", src: `${R2_BASE}/rush-reacts/03-outside-tweaking.mp4`, poster: `${R2_BASE}/rush-reacts/03-outside-tweaking.jpg`, thumbnail: "" },
      { id: "rush-reacts-04-outside-tweaking", featured: true, category: "rush-reacts", title: "Outside Tweaking", caption: "", orientation: "vertical", duration: "0:22", src: `${R2_BASE}/rush-reacts/04-outside-tweaking.mp4`, poster: `${R2_BASE}/rush-reacts/04-outside-tweaking.jpg`, thumbnail: "" },
      { id: "rush-reacts-05-cheetah-print", category: "rush-reacts", title: "Cheetah Print", caption: "", orientation: "vertical", duration: "0:12", src: `${R2_BASE}/rush-reacts/05-cheetah-print.mp4`, poster: `${R2_BASE}/rush-reacts/05-cheetah-print.jpg`, thumbnail: "" },
      { id: "rush-reacts-06-which-one", category: "rush-reacts", title: "Which One", caption: "", orientation: "vertical", duration: "0:34", src: `${R2_BASE}/rush-reacts/06-which-one.mp4`, poster: `${R2_BASE}/rush-reacts/06-which-one.jpg`, thumbnail: "" },
      { id: "rush-reacts-07-amazing-shape", category: "rush-reacts", title: "Amazing Shape", caption: "", orientation: "vertical", duration: "0:20", src: `${R2_BASE}/rush-reacts/07-amazing-shape.mp4`, poster: `${R2_BASE}/rush-reacts/07-amazing-shape.jpg`, thumbnail: "" },
      { id: "rush-reacts-08-bbw", category: "rush-reacts", title: "BBW", caption: "", orientation: "vertical", duration: "0:31", src: `${R2_BASE}/rush-reacts/08-bbw.mp4`, poster: `${R2_BASE}/rush-reacts/08-bbw.jpg`, thumbnail: "" },
      { id: "rush-reacts-09-true-bestie", category: "rush-reacts", title: "True Bestie", caption: "", orientation: "vertical", duration: "0:24", src: `${R2_BASE}/rush-reacts/09-true-bestie.mp4`, poster: `${R2_BASE}/rush-reacts/09-true-bestie.jpg`, thumbnail: "" },
      { id: "rush-reacts-10-wheres-your-stuff-interlude", category: "rush-reacts", title: "Where’s Your Stuff Interlude", caption: "", orientation: "vertical", duration: "0:14", src: `${R2_BASE}/rush-reacts/10-wheres-your-stuff-interlude.mp4`, poster: `${R2_BASE}/rush-reacts/10-wheres-your-stuff-interlude.jpg`, thumbnail: "" },
      { id: "rush-reacts-11-new-bestie", category: "rush-reacts", title: "New Bestie", caption: "", orientation: "vertical", duration: "0:34", src: `${R2_BASE}/rush-reacts/11-new-bestie.mp4`, poster: `${R2_BASE}/rush-reacts/11-new-bestie.jpg`, thumbnail: "" },
      { id: "rush-reacts-12-q-and-a", category: "rush-reacts", title: "Q&A", caption: "", orientation: "vertical", duration: "0:28", src: `${R2_BASE}/rush-reacts/12-q-and-a.mp4`, poster: `${R2_BASE}/rush-reacts/12-q-and-a.jpg`, thumbnail: "" },
      { id: "rush-reacts-13-stuck", category: "rush-reacts", title: "Stuck", caption: "", orientation: "vertical", duration: "0:15", src: `${R2_BASE}/rush-reacts/13-stuck.mp4`, poster: `${R2_BASE}/rush-reacts/13-stuck.jpg`, thumbnail: "" },
      { id: "rush-reacts-14-goose-and-the-juice", category: "rush-reacts", title: "Goose and The Juice", caption: "", orientation: "vertical", duration: "0:10", src: `${R2_BASE}/rush-reacts/14-goose-and-the-juice.mp4`, poster: `${R2_BASE}/rush-reacts/14-goose-and-the-juice.jpg`, thumbnail: "" },
      { id: "rush-reacts-15-princess", category: "rush-reacts", title: "Princess", caption: "", orientation: "vertical", duration: "0:11", src: `${R2_BASE}/rush-reacts/15-princess.mp4`, poster: `${R2_BASE}/rush-reacts/15-princess.jpg`, thumbnail: "" },
    ],
  },
];

/** One long-form horizontal (16:9) video — plays in the section's featured
    player with the browser's controls, never in the swipe feed. */
export interface LongVideo extends FeedVideo {
  /** The client's episode number, as printed. */
  number: string;
  /** The card's two-line title, with its red run. */
  cardTitle: TitleRun[][];
  description: string[];
  thumbnailAlt: string;
}

export interface LongSeries {
  id: string;
  title: TitleRun[];
  label: string;
  aside: string[];
  /** Where "View full series on YouTube" goes. */
  platformUrl: string;
  /** Which episode the featured player at the top of the section shows. */
  featuredId: string;
  /** How many episodes the section lists as cards (the mockup draws four);
      the feed viewer carries them all. */
  cards: number;
  videos: LongVideo[];
}

export const pickingUpGirls: LongSeries = {
  id: "picking-up-girls",
  title: [{ text: "Picking up " }, { text: "Girls", red: true }],
  label: "Series",
  aside: ["Real convos.", "Real people.", "Real moments."],
  platformUrl: "https://www.youtube.com/@RUSH5OUR", // PLACEHOLDER — the series' playlist
  featuredId: "picking-up-girls-02-using-chatgpt",
  cards: 4,
  /* The client's numbering is kept (episodes 1, 4, 7, 9 and 10 were not
     supplied). Streams from R2 at 720p, encoded from the 4K masters. */
  videos: [
    {
      id: "picking-up-girls-02-using-chatgpt",
      featured: true,
      category: "picking-up-girls",
      number: "02",
      title: "Picking Up Girls Using ChatGPT",
      caption: "",
      orientation: "horizontal",
      src: `${R2_BASE}/picking-up-girls/02-using-chatgpt.mp4`,
      poster: `${R2_BASE}/picking-up-girls/02-using-chatgpt.jpg`,
      cardTitle: [[{ text: "Picking up girls" }], [{ text: "using " }, { text: "ChatGPT", red: true }]],
      description: ["AI writes the lines.","Real people answer."], // PLACEHOLDER copy
      duration: "7:37",
      thumbnail: `${R2_BASE}/picking-up-girls/02-using-chatgpt.jpg`, // PLACEHOLDER — the clip's own frame
      thumbnailAlt: "Picking Up Girls Using ChatGPT",
    },
    {
      id: "picking-up-girls-03-using-siri",
      featured: true,
      category: "picking-up-girls",
      number: "03",
      title: "Picking Up Girls Using Siri",
      caption: "",
      orientation: "horizontal",
      src: `${R2_BASE}/picking-up-girls/03-using-siri.mp4`,
      poster: `${R2_BASE}/picking-up-girls/03-using-siri.jpg`,
      cardTitle: [[{ text: "Picking up girls" }], [{ text: "using " }, { text: "Siri", red: true }]],
      description: ["Smooth or awkward?","Let’s find out..."], // PLACEHOLDER copy
      duration: "9:58",
      thumbnail: `${R2_BASE}/picking-up-girls/03-using-siri.jpg`, // PLACEHOLDER — the clip's own frame
      thumbnailAlt: "Picking Up Girls Using Siri",
    },
    {
      id: "picking-up-girls-05-as-kamala-harris",
      featured: true,
      category: "picking-up-girls",
      number: "05",
      title: "Picking Up Girls As Kamala Harris",
      caption: "",
      orientation: "horizontal",
      src: `${R2_BASE}/picking-up-girls/05-as-kamala-harris.mp4`,
      poster: `${R2_BASE}/picking-up-girls/05-as-kamala-harris.jpg`,
      cardTitle: [[{ text: "Picking up girls" }], [{ text: "as " }, { text: "Kamala Harris", red: true }]],
      description: ["Same lines.","A very different delivery."], // PLACEHOLDER copy
      duration: "9:52",
      thumbnail: `${R2_BASE}/picking-up-girls/05-as-kamala-harris.jpg`, // PLACEHOLDER — the clip's own frame
      thumbnailAlt: "Picking Up Girls As Kamala Harris",
    },
    {
      id: "picking-up-girls-06-as-donald-trump",
      featured: true,
      category: "picking-up-girls",
      number: "06",
      title: "Picking Up Girls As Donald Trump",
      caption: "",
      orientation: "horizontal",
      src: `${R2_BASE}/picking-up-girls/06-as-donald-trump.mp4`,
      poster: `${R2_BASE}/picking-up-girls/06-as-donald-trump.jpg`,
      cardTitle: [[{ text: "Picking up girls" }], [{ text: "as " }, { text: "Donald Trump", red: true }]],
      description: ["Big words.","Bigger reactions."], // PLACEHOLDER copy
      duration: "8:47",
      thumbnail: `${R2_BASE}/picking-up-girls/06-as-donald-trump.jpg`, // PLACEHOLDER — the clip's own frame
      thumbnailAlt: "Picking Up Girls As Donald Trump",
    },
    {
      id: "picking-up-girls-08-with-a-huge-calendar",
      category: "picking-up-girls",
      number: "08",
      title: "Picking Up Girls With a Huge Calendar",
      caption: "",
      orientation: "horizontal",
      src: `${R2_BASE}/picking-up-girls/08-with-a-huge-calendar.mp4`,
      poster: `${R2_BASE}/picking-up-girls/08-with-a-huge-calendar.jpg`,
      cardTitle: [[{ text: "Picking up girls" }], [{ text: "with a " }, { text: "huge calendar", red: true }]],
      description: ["Pick a date.","Literally."], // PLACEHOLDER copy
      duration: "15:01",
      thumbnail: `${R2_BASE}/picking-up-girls/08-with-a-huge-calendar.jpg`, // PLACEHOLDER — the clip's own frame
      thumbnailAlt: "Picking Up Girls With a Huge Calendar",
    },
    {
      id: "picking-up-girls-11-wingman-edition",
      category: "picking-up-girls",
      number: "11",
      title: "Picking Up Girls Wingman Edition",
      caption: "",
      orientation: "horizontal",
      src: `${R2_BASE}/picking-up-girls/11-wingman-edition.mp4`,
      poster: `${R2_BASE}/picking-up-girls/11-wingman-edition.jpg`,
      cardTitle: [[{ text: "Picking up girls" }], [{ text: "Wingman edition", red: true }]],
      description: ["Two is company.","Does it help?"], // PLACEHOLDER copy
      duration: "7:49",
      thumbnail: `${R2_BASE}/picking-up-girls/11-wingman-edition.jpg`, // PLACEHOLDER — the clip's own frame
      thumbnailAlt: "Picking Up Girls Wingman Edition",
    },
    {
      id: "picking-up-girls-12-with-a-magic-8-ball",
      category: "picking-up-girls",
      number: "12",
      title: "Picking Up Girls With a Magic 8 Ball",
      caption: "",
      orientation: "horizontal",
      src: `${R2_BASE}/picking-up-girls/12-with-a-magic-8-ball.mp4`,
      poster: `${R2_BASE}/picking-up-girls/12-with-a-magic-8-ball.jpg`,
      cardTitle: [[{ text: "Picking up girls" }], [{ text: "with a " }, { text: "Magic 8 Ball", red: true }]],
      description: ["Every move decided","by the ball."], // PLACEHOLDER copy
      duration: "12:04",
      thumbnail: `${R2_BASE}/picking-up-girls/12-with-a-magic-8-ball.jpg`, // PLACEHOLDER — the clip's own frame
      thumbnailAlt: "Picking Up Girls With a Magic 8 Ball",
    },
    {
      id: "picking-up-girls-13-using-side-chick-applications",
      category: "picking-up-girls",
      number: "13",
      title: "Picking Up Girls Using Side Chick Applications",
      caption: "",
      orientation: "horizontal",
      src: `${R2_BASE}/picking-up-girls/13-using-side-chick-applications.mp4`,
      poster: `${R2_BASE}/picking-up-girls/13-using-side-chick-applications.jpg`,
      cardTitle: [[{ text: "Picking up girls" }], [{ text: "using " }, { text: "applications", red: true }]],
      description: ["Fill in the form.","Wait for approval."], // PLACEHOLDER copy
      duration: "12:56",
      thumbnail: `${R2_BASE}/picking-up-girls/13-using-side-chick-applications.jpg`, // PLACEHOLDER — the clip's own frame
      thumbnailAlt: "Picking Up Girls Using Side Chick Applications",
    },
    {
      id: "picking-up-girls-14-using-airdrop",
      category: "picking-up-girls",
      number: "14",
      title: "Picking Up Girls Using AirDrop",
      caption: "",
      orientation: "horizontal",
      src: `${R2_BASE}/picking-up-girls/14-using-airdrop.mp4`,
      poster: `${R2_BASE}/picking-up-girls/14-using-airdrop.jpg`,
      cardTitle: [[{ text: "Picking up girls" }], [{ text: "using " }, { text: "AirDrop", red: true }]],
      description: ["No words.","Just a notification."], // PLACEHOLDER copy
      duration: "11:48",
      thumbnail: `${R2_BASE}/picking-up-girls/14-using-airdrop.jpg`, // PLACEHOLDER — the clip's own frame
      thumbnailAlt: "Picking Up Girls Using AirDrop",
    },
    {
      id: "picking-up-girls-15-in-30-seconds-part-8",
      category: "picking-up-girls",
      number: "15",
      title: "Picking Up Girls In 30 Seconds (Part 8)",
      caption: "",
      orientation: "horizontal",
      src: `${R2_BASE}/picking-up-girls/15-in-30-seconds-part-8.mp4`,
      poster: `${R2_BASE}/picking-up-girls/15-in-30-seconds-part-8.jpg`,
      cardTitle: [[{ text: "Picking up girls" }], [{ text: "in " }, { text: "30 seconds", red: true }]],
      description: ["The clock is running.","Part 8."], // PLACEHOLDER copy
      duration: "10:06",
      thumbnail: `${R2_BASE}/picking-up-girls/15-in-30-seconds-part-8.jpg`, // PLACEHOLDER — the clip's own frame
      thumbnailAlt: "Picking Up Girls In 30 Seconds (Part 8)",
    },
  ],
};

/* ------------------------------------------------------------------------ */
/* Homepage — the featured set                                               */
/* ------------------------------------------------------------------------ */

/** A featured video with what the homepage needs to play it in place. */
export interface HomeFeatured {
  video: FeedVideo;
  /** The series it belongs to, as the feed viewer takes it. */
  series: { id: string; name: string; videos: FeedVideo[]; platformUrl: string };
  /** Its position in that series, so the viewer opens on it. */
  index: number;
}

const seriesName = (lines: TitleRun[][] | TitleRun[]) =>
  (lines as (TitleRun[] | TitleRun)[])
    .map((line) => (Array.isArray(line) ? line.map((r) => r.text).join("") : line.text))
    .join(Array.isArray(lines[0]) ? " " : "");

/** Every video, as the homepage plays it: horizontal (long-form) first, then
    the short series in their order. A category tab shows its whole series,
    the `featured` ones first. */
export const homeVideos: HomeFeatured[] = [
  ...pickingUpGirls.videos.map((video, index) => ({
    video,
    index,
    series: { id: pickingUpGirls.id, name: seriesName(pickingUpGirls.title), videos: pickingUpGirls.videos, platformUrl: pickingUpGirls.platformUrl },
  })),
  ...shortSeries.flatMap((s) =>
    s.videos.map((video, index) => ({
      video,
      index,
      series: { id: s.id, name: seriesName(s.title), videos: s.videos, platformUrl: s.platformUrl },
    })),
  ),
];

/** Every `featured: true` video — the "All" tab's curated mix. */
export const homeFeatured: HomeFeatured[] = homeVideos.filter((f) => f.video.featured);
