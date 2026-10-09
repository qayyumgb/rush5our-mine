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

/* ======================================================================== */
/* MERCH PAGE — mockups/Merch/*.png                                          */
/*                                                                          */
/* Presentation lives in components/merch/*. The homepage's merch teaser    */
/* above keeps its own content; the page's sections follow here.            */
/*                                                                          */
/* ARTWORK: the hero photograph and the red brush under its headline are    */
/* lifted from mockups/Merch/1.png — public/assets/images/                  */
/* merch-hero-tall.webp (the mockup with its type filled in from the        */
/* surrounding pixels; the hand-painted notes and the crate's wordmark are  */
/* the photograph's own) and merch-hero-brush.webp (an alpha cut). They are */
/* screen-resolution copies; when the client supplies the originals,        */
/* replace those files and nothing else.                                    */
/* ======================================================================== */

/* ------------------------------------------------------------------------ */
/* Page section 1 — BUILD THE MOVEMENT. (mockups/Merch/1.png)                */
/* ------------------------------------------------------------------------ */

export interface MerchHeroContent {
  /** Headline lines in order; `red` lines are set in the brand red. */
  title: { text: string; red?: boolean }[];
  bodyLines: string[];
  /** BACKEND SEAM: points at the drop further down this page once built. */
  cta: { label: string; href: string };
  tagline: string;
  media: {
    tall: { src: string; width: number; height: number };
    alt: string;
  };
}

export const merchHero: MerchHeroContent = {
  title: [{ text: "Build the" }, { text: "Movement.", red: true }],
  bodyLines: ["Every piece represents the culture.", "Wear it. Live it. Represent it."],
  cta: { label: "Shop the drop", href: "#drop" },
  tagline: "Wear the movement.",
  media: {
    tall: { src: "/assets/images/merch-hero-tall.webp", width: 941, height: 1671 },
    alt: "Two black RUSH 5OUR tees, front and back, on a road case under red light",
  },
};

/* ------------------------------------------------------------------------ */
/* Page section 2 — FEATURED DROP: LEVEL 1: ESSENTIALS (mockups/Merch/2.png) */
/* ------------------------------------------------------------------------ */

export interface MerchDropView {
  /** What the view shows, read out on its thumbnail and dot. */
  label: string;
  thumb: { src: string; width: number; height: number };
  /**
   * The picture shown on the stage for this view. The first view has none:
   * the tee in the section's own photograph is the product. The rest are
   * laid over it.
   */
  stage?: { src: string; width: number; height: number };
}

export interface MerchDropContent {
  eyebrow: string;
  titleWhite: string;
  titleRed: string;
  subline: string;
  /**
   * BACKEND SEAM: one product, as the mockup shows. This maps onto a
   * Shopify product (name, price, description, variants = sizes, images =
   * views); swap it for a fetched product and the section renders it. The
   * "add to cart" link goes to the Shopify checkout once Phase 2 wires it.
   */
  product: {
    name: string;
    price: string;
    descriptionLines: string[];
    sizeLabel: string;
    sizes: string[];
    views: MerchDropView[];
    cta: { label: string; href: string };
  };
}

export const merchDrop: MerchDropContent = {
  eyebrow: "Featured drop",
  titleWhite: "Level 1:",
  titleRed: "Essentials",
  subline: "The foundation of the movement.",
  product: {
    name: "Rush 5our Tee",
    price: "$35.00",
    descriptionLines: ["Premium heavyweight tee.", "Built for the culture."],
    sizeLabel: "Size",
    sizes: ["S", "M", "L", "XL", "XXL"],
    // ARTWORK: the thumbnails are cut from mockups/Merch/2.png; the back
    // view is cut from mockups/Merch/1.png, the logo and label views are the
    // thumbnails enlarged. Replace with product photographs when supplied.
    views: [
      { label: "Front", thumb: { src: "/assets/images/merch-drop-thumb-front.webp", width: 189, height: 177 } },
      {
        label: "Back",
        thumb: { src: "/assets/images/merch-drop-thumb-back.webp", width: 186, height: 177 },
        stage: { src: "/assets/images/merch-drop-view-back.webp", width: 480, height: 720 },
      },
      {
        label: "Logo",
        thumb: { src: "/assets/images/merch-drop-thumb-logo.webp", width: 187, height: 177 },
        stage: { src: "/assets/images/merch-drop-view-logo.webp", width: 560, height: 530 },
      },
      {
        label: "Label",
        thumb: { src: "/assets/images/merch-drop-thumb-label.webp", width: 187, height: 177 },
        stage: { src: "/assets/images/merch-drop-view-label.webp", width: 560, height: 530 },
      },
    ],
    cta: { label: "Add to cart", href: "#drop" },
  },
};

