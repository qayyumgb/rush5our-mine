/**
 * VIDEO CONTENT — section 3, "Featured videos" (mockup 3.png).
 *
 * ▸ BACKEND SEAM — this is the most likely first API integration.
 *   `featuredVideos` and `gridVideos` are plain arrays shaped like a typical
 *   video API response. To go live:
 *
 *     1. Add a loader, e.g. `lib/api/videos.ts` exporting
 *        `getVideos(): Promise<VideoItem[]>`.
 *     2. Fetch it in a server component and pass the result into
 *        <VideosSection videos={...} featured={...} />.
 *
 *   The section already takes both lists as optional props and falls back to
 *   the constants below, so the swap is a one-line change at the call site.
 *
 * ▸ ADDING A VIDEO LINK
 *   Paste the plain share URL into `videoUrl` — the one a platform's "Copy
 *   link" button gives you. TikTok, YouTube (including Shorts), Vimeo and
 *   direct .mp4 files are all understood; see lib/video.ts. Tracking
 *   parameters (`?is_from_webapp=…`, `?si=…`) are ignored, so pasting the
 *   whole thing is fine, but the canonical form is kept here for tidiness.
 *
 *   Do NOT paste TikTok's <blockquote> embed snippet. It loads TikTok's
 *   embed.js, which replaces it with TikTok's own card — unstyleable, and it
 *   cannot sit inside our lightbox. The share link gives the same video.
 *
 *   Vertical videos (TikTok, Shorts) are detected automatically and open in
 *   a portrait player.
 *
 *   Leaving `videoUrl` empty is safe: the player shows the thumbnail with a
 *   "coming soon" note.
 *
 * ▸ PLACEHOLDER METRICS — READ BEFORE LAUNCH
 *   `views` and `duration` on every entry below are the figures drawn in the
 *   mockup, not real numbers. They are kept on purpose so the client demo
 *   matches the approved comp, and they are meant to be replaced in one pass
 *   once the real data is available.
 *
 *   EXCEPTION: "Picking up girls" now shows its real YouTube figures —
 *   1,332 views, looked up on 2026-09-22, and a 6:08 duration that happens
 *   to match what the mockup already had. The view count is a STATIC
 *   SNAPSHOT and will drift as the video gains views; only the API makes it
 *   self-updating.
 *
 *   This matters most where a video is already real: "$5 or mystery gift"
 *   plays the genuine TikTok but still shows mockup figures beside it.
 *
 *   Real view counts are NOT available from the oEmbed endpoints that supply
 *   our thumbnails — neither TikTok's nor YouTube's returns any engagement
 *   field. They need a proper API:
 *
 *     • YouTube — an API key is enough (public stats need no OAuth), and one
 *       call also returns duration and thumbnails. By far the easier path.
 *     • TikTok  — OAuth as @rush5our plus app review.
 *
 *   Keep the metric and the player on the same platform per video: the same
 *   clip can have very different counts on each.
 *
 *   See the "Video metrics" section of the README for both setups.
 */

export interface VideoItem {
  id: string;
  title: string;
  /** One-line strapline under the title. */
  subtitle: string;
  /** Thumbnail path or remote URL. */
  thumbnail: string;
  /** `object-position` for the thumbnail — the mockup crops each differently. */
  thumbnailPosition?: string;
  /** Human-readable runtime, e.g. "6:08". */
  duration: string;
  /** Formatted view count, e.g. "125K". */
  views?: string;
  /** Category key, matched against the filter tabs. */
  category: string;
  /** VIDEO LINK: paste the real URL here (or supply it from the API). */
  videoUrl: string;
  /** Badge shown on the featured carousel, e.g. "Latest". */
  badge?: string;
}

export interface VideoFilter {
  /** "all" shows everything; otherwise matched against `VideoItem.category`. */
  key: string;
  label: string;
}

export interface VideosContent {
  eyebrow: string;
  titleWhite: string;
  titleRed: string;
  subtitle: string;
  accent: { lines: string[] };
  viewAll: { label: string; href: string };
  filters: VideoFilter[];
  watchAll: { label: string; href: string };
}

