/**
 * MERCH CONTENT — section 4, "Rep the movement" (mockup 4.png).
 *
 * ▸ BACKEND SEAM: `productSlides` and `drops` map cleanly onto a commerce
 *   API (Shopify, Stripe, a custom store). Swap them for fetched data and
 *   pass into <MerchSection products={...} drops={...} />.
 *
 * ▸ IMAGES: the current product shots are cut from the client mockup. Replace
 *   each `src` with a real photograph — square-ish, product centred, dark
 *   background. Locked drops are blurred automatically by the stylesheet, so
 *   a real (unreleased) product photo can be dropped in without redacting it.
 */

export interface ProductSlide {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface MerchBadge {
  icon: "diamond" | "globe" | "community";
  /** Two lines, as drawn in the mockup. */
  label: string[];
}

export interface DropCard {
  id: string;
  /** "Level 1", "Exclusive", … */
  level: string;
  /** "Drop 01", "Special drop", … */
  kicker: string;
  name: string;
  image: string;
  unlocked: boolean;
  /** Where an unlocked drop links to. */
  href?: string;
}

export interface MerchContent {
  eyebrow: string;
  titleWhite: string;
  titleRed: string;
  /** Sub-copy; `bold` is the emphasised tail of the last line. */
  subLines: string[];
  subBold: string;
  cta: { label: string; href: string };
  badges: MerchBadge[];
  accent: { lines: string[] };
  progression: {
    eyebrow: string;
    titleWhite: string;
    titleRed: string;
    intro: string[];
  };
  bar: {
    accent: { lines: string[] };
    tags: string[];
    /** Brand graphic on the right of the bar. SWAP for the real file. */
    art: string;
  };
}

export const merch: MerchContent = {
  eyebrow: "Drop 01 — Blackout",
  titleWhite: "Rep the",
  titleRed: "Movement",
  subLines: ["More than merch. It's a symbol", "for the ones who were here "],
  subBold: "early.",
  // SHOP LINK: point at the store.
  cta: { label: "View all merch", href: "#" },
  badges: [
    { icon: "diamond", label: ["Premium", "quality"] },
    { icon: "globe", label: ["Made for", "the streets"] },
    { icon: "community", label: ["Limited", "supply"] },
  ],
  accent: { lines: ["Same", "people", "different", "level."] },

  progression: {
    eyebrow: "Progression",
    titleWhite: "Locked future ",
    titleRed: "drops",
    intro: [
      "The deeper you go, the more you unlock. Exclusive merch, early access,",
      "and special drops — only for the real ones.",
    ],
  },

  bar: {
    accent: { lines: ["Real", "support", "unlocks", "more."] },
    tags: ["Stay active.", "Rep the movement.", "Unlock what's next."],
    art: "/assets/images/merch-bar-r5.webp",
  },
};

/** The product carousel beside the headline. */
export const productSlides: ProductSlide[] = [
  {
    src: "/assets/images/merch-tee.webp",
    alt: "RUSH 5OUR Blackout tee, front",
    width: 518,
    height: 536,
  },
  {
    src: "/assets/images/merch-chaotic.webp",
    alt: "Chaotic System — Built Different tee, back print",
    width: 560,
    height: 560,
  },
  {
    src: "/assets/images/drop-1-blackout.webp",
    alt: "RUSH 5OUR Blackout tee, detail",
    width: 414,
    height: 233,
  },
];

/** The 2x2 progression grid. */
export const drops: DropCard[] = [
  {
    id: "blackout",
    level: "Level 1",
    kicker: "Drop 01",
    name: "Blackout",
    image: "/assets/images/drop-1-blackout.webp",
    unlocked: true,
    href: "#",
  },
  {
    id: "streetwear",
    level: "Level 2",
    kicker: "Drop 02",
    name: "Streetwear",
    image: "/assets/images/drop-2-streetwear.webp",
    unlocked: false,
  },
  {
    id: "elevated",
    level: "Level 3",
    kicker: "Drop 03",
    name: "Elevated",
    image: "/assets/images/drop-3-elevated.webp",
    unlocked: false,
  },
  {
    id: "exclusive",
    level: "Exclusive",
    kicker: "Special drop",
    name: "???",
    image: "/assets/images/drop-4-exclusive.webp",
    unlocked: false,
  },
];
