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
 *   This matters most where a video is already real: "$5 or mystery gift"
 *   plays the genuine TikTok but still shows mockup figures beside it.
 *
 *   Real view counts are NOT available from the oEmbed endpoint that supplies
 *   our thumbnails — it returns no engagement fields at all. They require
 *   TikTok's Display API (OAuth as @rush5our, `video.list` scope). See the
 *   "Video metrics" section of the README.
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
    thumbnail: "/assets/images/thumb-30-seconds.webp",
    thumbnailPosition: "50% 0%",
    duration: "6:08",
    category: "girls",
    videoUrl: "",
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
    thumbnail: "/assets/images/thumb-30-seconds.webp",
    thumbnailPosition: "100% 50%",
    duration: "6:08",
    views: "125K",
    category: "girls",
    videoUrl: "",
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
