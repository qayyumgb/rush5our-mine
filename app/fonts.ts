/**
 * FONTS — loaded with next/font/local (self-hosted, zero layout shift).
 *
 * ┌─────────────┬──────────────┬──────────────────────────────────────────┐
 * │ CSS var     │ Current file │ Used for                                 │
 * ├─────────────┼──────────────┼──────────────────────────────────────────┤
 * │ --font-display │ Anton     │ Headlines, logo wordmark, card titles    │
 * │ --font-cond    │ Oswald    │ Buttons, filter tabs                     │
 * │ --font-body    │ Inter     │ Body copy + tracked caps                 │
 * │ --font-hand    │ Sedgwick  │ Handwritten marker accents               │
 * └─────────────┴──────────────┴──────────────────────────────────────────┘
 *
 * ▸ FONT SWAP (when the client supplies licensed fonts):
 *   1. Drop the new .woff2 into /public/assets/fonts/
 *   2. Change `src` below to the new filename.
 *   3. Update the `ascent-override` / `descent-override` declarations to the
 *      new font's metrics, and update the matching `--cap-*` value in
 *      globals.css (cap-height ÷ unitsPerEm). Those two numbers are what keep
 *      the mockup spacing pixel-exact — see the `.cz` cap-trim utility.
 *
 * The overrides below are the real metrics of each current font. They pin the
 * line box so `.cz` can trim leading down to the cap-height, which is how the
 * measured mockup gaps stay true across operating systems.
 */
import localFont from "next/font/local";

/** Anton — heavy condensed display. Headlines and the logo. */
export const displayFont = localFont({
  src: "../public/assets/fonts/anton.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-display",
  // Fallback chain kept narrow so an unloaded state still reads condensed.
  fallback: ["Anton", "Impact", "Arial Narrow", "sans-serif"],
  adjustFontFallback: false,
  declarations: [
    { prop: "ascent-override", value: "117.6%" },
    { prop: "descent-override", value: "32.9%" },
    { prop: "line-gap-override", value: "0%" },
  ],
});

/** Oswald — condensed UI face. Buttons and filter tabs. */
export const condensedFont = localFont({
  src: "../public/assets/fonts/oswald-var.woff2",
  weight: "200 700",
  style: "normal",
  display: "swap",
  variable: "--font-cond",
  fallback: ["Oswald", "Arial Narrow", "sans-serif"],
  adjustFontFallback: false,
  declarations: [
    { prop: "ascent-override", value: "119.3%" },
    { prop: "descent-override", value: "28.9%" },
    { prop: "line-gap-override", value: "0%" },
  ],
});

/** Inter — body copy and the wide-tracked caps used throughout. */
export const bodyFont = localFont({
  src: "../public/assets/fonts/inter-var.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-body",
  fallback: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
  adjustFontFallback: false,
  declarations: [
    { prop: "ascent-override", value: "96.9%" },
    { prop: "descent-override", value: "24.1%" },
    { prop: "line-gap-override", value: "0%" },
  ],
});

/** Sedgwick Ave — marker script for the handwritten accents. */
export const handFont = localFont({
  src: "../public/assets/fonts/sedgwick-ave.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-hand",
  fallback: ["Sedgwick Ave", "Permanent Marker", "cursive"],
  adjustFontFallback: false,
  declarations: [
    { prop: "ascent-override", value: "93.7%" },
    { prop: "descent-override", value: "31.2%" },
    { prop: "line-gap-override", value: "0%" },
  ],
});

/** Every font variable, ready to drop on <html>. */
export const fontVariables = [
  displayFont.variable,
  condensedFont.variable,
  bodyFont.variable,
  handFont.variable,
].join(" ");
