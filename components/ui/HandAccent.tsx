/**
 * HAND ACCENT — the handwritten marker notes scattered through the mockups.
 *
 * Each line is its own element so the motion system can "write" them one at
 * a time (see `writeHand`), and the underline is a single SVG path with
 * `pathLength="1"` so it strokes on with a dash offset of 1 → 0 regardless of
 * its real length.
 *
 * Purely decorative: the wrapper is `aria-hidden`, since the same message is
 * always carried by real copy nearby.
 *
 * Positioning, size, rotation and colour all come from the section's own
 * stylesheet via `className` — the mockups place every accent differently.
 */

import styles from "./HandAccent.module.css";

/** Underline curves, matched to the sweep in each mockup. */
export const UNDERLINES = {
  /** Long shallow sweep — hero "more than content", concept, merch bar. */
  long: { viewBox: "0 0 132 58", d: "M3 56 C 40 40, 90 18, 129 3" },
  /** Medium sweep — videos, merch product. */
  medium: { viewBox: "0 0 110 40", d: "M3 38 C 34 28, 72 13, 107 3" },
  /** Short flick — hero secondary accents. */
  short: { viewBox: "0 0 58 16", d: "M2 14 C 18 10, 38 6, 56 2" },
  /** Tiny flick — hero "same city". */
  tiny: { viewBox: "0 0 56 14", d: "M2 12 C 18 9, 36 5, 54 2" },
  /** Steep sweep — the concept "it's bigger than just videos" note. */
  steep: { viewBox: "0 0 100 38", d: "M3 36 C 30 26, 64 12, 97 3" },
  /** Hero "more than content" — narrow and steep. */
  heroMore: { viewBox: "0 0 100 28", d: "M3 26 C 30 20, 62 12, 97 4" },
} as const;

export interface HandAccentProps {
  /** One entry per written line. */
  lines: string[];
  /** Positioning class from the section stylesheet. */
  className?: string;
  /** Extra class for the text block (size/rotation/colour). */
  textClassName?: string;
  /** Extra class for the underline SVG (position/size). */
  underlineClassName?: string;
  underline?: keyof typeof UNDERLINES | null;
  /** Grey pen instead of red — used on the hero's smaller notes. */
  greyUnderline?: boolean;
  /** Per-line left offsets, mirroring the ragged margins in the mockups. */
  lineOffsetClassName?: string;
  /**
   * Parallax depth, as a fraction of viewport height. Read by the hero's
   * scroll scene so each note drifts at its own rate.
   */
  depth?: number;
  /**
   * Adds `data-a`, which keeps the accent hidden until its timeline sets the
   * start state. Needed where the timeline is built late (the hero, which
   * waits for the preloader); scroll-triggered sections set their start
   * state on creation and don't need it.
   */
  hideUntilRevealed?: boolean;
}

export function HandAccent({
  lines,
  className,
  textClassName,
  underlineClassName,
  underline = "medium",
  greyUnderline = false,
  lineOffsetClassName,
  depth,
  hideUntilRevealed = false,
}: HandAccentProps) {
  const curve = underline ? UNDERLINES[underline] : null;

  return (
    <div
      className={["accent", styles.accent, className].filter(Boolean).join(" ")}
      aria-hidden="true"
      {...(depth !== undefined ? { "data-depth": String(depth) } : {})}
      {...(hideUntilRevealed ? { "data-a": "" } : {})}
    >
      <p
        className={["hand", styles.hand, textClassName, lineOffsetClassName]
          .filter(Boolean)
          .join(" ")}
      >
        {lines.map((line, i) => (
          <span key={i} className="hand-line">
            {line}
          </span>
        ))}
      </p>

      {curve && (
        <svg
          className={[
            "hand-underline",
            greyUnderline ? "is-grey" : "",
            styles.underline,
            underlineClassName,
          ]
            .filter(Boolean)
            .join(" ")}
          viewBox={curve.viewBox}
          preserveAspectRatio="none"
        >
          <path pathLength="1" d={curve.d} />
        </svg>
      )}
    </div>
  );
}

export default HandAccent;