export const videosContent: VideosContent = {
  eyebrow: "On the street",
  titleWhite: "Featured",
  titleRed: "Videos",
  subtitle: "Real people. Real moments. No scripts.",
  accent: { lines: ["Press", "play.", "See what", "we do."] },
  // CHANNEL LINK: point at the YouTube / TikTok channel.
  viewAll: { label: "View all videos", href: "#" },
  filters: [
    { key: "all", label: "All" },
    { key: "girls", label: "Picking up girls" },
    { key: "hunts", label: "Rush hunts" },
    { key: "five", label: "$5 series" },
    { key: "interviews", label: "Public interviews" },
  ],
  watchAll: { label: "Watch all videos", href: "#" },
};

/** The hero carousel at the top of the section. */
export const featuredVideos: VideoItem[] = [
  {
    id: "picking-up-girls",
    title: "Picking up girls",
    subtitle: "Real convos. Real reactions.",
    thumbnail: "/assets/images/thumb-picking-up-girls.jpg",
    thumbnailPosition: "50% 0%",
    duration: "6:08",
    category: "girls",
    videoUrl: "https://youtu.be/dAV-rudZcS4",
    badge: "Latest",
  },
  {
    id: "five-or-mystery",
    title: "$5 or mystery gift",
    subtitle: "Random people. Big wins.",
    thumbnail: "/assets/images/thumb-5-or-mystery.jpg",
    thumbnailPosition: "50% 30%",
    duration: "8:21",
    category: "five",
    videoUrl: "https://www.tiktok.com/@rush5our/video/7680567561460731166",
    badge: "Trending",
  },
  {
    id: "rush-hunts",
    title: "Rush hunts",
    subtitle: "Find it. Scan it. Win it.",
    thumbnail: "/assets/images/thumb-rush-hunts.webp",
    thumbnailPosition: "50% 45%",
    duration: "10:17",
    category: "hunts",
    videoUrl: "",
    badge: "Rush hunts",
  },
  {
    // PLACEHOLDER: no fourth thumbnail supplied yet — reuses the hero photo.
    id: "built-different",
    title: "Built different",
    subtitle: "How the movement started.",
    thumbnail: "/assets/images/hero-wide.webp",
    thumbnailPosition: "50% 25%",
    duration: "3:45",
    category: "interviews",
    videoUrl: "",
    badge: "Our story",
  },
];

