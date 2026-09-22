/**
 * ICON RING — a line icon inside a red-glowing circle.
 *
 * The concept cards use this for their three feature icons. The ring reacts
 * to hover on its parent card (see `.js-card` in the stylesheet), so the
 * whole card behaves as one target rather than the icon lighting up alone.
 */

import Icon, { type IconName } from "./Icon";
import styles from "./IconRing.module.css";

export interface IconRingProps {
  name: IconName;
  /** Diameter, usually `calc(N * var(--u))` from the section. */
  size?: string;
  className?: string;
}

export function IconRing({ name, size, className }: IconRingProps) {
  // The play glyph is filled white in the mockups; the rest are red strokes.
  const solid = name === "play";

  return (
    <span
      className={[styles.ring, solid ? styles.solid : "", className].filter(Boolean).join(" ")}
      style={size ? ({ "--size": size } as React.CSSProperties) : undefined}
      aria-hidden="true"
    >
      <Icon name={name} />
    </span>
  );
}

export default IconRing;