/* ------------------------------------------------------------------------ */
/* Page section 3 — LOCKED FUTURE DROPS (mockups/Merch/3.png)                */
/* ------------------------------------------------------------------------ */

export interface MerchLockedLevel {
  /** "Level 2" */
  level: string;
  name: string;
}

export interface MerchLockedContent {
  eyebrow: string;
  titleWhite: string;
  titleRed: string;
  sublines: string[];
  /**
   * BACKEND SEAM: the locked drops, in order. The mockup shows "Level 2 —
   * Streetwear" and five dots; Levels 2 and 3 carry the homepage's own drop
   * names (see `drops` above), and 4 and 5 are stand-ins until the client
   * names them. All share the one locked picture.
   */
  levels: MerchLockedLevel[];
  /** The status bar under each level: locked, and where to go to unlock. */
  locked: { label: string; href: string; hint: string };
}

export const merchLocked: MerchLockedContent = {
  eyebrow: "Locked",
  titleWhite: "Future",
  titleRed: "Drops",
  sublines: ["Unlock more by being part", "of the movement."],
  levels: [
    { level: "Level 2", name: "Streetwear" },
    { level: "Level 3", name: "Elevated" },
    { level: "Level 4", name: "Classified" },
    { level: "Level 5", name: "Legacy" },
    { level: "Exclusive", name: "???" },
  ],
  locked: { label: "Locked", href: "/join", hint: "Join the movement to unlock" },
};

/* ------------------------------------------------------------------------ */
/* Page section 4 — WHY OUR MERCH MATTERS (mockups/Merch/4.png)              */
/* ------------------------------------------------------------------------ */

export interface MerchWhyContent {
  why: {
    eyebrow: string;
    titleWhite: string;
    titleRed: string;
    /** Each point, one entry per line as the mockup breaks it. */
    points: string[][];
    tagline: string;
  };
  scan: {
    eyebrow: string;
    titleWhite: string;
    titleRed: string;
    /** Paragraphs, one entry per line as the mockup sets them. */
    paragraphs: string[][];
    /** BACKEND SEAM: where the shirt's QR code leads; the Join page until the
        scan landing page exists. */
    cta: { label: string; href: string };
    tagline: string;
  };
  /** Read out for the painted script over the crowd (part of the picture). */
  script: string;
  tagline: string;
}

export const merchWhy: MerchWhyContent = {
  why: {
    eyebrow: "More than merch.",
    titleWhite: "Why our",
    titleRed: "merch matters",
    points: [
      ["You’re not just buying clothes."],
      ["You’re supporting the movement."],
      ["You’re repping something bigger."],
      ["Every drop supports bigger prizes,", "more hunts, and more content."],
      ["You wear it. The culture grows."],
    ],
    tagline: "Real people. Real impact.",
  },
  scan: {
    eyebrow: "Scan. Connect. Unlock.",
    titleWhite: "Bigger than",
    titleRed: "a shirt.",
    paragraphs: [
      ["Every piece features a scannable", "QR code on the outside."],
      [
        "It’s more than a link — it’s your direct",
        "access into our world. Scan it to unlock",
        "exclusive content, enter drops, join hunts,",
        "get rewards, and be part of what’s next.",
      ],
    ],
    cta: { label: "Scan. Be part of it.", href: "/join" },
    tagline: "Real connections. Real opportunity.",
  },
  script: "It’s bigger than clothes.",
  tagline: "A stronger tomorrow.",
};

/* ------------------------------------------------------------------------ */
/* Page section 5 — WEAR THE MOVEMENT. REP THE CULTURE. (mockups/Merch/5.png) */
/* ------------------------------------------------------------------------ */

export interface MerchCloseContent {
  /** Read out for the wordmark artwork at the top. */
  mark: string;
  eyebrow: string;
  titleWhite: string[];
  titleRed: string[];
  bodyLines: string[];
  /** BACKEND SEAM: the featured drop on this page until the Shopify store
      (Phase 2B) gives "all merch" a page of its own. */
  cta: { label: string; href: string };
  taglines: string[];
}

export const merchClose: MerchCloseContent = {
  mark: "RUSH 5OUR",
  eyebrow: "More than merch.",
  titleWhite: ["Wear the", "movement."],
  titleRed: ["Rep the", "culture."],
  bodyLines: [
    "This isn’t just merch.",
    "It’s a symbol of being early.",
    "A symbol of believing in something real.",
    "A symbol of YOU.",
  ],
  cta: { label: "Shop all merch", href: "#drop" },
  taglines: ["Bigger than clothes.", "A stronger tomorrow."],
};
