/**
 * RUSH HUNTS PAGE CONTENT — mockups/Rush Hunts/*.png
 *
 * Presentation lives in components/hunts/*; this file holds only the words
 * and links, so copy can be edited — or swapped for a CMS fetch — without
 * touching a component. Mirrors data/about.ts and data/contact.ts.
 *
 * ARTWORK: the hero photograph and the red "Curiosity pays off." script are
 * lifted from mockups/Rush Hunts/1.png — public/assets/images/
 * hunts-hero-tall.webp (the mockup with its type filled in from the
 * surrounding pixels) and hunts-hero-script.webp (an alpha cut). They are
 * screen-resolution copies; when the client supplies the originals, replace
 * those files and nothing else.
 */

/* ------------------------------------------------------------------------ */
/* Section 1 — YOU FOUND A RUSH HUNT STICKER (mockups/Rush Hunts/1.png)      */
/* ------------------------------------------------------------------------ */

export interface HuntsHeroContent {
  /** Headline lines in order; `red` lines are set in the brand red. */
  title: { text: string; red?: boolean }[];
  /** Read out for the script artwork under the headline. */
  script: string;
  bodyLines: string[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  /** The three-beat line at the foot; doubles as the scroll cue. */
  cue: { label: string; href: string };
  media: {
    tall: { src: string; width: number; height: number };
    alt: string;
  };
}

export const huntsHero: HuntsHeroContent = {
  title: [
    { text: "You found a" },
    { text: "Rush Hunt", red: true },
    { text: "sticker." },
  ],
  script: "Curiosity pays off.",
  bodyLines: [
    "RUSH HUNTS are real-world QR scavenger hunts",
    "with real rewards. Find a sticker, scan it, follow",
    "the instructions, and unlock your chance to win.",
  ],
  primaryCta: { label: "Claim your find", href: "/contact#form" },
  secondaryCta: { label: "Watch Rush Hunts", href: "/#videos" },
  // BACKEND SEAM: points at the next section of this page once it exists.
  cue: { label: "Find it. Scan it. Claim it.", href: "#how" },
  media: {
    tall: { src: "/assets/images/hunts-hero-tall.webp", width: 950, height: 1655 },
    alt: "",
  },
};

export default huntsHero;

/* ------------------------------------------------------------------------ */
/* Section 2 — HOW RUSH HUNTS WORK (mockups/Rush Hunts/2.png)                */
/* ------------------------------------------------------------------------ */

export interface HuntsStep {
  /** The step's mark, lifted from the mockup as an alpha image. */
  icon: { src: string; width: number; height: number };
  titleWhite: string;
  titleRed: string;
  /** Body copy, one entry per line as the mockup sets it. */
  body: string[];
}

export interface HuntsStepsContent {
  eyebrow: string;
  titleWhite: string;
  titleRed: string;
  subline: string;
  /** BACKEND SEAM: numbered in order; the list takes any number of steps. */
  steps: HuntsStep[];
  /** Read out for the script artwork at the foot. */
  script: string;
}

export const huntsSteps: HuntsStepsContent = {
  eyebrow: "Rush Hunts",
  titleWhite: "How Rush Hunts",
  titleRed: "Work",
  subline: "Four steps. Real rewards.",
  steps: [
    {
      icon: { src: "/assets/images/hunts-steps-find.webp", width: 130, height: 138 },
      titleWhite: "Find a",
      titleRed: "sticker",
      body: ["RUSH HUNT stickers are hidden", "in real places around the city."],
    },
    {
      icon: { src: "/assets/images/hunts-steps-qr.webp", width: 130, height: 138 },
      titleWhite: "Scan the",
      titleRed: "QR code",
      body: ["Scan the code on the sticker to", "unlock the hunt and follow the", "instructions."],
    },
    {
      icon: { src: "/assets/images/hunts-steps-proof.webp", width: 130, height: 138 },
      titleWhite: "Post",
      titleRed: "proof",
      body: ["Complete the challenge and", "post proof. Tag @RUSH5OUR", "and use #RUSHHUNTS."],
    },
    {
      icon: { src: "/assets/images/hunts-steps-win.webp", width: 130, height: 138 },
      titleWhite: "Win",
      titleRed: "rewards",
      body: ["Win cash, merch, mystery gifts,", "features, and exclusive", "opportunities."],
    },
  ],
  script: "Find it. Scan it. Claim it.",
};

/* ------------------------------------------------------------------------ */
/* Section 3 — LIVE REWARDS (mockups/Rush Hunts/3.png)                       */
/* ------------------------------------------------------------------------ */

export interface HuntsReward {
  /** The reward's mark, lifted from the mockup as an alpha image. */
  icon: { src: string; width: number; height: number };
  /** Optional: a title can be red alone, as "Features" is. */
  titleWhite?: string;
  titleRed: string;
  /** Body copy, one entry per line as the mockup sets it. */
  body: string[];
}

export interface HuntsRewardsContent {
  eyebrow: string;
  titleWhite: string;
  titleRed: string;
  subline: string;
  /** BACKEND SEAM: the list takes any number of rewards. */
  rewards: HuntsReward[];
  /** Read out for the script artwork at the foot. */
  script: string;
}

export const huntsRewards: HuntsRewardsContent = {
  eyebrow: "Rush Hunts",
  titleWhite: "Live",
  titleRed: "Rewards",
  subline: "Real hunts. Real rewards.",
  rewards: [
    {
      icon: { src: "/assets/images/hunts-rewards-cash.webp", width: 190, height: 150 },
      titleWhite: "Cash",
      titleRed: "prizes",
      body: ["Real money.", "Real winners."],
    },
    {
      icon: { src: "/assets/images/hunts-rewards-merch.webp", width: 190, height: 150 },
      titleWhite: "Exclusive",
      titleRed: "merch",
      body: ["Limited drops only", "for winners."],
    },
    {
      icon: { src: "/assets/images/hunts-rewards-gift.webp", width: 190, height: 150 },
      titleWhite: "Mystery",
      titleRed: "gifts",
      body: ["You never know", "what you’ll get."],
    },
    {
      icon: { src: "/assets/images/hunts-rewards-star.webp", width: 190, height: 150 },
      titleRed: "Features",
      body: ["Get featured on our", "socials & YouTube."],
    },
    {
      icon: { src: "/assets/images/hunts-rewards-clue.webp", width: 190, height: 150 },
      titleWhite: "Clue",
      titleRed: "drops",
      body: ["Unlock clues to", "find more stickers."],
    },
    {
      icon: { src: "/assets/images/hunts-rewards-events.webp", width: 190, height: 150 },
      titleWhite: "Exclusive",
      titleRed: "events",
      body: ["Invites to private", "events & meetups."],
    },
  ],
  script: "More than rewards. A bigger experience.",
};

/* ------------------------------------------------------------------------ */
/* Section 4 — HUNT MAP (mockups/Rush Hunts/4.png)                           */
/* ------------------------------------------------------------------------ */

export type HuntPinKind = "active" | "recent" | "special";

export interface HuntPin {
  kind: HuntPinKind;
  /** Position on the map artwork, in its own 950 x 620 pixels. */
  x: number;
  y: number;
  /** Read out for the pin. */
  label: string;
}

export interface NearbyHunt {
  name: string;
  distance: string;
  href: string;
}

export interface HuntsMapContent {
  eyebrow: string;
  titleWhite: string;
  titleRed: string;
  subline: string;
  /** Body copy, one entry per line; `strong` lines are set in full white. */
  body: { text: string; strong?: boolean }[];
  legend: { kind: HuntPinKind; label: string }[];
  /**
   * BACKEND SEAM: the map is artwork lifted from the mockup, not a live map.
   * Pins are placed on that picture by pixel. When a real map (Mapbox,
   * Google Maps) replaces it, swap `pins` for coordinates and render them
   * with that map's markers.
   */
  map: {
    src: string;
    width: number;
    height: number;
    alt: string;
    city: string;
    pins: HuntPin[];
  };
  /** Read out for the script artwork over the map. */
  script: string;
  /** BACKEND SEAM: points at the full map once that page exists. */
  locate: { label: string; href: string };
  nearby: {
    titleWhite: string;
    titleRed: string;
    viewAll: { label: string; href: string };
    /** BACKEND SEAM: the list takes any number of hunts. */
    hunts: NearbyHunt[];
    cta: { label: string; href: string };
  };
  foot: string;
}

export const huntsMap: HuntsMapContent = {
  eyebrow: "Rush Hunts",
  titleWhite: "Hunt",
  titleRed: "Map",
  subline: "Real city. Real stickers. Real opportunities.",
  body: [
    { text: "Stickers are hidden all over the city." },
    { text: "New drops happen weekly." },
    { text: "Find a location. Make a move.", strong: true },
  ],
  legend: [
    { kind: "active", label: "Active hunt" },
    { kind: "recent", label: "Recent find" },
    { kind: "special", label: "Special drop" },
  ],
  map: {
    src: "/assets/images/hunts-map-city.webp",
    width: 950,
    height: 620,
    alt: "Map of Orlando, Florida, marked with Rush Hunt locations",
    city: "Orlando, FL",
    pins: [
      { kind: "recent", x: 468, y: 188, label: "Recent find" },
      { kind: "special", x: 695, y: 194, label: "Special drop" },
      { kind: "active", x: 310, y: 236, label: "Active hunt" },
      { kind: "active", x: 566.5, y: 251.5, label: "Active hunt" },
      { kind: "active", x: 694.5, y: 268.5, label: "Active hunt" },
      { kind: "recent", x: 626, y: 388, label: "Recent find" },
      { kind: "active", x: 747.5, y: 410, label: "Active hunt" },
      { kind: "active", x: 313, y: 441.5, label: "Active hunt" },
      { kind: "active", x: 475, y: 468.5, label: "Active hunt" },
      { kind: "special", x: 308, y: 518, label: "Special drop" },
    ],
  },
  script: "Same city. Bigger hunts.",
  locate: { label: "Use My Location", href: "#hunt-map" },
  nearby: {
    titleWhite: "Nearby",
    titleRed: "hunts",
    viewAll: { label: "View all", href: "#hunt-map" },
    hunts: [
      { name: "Downtown Orlando", distance: "0.8 mi", href: "#hunt-map" },
      { name: "Lake Eola", distance: "1.4 mi", href: "#hunt-map" },
      { name: "Millenia", distance: "2.1 mi", href: "#hunt-map" },
    ],
    cta: { label: "View full map", href: "#hunt-map" },
  },
  foot: "Explore. Find. Claim. Repeat.",
};

/* ------------------------------------------------------------------------ */
/* Section 5 — FOUND IN THE WILD (mockups/Rush Hunts/5.png)                  */
/* ------------------------------------------------------------------------ */

export interface CommunityFind {
  /** The find's number, as printed: "#038". */
  number: string;
  status: string;
  /** Where it was found, under the number. */
  place: string;
  /** The chip over the photograph. */
  location: string;
  reward: string;
  photo: { src: string; width: number; height: number; alt: string };
  href: string;
}

export interface HuntsFindsContent {
  eyebrow: string;
  titleWhite: string;
  titleRed: string;
  subline: string;
  rewardLabel: string;
  /**
   * BACKEND SEAM: the carousel takes any number of finds. The first is the
   * mockup's own; the mockup shows only the edge of the second, so its
   * reward, and the three after it, are stand-ins. Their photographs are
   * crops of the hero picture. Replace with real finds.
   */
  finds: CommunityFind[];
  swipe: string;
  cta: { label: string; href: string };
  foot: string;
}

export const huntsFinds: HuntsFindsContent = {
  eyebrow: "Community finds",
  titleWhite: "Found in",
  titleRed: "the wild.",
  subline: "Real people. Real finds. Real winners.",
  rewardLabel: "Reward",
  finds: [
    {
      number: "#038",
      status: "Found",
      place: "Downtown Orlando",
      location: "Orlando, FL",
      reward: "$100",
      photo: {
        src: "/assets/images/hunts-finds-1.webp",
        width: 634,
        height: 476,
        alt: "A Rush Hunt sticker on a pole in downtown Orlando at night",
      },
      href: "#finds",
    },
    {
      number: "#037",
      status: "Found",
      place: "Found near Park Ave",
      location: "Winter Park",
      reward: "$50",
      photo: {
        src: "/assets/images/hunts-finds-2.webp",
        width: 634,
        height: 476,
        alt: "A Rush Hunt sticker on a pole beside a dark street",
      },
      href: "#finds",
    },
    {
      number: "#036",
      status: "Found",
      place: "Lake Eola Park",
      location: "Orlando, FL",
      reward: "$75",
      photo: {
        src: "/assets/images/hunts-finds-3.webp",
        width: 634,
        height: 476,
        alt: "Red light reflected on a wet street at night",
      },
      href: "#finds",
    },
    {
      number: "#035",
      status: "Found",
      place: "Mall at Millenia",
      location: "Millenia",
      reward: "Merch",
      photo: {
        src: "/assets/images/hunts-finds-4.webp",
        width: 634,
        height: 476,
        alt: "A Rush Hunt sticker on a pole at night",
      },
      href: "#finds",
    },
    {
      number: "#034",
      status: "Found",
      place: "Mills 50 District",
      location: "Orlando, FL",
      reward: "$100",
      photo: {
        src: "/assets/images/hunts-finds-5.webp",
        width: 634,
        height: 476,
        alt: "A Rush Hunt sticker, close up",
      },
      href: "#finds",
    },
  ],
  swipe: "Swipe the finds",
  // BACKEND SEAM: points at the community gallery once that page exists.
  cta: { label: "See all community finds", href: "#finds" },
  foot: "Found one? Your story could be next.",
};

/* ------------------------------------------------------------------------ */
/* Section 6 — THE HUNT HAS STARTED (mockups/Rush Hunts/6.png)               */
/* ------------------------------------------------------------------------ */

export interface HuntsClosingContent {
  eyebrow: string;
  /** Headline lines in order; the `red` line is italic, over a brush stroke. */
  title: { text: string; red?: boolean }[];
  /** The four-beat line; the `red` run closes it. */
  strap: { text: string; red?: boolean }[];
  bodyLines: string[];
  shout: string;
  cta: { label: string; href: string };
  /** Read out for the wordmark artwork at the foot. */
  mark: string;
  tag: string;
}

export const huntsClosing: HuntsClosingContent = {
  eyebrow: "Rush Hunts",
  title: [
    { text: "The hunt" },
    { text: "has started." },
    { text: "Are you in?", red: true },
  ],
  strap: [
    { text: "Find it." },
    { text: "Scan it." },
    { text: "Prove it." },
    { text: "Win it.", red: true },
  ],
  bodyLines: [
    "This is more than a game.",
    "This is a movement.",
    "You’re not just watching RUSH HUNTS.",
  ],
  shout: "You can be part of the next one.",
  // → "/join" when the Join The Movement page is built.
  cta: { label: "Join the movement", href: "/#culture" },
  mark: "RUSH 5OUR",
  tag: "The hunt is real.",
};