/** The filterable 3-up grid below the tabs. */
export const gridVideos: VideoItem[] = [
  {
    id: "grid-picking-up-girls",
    title: "Picking up girls",
    subtitle: "Real convos. Real reactions.",
    thumbnail: "/assets/images/thumb-picking-up-girls.jpg",
    thumbnailPosition: "100% 50%",
    duration: "6:08",
    views: "1,332",
    category: "girls",
    videoUrl: "https://youtu.be/dAV-rudZcS4",
  },
  {
    id: "grid-five-or-mystery",
    title: "$5 or mystery gift",
    subtitle: "Random people. Big wins.",
    thumbnail: "/assets/images/thumb-5-or-mystery.jpg",
    thumbnailPosition: "50% 12%",
    duration: "8:21",
    views: "98K",
    category: "five",
    videoUrl: "https://www.tiktok.com/@rush5our/video/7680567561460731166",
  },
  {
    id: "grid-rush-hunts",
    title: "Rush hunts",
    subtitle: "Find it. Scan it. Win it.",
    thumbnail: "/assets/images/thumb-rush-hunts.webp",
    thumbnailPosition: "50% 8%",
    duration: "10:17",
    views: "210K",
    category: "hunts",
    videoUrl: "",
  },
];

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
  /** The video file's URL (Cloudflare R2). Empty = not uploaded: the
      viewer shows the poster with a "coming soon" note. */
  src: string;
  /** The clip's frame at 1 s (9:16 or 16:9 to match), shown before the
      video loads. */
  poster: string;
}

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
      { id: "five-or-mystery-gift-01", title: "Episode 01", caption: "", orientation: "vertical", src: `${R2_BASE}/five-or-mystery-gift/01.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/01.jpg` },
      { id: "five-or-mystery-gift-02", title: "Episode 02", caption: "", orientation: "vertical", src: `${R2_BASE}/five-or-mystery-gift/02.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/02.jpg` },
      { id: "five-or-mystery-gift-03", title: "Episode 03", caption: "", orientation: "vertical", src: `${R2_BASE}/five-or-mystery-gift/03.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/03.jpg` },
      { id: "five-or-mystery-gift-04", title: "Episode 04", caption: "", orientation: "vertical", src: `${R2_BASE}/five-or-mystery-gift/04.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/04.jpg` },
      { id: "five-or-mystery-gift-05", title: "Episode 05", caption: "", orientation: "vertical", src: `${R2_BASE}/five-or-mystery-gift/05.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/05.jpg` },
      { id: "five-or-mystery-gift-06", title: "Episode 06", caption: "", orientation: "vertical", src: `${R2_BASE}/five-or-mystery-gift/06.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/06.jpg` },
      { id: "five-or-mystery-gift-07", title: "Episode 07", caption: "", orientation: "vertical", src: `${R2_BASE}/five-or-mystery-gift/07.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/07.jpg` },
      { id: "five-or-mystery-gift-08", title: "Episode 08", caption: "", orientation: "vertical", src: `${R2_BASE}/five-or-mystery-gift/08.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/08.jpg` },
      { id: "five-or-mystery-gift-09", title: "Episode 09", caption: "", orientation: "vertical", src: `${R2_BASE}/five-or-mystery-gift/09.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/09.jpg` },
      { id: "five-or-mystery-gift-10", title: "Episode 10", caption: "", orientation: "vertical", src: `${R2_BASE}/five-or-mystery-gift/10.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/10.jpg` },
      { id: "five-or-mystery-gift-11", title: "Episode 11", caption: "", orientation: "vertical", src: `${R2_BASE}/five-or-mystery-gift/11.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/11.jpg` },
      { id: "five-or-mystery-gift-12", title: "Episode 12", caption: "", orientation: "vertical", src: `${R2_BASE}/five-or-mystery-gift/12.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/12.jpg` },
      { id: "five-or-mystery-gift-13", title: "Episode 13", caption: "", orientation: "vertical", src: `${R2_BASE}/five-or-mystery-gift/13.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/13.jpg` },
      { id: "five-or-mystery-gift-14", title: "Episode 14", caption: "", orientation: "vertical", src: `${R2_BASE}/five-or-mystery-gift/14.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/14.jpg` },
      { id: "five-or-mystery-gift-15", title: "Episode 15", caption: "", orientation: "vertical", src: `${R2_BASE}/five-or-mystery-gift/15.mp4`, poster: `${R2_BASE}/five-or-mystery-gift/15.jpg` },
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
      { id: "bet-five-01", title: "Episode 01", caption: "", orientation: "vertical", src: `${R2_BASE}/bet-five/01.mp4`, poster: `${R2_BASE}/bet-five/01.jpg` },
      { id: "bet-five-02", title: "Episode 02", caption: "", orientation: "vertical", src: `${R2_BASE}/bet-five/02.mp4`, poster: `${R2_BASE}/bet-five/02.jpg` },
      { id: "bet-five-03", title: "Episode 03", caption: "", orientation: "vertical", src: `${R2_BASE}/bet-five/03.mp4`, poster: `${R2_BASE}/bet-five/03.jpg` },
      { id: "bet-five-04", title: "Episode 04", caption: "", orientation: "vertical", src: `${R2_BASE}/bet-five/04.mp4`, poster: `${R2_BASE}/bet-five/04.jpg` },
      { id: "bet-five-05", title: "Episode 05", caption: "", orientation: "vertical", src: `${R2_BASE}/bet-five/05.mp4`, poster: `${R2_BASE}/bet-five/05.jpg` },
      { id: "bet-five-06", title: "Episode 06", caption: "", orientation: "vertical", src: `${R2_BASE}/bet-five/06.mp4`, poster: `${R2_BASE}/bet-five/06.jpg` },
      { id: "bet-five-07", title: "Episode 07", caption: "", orientation: "vertical", src: `${R2_BASE}/bet-five/07.mp4`, poster: `${R2_BASE}/bet-five/07.jpg` },
      { id: "bet-five-08", title: "Episode 08", caption: "", orientation: "vertical", src: `${R2_BASE}/bet-five/08.mp4`, poster: `${R2_BASE}/bet-five/08.jpg` },
      { id: "bet-five-09", title: "Episode 09", caption: "", orientation: "vertical", src: `${R2_BASE}/bet-five/09.mp4`, poster: `${R2_BASE}/bet-five/09.jpg` },
      { id: "bet-five-10", title: "Episode 10", caption: "", orientation: "vertical", src: `${R2_BASE}/bet-five/10.mp4`, poster: `${R2_BASE}/bet-five/10.jpg` },
      { id: "bet-five-11", title: "Episode 11", caption: "", orientation: "vertical", src: `${R2_BASE}/bet-five/11.mp4`, poster: `${R2_BASE}/bet-five/11.jpg` },
      { id: "bet-five-12", title: "Episode 12", caption: "", orientation: "vertical", src: `${R2_BASE}/bet-five/12.mp4`, poster: `${R2_BASE}/bet-five/12.jpg` },
      { id: "bet-five-13", title: "Episode 13", caption: "", orientation: "vertical", src: `${R2_BASE}/bet-five/13.mp4`, poster: `${R2_BASE}/bet-five/13.jpg` },
      { id: "bet-five-14", title: "Episode 14", caption: "", orientation: "vertical", src: `${R2_BASE}/bet-five/14.mp4`, poster: `${R2_BASE}/bet-five/14.jpg` },
      { id: "bet-five-15", title: "Episode 15", caption: "", orientation: "vertical", src: `${R2_BASE}/bet-five/15.mp4`, poster: `${R2_BASE}/bet-five/15.jpg` },
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
      { id: "rush-hunts-01-boone", title: "Boone", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-hunts/01-boone.mp4`, poster: `${R2_BASE}/rush-hunts/01-boone.jpg` },
      { id: "rush-hunts-02-edgewater", title: "Edgewater", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-hunts/02-edgewater.mp4`, poster: `${R2_BASE}/rush-hunts/02-edgewater.jpg` },
      { id: "rush-hunts-03-jones", title: "Jones", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-hunts/03-jones.mp4`, poster: `${R2_BASE}/rush-hunts/03-jones.jpg` },
      { id: "rush-hunts-04-colonial", title: "Colonial", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-hunts/04-colonial.mp4`, poster: `${R2_BASE}/rush-hunts/04-colonial.jpg` },
      { id: "rush-hunts-05-oak-ridge", title: "Oak Ridge", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-hunts/05-oak-ridge.mp4`, poster: `${R2_BASE}/rush-hunts/05-oak-ridge.jpg` },
      { id: "rush-hunts-06-apopka", title: "Apopka", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-hunts/06-apopka.mp4`, poster: `${R2_BASE}/rush-hunts/06-apopka.jpg` },
      { id: "rush-hunts-07-wekiva", title: "Wekiva", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-hunts/07-wekiva.mp4`, poster: `${R2_BASE}/rush-hunts/07-wekiva.jpg` },
      { id: "rush-hunts-08-west-orange", title: "West Orange", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-hunts/08-west-orange.mp4`, poster: `${R2_BASE}/rush-hunts/08-west-orange.jpg` },
      { id: "rush-hunts-09-windermere", title: "Windermere", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-hunts/09-windermere.mp4`, poster: `${R2_BASE}/rush-hunts/09-windermere.jpg` },
      { id: "rush-hunts-10-dr-philips", title: "Dr. Philips", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-hunts/10-dr-philips.mp4`, poster: `${R2_BASE}/rush-hunts/10-dr-philips.jpg` },
      { id: "rush-hunts-11-ucf", title: "UCF", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-hunts/11-ucf.mp4`, poster: `${R2_BASE}/rush-hunts/11-ucf.jpg` },
      { id: "rush-hunts-12-university", title: "University", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-hunts/12-university.mp4`, poster: `${R2_BASE}/rush-hunts/12-university.jpg` },
      { id: "rush-hunts-13-timber-creek", title: "Timber Creek", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-hunts/13-timber-creek.mp4`, poster: `${R2_BASE}/rush-hunts/13-timber-creek.jpg` },
      { id: "rush-hunts-14-lake-nona", title: "Lake Nona", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-hunts/14-lake-nona.mp4`, poster: `${R2_BASE}/rush-hunts/14-lake-nona.jpg` },
      { id: "rush-hunts-15-olympia", title: "Olympia", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-hunts/15-olympia.mp4`, poster: `${R2_BASE}/rush-hunts/15-olympia.jpg` },
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
      { id: "you-got-game-01", title: "Episode 01", caption: "", orientation: "vertical", src: `${R2_BASE}/you-got-game/01.mp4`, poster: `${R2_BASE}/you-got-game/01.jpg` },
      { id: "you-got-game-02", title: "Episode 02", caption: "", orientation: "vertical", src: `${R2_BASE}/you-got-game/02.mp4`, poster: `${R2_BASE}/you-got-game/02.jpg` },
      { id: "you-got-game-03", title: "Episode 03", caption: "", orientation: "vertical", src: `${R2_BASE}/you-got-game/03.mp4`, poster: `${R2_BASE}/you-got-game/03.jpg` },
      { id: "you-got-game-04", title: "Episode 04", caption: "", orientation: "vertical", src: `${R2_BASE}/you-got-game/04.mp4`, poster: `${R2_BASE}/you-got-game/04.jpg` },
      { id: "you-got-game-05", title: "Episode 05", caption: "", orientation: "vertical", src: `${R2_BASE}/you-got-game/05.mp4`, poster: `${R2_BASE}/you-got-game/05.jpg` },
      { id: "you-got-game-06", title: "Episode 06", caption: "", orientation: "vertical", src: `${R2_BASE}/you-got-game/06.mp4`, poster: `${R2_BASE}/you-got-game/06.jpg` },
      { id: "you-got-game-07", title: "Episode 07", caption: "", orientation: "vertical", src: `${R2_BASE}/you-got-game/07.mp4`, poster: `${R2_BASE}/you-got-game/07.jpg` },
      { id: "you-got-game-08", title: "Episode 08", caption: "", orientation: "vertical", src: `${R2_BASE}/you-got-game/08.mp4`, poster: `${R2_BASE}/you-got-game/08.jpg` },
      { id: "you-got-game-09", title: "Episode 09", caption: "", orientation: "vertical", src: `${R2_BASE}/you-got-game/09.mp4`, poster: `${R2_BASE}/you-got-game/09.jpg` },
      { id: "you-got-game-10", title: "Episode 10", caption: "", orientation: "vertical", src: `${R2_BASE}/you-got-game/10.mp4`, poster: `${R2_BASE}/you-got-game/10.jpg` },
      { id: "you-got-game-11", title: "Episode 11", caption: "", orientation: "vertical", src: `${R2_BASE}/you-got-game/11.mp4`, poster: `${R2_BASE}/you-got-game/11.jpg` },
      { id: "you-got-game-12", title: "Episode 12", caption: "", orientation: "vertical", src: `${R2_BASE}/you-got-game/12.mp4`, poster: `${R2_BASE}/you-got-game/12.jpg` },
      { id: "you-got-game-13", title: "Episode 13", caption: "", orientation: "vertical", src: `${R2_BASE}/you-got-game/13.mp4`, poster: `${R2_BASE}/you-got-game/13.jpg` },
      { id: "you-got-game-14", title: "Episode 14", caption: "", orientation: "vertical", src: `${R2_BASE}/you-got-game/14.mp4`, poster: `${R2_BASE}/you-got-game/14.jpg` },
      { id: "you-got-game-15", title: "Episode 15", caption: "", orientation: "vertical", src: `${R2_BASE}/you-got-game/15.mp4`, poster: `${R2_BASE}/you-got-game/15.jpg` },
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
      { id: "rush-reacts-01-hoe-phase", title: "Hoe Phase", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-reacts/01-hoe-phase.mp4`, poster: `${R2_BASE}/rush-reacts/01-hoe-phase.jpg` },
      { id: "rush-reacts-02-road-trips", title: "Road Trips", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-reacts/02-road-trips.mp4`, poster: `${R2_BASE}/rush-reacts/02-road-trips.jpg` },
      { id: "rush-reacts-03-outside-tweaking", title: "Outside Tweaking", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-reacts/03-outside-tweaking.mp4`, poster: `${R2_BASE}/rush-reacts/03-outside-tweaking.jpg` },
      { id: "rush-reacts-04-outside-tweaking", title: "Outside Tweaking", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-reacts/04-outside-tweaking.mp4`, poster: `${R2_BASE}/rush-reacts/04-outside-tweaking.jpg` },
      { id: "rush-reacts-05-cheetah-print", title: "Cheetah Print", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-reacts/05-cheetah-print.mp4`, poster: `${R2_BASE}/rush-reacts/05-cheetah-print.jpg` },
      { id: "rush-reacts-06-which-one", title: "Which One", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-reacts/06-which-one.mp4`, poster: `${R2_BASE}/rush-reacts/06-which-one.jpg` },
      { id: "rush-reacts-07-amazing-shape", title: "Amazing Shape", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-reacts/07-amazing-shape.mp4`, poster: `${R2_BASE}/rush-reacts/07-amazing-shape.jpg` },
      { id: "rush-reacts-08-bbw", title: "BBW", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-reacts/08-bbw.mp4`, poster: `${R2_BASE}/rush-reacts/08-bbw.jpg` },
      { id: "rush-reacts-09-true-bestie", title: "True Bestie", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-reacts/09-true-bestie.mp4`, poster: `${R2_BASE}/rush-reacts/09-true-bestie.jpg` },
      { id: "rush-reacts-10-wheres-your-stuff-interlude", title: "Where’s Your Stuff Interlude", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-reacts/10-wheres-your-stuff-interlude.mp4`, poster: `${R2_BASE}/rush-reacts/10-wheres-your-stuff-interlude.jpg` },
      { id: "rush-reacts-11-new-bestie", title: "New Bestie", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-reacts/11-new-bestie.mp4`, poster: `${R2_BASE}/rush-reacts/11-new-bestie.jpg` },
      { id: "rush-reacts-12-q-and-a", title: "Q&A", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-reacts/12-q-and-a.mp4`, poster: `${R2_BASE}/rush-reacts/12-q-and-a.jpg` },
      { id: "rush-reacts-13-stuck", title: "Stuck", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-reacts/13-stuck.mp4`, poster: `${R2_BASE}/rush-reacts/13-stuck.jpg` },
      { id: "rush-reacts-14-goose-and-the-juice", title: "Goose and The Juice", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-reacts/14-goose-and-the-juice.mp4`, poster: `${R2_BASE}/rush-reacts/14-goose-and-the-juice.jpg` },
      { id: "rush-reacts-15-princess", title: "Princess", caption: "", orientation: "vertical", src: `${R2_BASE}/rush-reacts/15-princess.mp4`, poster: `${R2_BASE}/rush-reacts/15-princess.jpg` },
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
  /** Runtime as printed on the poster's chip. */
  duration: string;
  /** PLACEHOLDER — the episode card's thumbnail (the clip's own frame until
      real art comes). */
  thumbnail: string;
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
