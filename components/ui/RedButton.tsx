"use client";

/**
 * RED BUTTON — the brand's primary call to action.
 *
 * Shared by the hero, the concept CTA bar, the merch teaser and the videos
 * grid. Each section supplies its own measured width/height/type through
 * `className`; this component owns the look and the two hover behaviours:
 *
 *   • a character-by-character label roll (built in markup, driven by CSS)
 *   • magnetic drift toward the cursor (GSAP, fine pointers only)
 *
 * The magnetic transform is applied to an outer `.magnet` wrapper so it never
 * fights the button's own `translateY` hover.
 */

import { useEffect, useRef, type ReactNode } from "react";
import { magnetic } from "@/lib/motion/helpers";
import { useMotion } from "@/components/motion/MotionProvider";
import styles from "./RedButton.module.css";

/** Arrow geometries, matched to the mockups' different arrow sizes. */
const ARROWS = {
  /** Long arrow — hero and "watch all videos". */
  long: { viewBox: "0 0 32 20", d: "M1 10h29M21 1.5l9 8.5-9 8.5" },
  /** Medium arrow — concept CTA bar. */
  medium: { viewBox: "0 0 30 18", d: "M1 9h27M19.5 1.5l8.5 7.5-8.5 7.5" },
  /** Short arrow — merch "view all merch". */
  short: { viewBox: "0 0 20 14", d: "M1 7h17M12 1.5l6 5.5-6 5.5" },
} as const;

export interface RedButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
  /** Sizing/typography classes from the consuming section. */
  className?: string;
  /** Wrapper class, for sections that need the magnet to fill its column. */
  wrapperClassName?: string;
  arrow?: keyof typeof ARROWS | "none";
  /** Magnetic strength, 0 disables. Mockup-tuned per section. */
  magnetStrength?: number;
  children?: ReactNode;
}

/** Splits a label into the two stacked rolls the hover effect needs. */
function RollingLabel({ label }: { label: string }) {
  const chars = Array.from(label);
  return (
    <span className={styles.label} aria-hidden="true">
      {(["roll", "clone"] as const).map((kind) => (
        <span
          key={kind}
          className={kind === "roll" ? styles.roll : `${styles.roll} ${styles.clone}`}
        >
          {chars.map((ch, i) => (
            <span
              key={`${kind}-${i}`}
              className={styles.ch}
              style={{ "--i": i } as React.CSSProperties}
            >
              {ch}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

export function RedButton({
  label,
  href,
  onClick,
  className,
  wrapperClassName,
  arrow = "long",
  magnetStrength = 0.25,
}: RedButtonProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const { ready, reduced } = useMotion();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !ready || reduced || magnetStrength <= 0) return;
    return magnetic(el, magnetStrength);
  }, [ready, reduced, magnetStrength]);

  const arrowSpec = arrow === "none" ? null : ARROWS[arrow];

  const inner = (
    <>
      <RollingLabel label={label} />
      {arrowSpec && (
        <svg className={styles.arrow} viewBox={arrowSpec.viewBox} aria-hidden="true">
          <path d={arrowSpec.d} />
        </svg>
      )}
    </>
  );

  const buttonClass = [styles.btn, className].filter(Boolean).join(" ");

  return (
    <span ref={wrapRef} className={["magnet", wrapperClassName].filter(Boolean).join(" ")}>
      {href ? (
        <a href={href} className={buttonClass} aria-label={label}>
          {inner}
        </a>
      ) : (
        <button type="button" className={buttonClass} aria-label={label} onClick={onClick}>
          {inner}
        </button>
      )}
    </span>
  );
}

export default RedButton;
