/**
 * HERO CONTENT — section 1 (mockup 1.png).
 *
 * Every visible string in the hero lives here, including the handwritten
 * marker accents. The accents are data rather than markup because each line
 * is written on separately by the motion system, and because their wording is
 * the kind of thing a client changes late.
 *
 * ▸ BACKEND SEAM: replace `hero` with the payload from your CMS. The shape
 *   below is already the contract HeroSection expects.
 */

export interface HandAccentContent {
  /** One entry per handwritten line — each is revealed independently. */
  lines: string[];
}

export interface HeroContent {
  /** Headline line 1, rendered white. */
  titleWhite: string;
  /** Headline line 2, rendered red. */
  titleRed: string;
  /** Sub-copy. Each entry is its own masked line in the reveal. */
  subLines: string[];
  primaryCta: { label: string; href: string };
  /** VIDEO: set `videoUrl` to the story video (YouTube, Vimeo or .mp4). */
  storyVideo: { label: string; videoUrl: string; poster: string; title: string };
  /** Tracked caps block, top-right of the mockup. */
  tags: string[];
  scrollCue: string;
  accents: {
    moreThanContent: HandAccentContent;
    sameCity: HandAccentContent;
    realMoments: HandAccentContent;
  };
  /**
   * HERO PHOTO — client asset. `tall` is used on phones and portrait
   * tablets, `wide` on desktop and landscape.
   * SWAP: drop new files into /public/assets/images and update these paths.
   */
  media: {
    tall: { src: string; width: number; height: number };
    wide: { src: string; width: number; height: number };
    alt: string;
  };
}

export const hero: HeroContent = {
  titleWhite: "You found it.",
  titleRed: "Rush 5our.",
  subLines: [
    "A movement built through",
    "content, community,",
    "challenges, prizes, and",
    "unforgettable moments.",
  ],
  primaryCta: { label: "Join the movement", href: "#concept" },
  storyVideo: {
    label: "Watch\nour story",
    videoUrl: "", // ← paste the story video URL here
    poster: "/assets/images/hero-wide.webp",
    title: "Our story",
  },
  tags: ["Real people.", "Real cities.", "Real rewards."],
  scrollCue: "Scroll to explore",
  accents: {
    moreThanContent: { lines: ["More", "than", "content."] },
    sameCity: { lines: ["Same", "city.", "Different", "game."] },
    realMoments: { lines: ["Real", "moments.", "Real people."] },
  },
  media: {
    tall: { src: "/assets/images/hero-tall.webp", width: 950, height: 1655 },
    wide: { src: "/assets/images/hero-wide.webp", width: 1487, height: 1058 },
    alt: "",
  },
};
