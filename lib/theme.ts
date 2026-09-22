/**
 * THEME TOKENS — the single source of truth for brand values in TypeScript.
 *
 * These mirror the CSS custom properties declared in `app/globals.css`.
 * Use the CSS variables for styling; use this module when a value is needed
 * in JS (GSAP tweens, canvas, meta tags, structured data, etc.) so the two
 * never drift apart.
 *
 * Colours were sampled directly from the client mockups.
 */

export const colors = {
  /** Primary brand red — sampled from the mockup headlines and CTAs. */
  red: "#EB151F",
  /** Same red as an "r, g, b" triplet for rgba() composition. */
  redRgb: "235, 21, 31",
  /** Hotter red used for neon cores and hover states. */
  redHot: "#FF2B2B",

  /** Page background — near-black, not pure black. */
  black: "#040404",
  /** Raised card surface. */
  card: "#0D0D0E",

  white: "#F4F4F4",
  muted: "#BDBDBD",
  dim: "#8A8A8A",
  line: "rgba(255, 255, 255, 0.16)",
} as const;

export const fonts = {
  display: "var(--font-display)",
  condensed: "var(--font-cond)",
  body: "var(--font-body)",
  hand: "var(--font-hand)",
} as const;

/**
 * MOCKUP REFERENCE WIDTHS.
 *
 * The client mockups are phone frames. Every measured size in the section
 * stylesheets is written as `calc(N * var(--u))`, where N is the literal pixel
 * value read off the mockup and `--u` scales that mockup pixel to the viewport.
 * Keeping these numbers here documents where `--u` and `--hu` come from.
 */
export const mockup = {
  /** Hero mockup (1.png) is 882 x 1536. */
  heroWidth: 882,
  heroHeight: 1536,
  /** Sections 2-6 mockups are 950 wide. */
  sectionWidth: 950,
  /** Section columns stop growing past this, becoming a centred column. */
  sectionMaxWidth: 1040,
} as const;

/** Easing curves. `r5` / `r5.inOut` are registered with GSAP CustomEase. */
export const easing = {
  /** cubic-bezier equivalent of the `r5` CustomEase, for CSS transitions. */
  out: "cubic-bezier(.16, 1, .3, 1)",
  gsapOut: "r5",
  gsapInOut: "r5.inOut",
} as const;

export const theme = { colors, fonts, mockup, easing } as const;

export default theme;
