/**
 * CONCEPT CONTENT — section 2, "What is RUSH 5OUR?" (mockup 2.png).
 *
 * ▸ BACKEND SEAM: the three cards are an array, so a CMS can add, reorder or
 *   retire one without a code change. `icon` is looked up in the shared icon
 *   registry (components/ui/Icon.tsx).
 */

import type { IconName } from "@/components/ui/Icon";

export interface ConceptCard {
  /** Displayed as "01", "02", … */
  number: string;
  title: string;
  /** Each entry is its own line, matching the ragged breaks in the mockup. */
  body: string[];
  icon: IconName;
  /** Two-line link label, as drawn in the mockup. */
  linkLabel: string[];
  linkHref: string;
  /**
   * Title font size in mockup pixels. The three titles are optically sized
   * to fill the same width despite different lengths, so each carries its
   * own value rather than sharing one.
   */
  titleSize: number;
  /** Body size in mockup px; card 3 runs smaller to fit its longer copy. */
  bodySize?: number;
}

export interface ConceptContent {
  eyebrow: string;
  titleWhite: string;
  titleRed: string;
  /** The "?" is white while the words before it are red. */
  titleTail: string;
  intro: string[];
  accent: { lines: string[] };
  cards: ConceptCard[];
  cta: {
    tags: string[];
    accent: { lines: string[] };
    button: { label: string; href: string };
  };
  scrollCue: string;
}

export const concept: ConceptContent = {
  eyebrow: "The concept",
  titleWhite: "What is",
  titleRed: "Rush 5our",
  titleTail: "?",
  intro: [
    "We turn real-world moments into",
    "experiences people can actually",
    "be a part of.",
  ],
  accent: { lines: ["It's", "bigger", "than", "just", "videos."] },

  cards: [
    {
      number: "01",
      title: "Content",
      body: [
        "IRL videos, challenges,",
        "public interactions, and",
        "real-life moments —",
        "filmed on the street,",
        "not in a studio.",
      ],
      icon: "play",
      linkLabel: ["Watch", "the videos"],
      linkHref: "#videos",
      titleSize: 46.5,
    },
    {
      number: "02",
      title: "Rush hunts",
      body: [
        "QR sticker scavenger",
        "hunts with real rewards",
        "hidden across the city.",
        "Scan it first, keep",
        "what's inside.",
      ],
      icon: "qr",
      linkLabel: ["Learn how", "it works"],
      linkHref: "#hunts",
      titleSize: 41.9,
    },
    {
      number: "03",
      title: "The movement",
      body: [
        "A community of supporters",
        "building a culture bigger",
        "than content. If you're here,",
        "you're early.",
      ],
      icon: "community",
      linkLabel: ["Be a part", "of it"],
      linkHref: "#merch",
      titleSize: 38.4,
      bodySize: 18.3,
    },
  ],

  cta: {
    tags: ["Real people.", "Real rewards.", "Real opportunities."],
    accent: { lines: ["Build", "the movement."] },
    button: { label: "Join the movement", href: "#culture" },
  },

  scrollCue: "Scroll for more",
};
