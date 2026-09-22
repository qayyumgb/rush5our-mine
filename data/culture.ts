/**
 * CULTURE CONTENT — section 5, "This is a culture" (mockup 5.png).
 *
 * ▸ BACKEND SEAM: `features` is an array, so the 2x2 grid can grow or shrink
 *   from a CMS without a code change. `icon` is looked up in the shared icon
 *   registry (components/ui/Icon.tsx).
 */

import type { IconName } from "@/components/ui/Icon";

export interface CultureFeature {
  icon: IconName;
  /** Two lines, as drawn in the mockup. */
  title: string[];
  /** Two lines of supporting copy. */
  body: string[];
}

export interface CultureContent {
  eyebrow: string;
  /** The two white headline lines. */
  titleWhite: string[];
  /** The red payoff line. */
  titleRed: string;
  /** Tracked-caps sub-copy, one entry per line. */
  subLines: string[];
  cta: { label: string; href: string };
  features: CultureFeature[];
}

export const culture: CultureContent = {
  eyebrow: "The movement",
  titleWhite: ["This is more", "than content."],
  titleRed: "This is a culture.",
  subLines: [
    "You are not just watching Rush5our grow.",
    "You are a part of the reason it will.",
  ],
  cta: { label: "Join the movement", href: "#faq" },
  features: [
    {
      icon: "globe",
      title: ["Real world", "experiences"],
      body: ["More than online.", "Built for real ones."],
    },
    {
      icon: "community",
      title: ["Loyal", "community"],
      body: ["A tribe that", "moves different."],
    },
    {
      icon: "gift",
      title: ["Exclusive", "rewards"],
      body: ["Early access.", "Special drops."],
    },
    {
      icon: "bolt",
      title: ["Unforgettable", "moments"],
      body: ["More than merch.", "A lasting impact."],
    },
  ],
};
