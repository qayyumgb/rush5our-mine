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
