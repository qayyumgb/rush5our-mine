"use client";

/**
 * SCROLL CUE — the "scroll to explore" marker used at the foot of the hero
 * and the concept section.
 *
 * The label, line and chevron each take a size from the consuming section
 * (the two mockups use slightly different scales). The ambient loop — the
 * line filling and draining, the chevron bobbing — is started here, so any
 * page that drops in a cue gets the motion for free.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { animateScrollCue, pauseWhenOffscreen } from "@/lib/motion/helpers";
import { useMotion } from "@/components/motion/MotionProvider";
import styles from "./ScrollCue.module.css";

export interface ScrollCueProps {
  label: string;
  /** Where the cue scrolls to. */
  href: string;
  /** Wrapper class for positioning within the section. */
  className?: string;
  labelClassName?: string;
  lineClassName?: string;
  chevClassName?: string;
  /**
   * Adds `data-a` so the cue stays hidden until a late-built timeline reveals
   * it — see the same prop on HandAccent.
   */
  hideUntilRevealed?: boolean;
}

export function ScrollCue({
  label,
  href,
  className,
  labelClassName,
  lineClassName,
  chevClassName,
  hideUntilRevealed = false,
}: ScrollCueProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { ready, reduced } = useMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !ready || reduced) return;
    // Scoped context so the repeating tweens are killed on unmount, and the
    // loops idle out whenever the cue is off screen.
    let stopWatching = () => {};
    const ctx = gsap.context(() => {
      stopWatching = pauseWhenOffscreen(el, animateScrollCue(el));
    }, el);
    return () => {
      stopWatching();
      ctx.revert();
    };
  }, [ready, reduced]);

  return (
    <div className={className} {...(hideUntilRevealed ? { "data-a": "" } : {})}>
      <a ref={ref} href={href} className={styles.cue}>
        <span
          className={["f-sans cz caps", styles.label, labelClassName].filter(Boolean).join(" ")}
        >
          {label}
        </span>
        <span className={[styles.line, lineClassName].filter(Boolean).join(" ")}>
          <i className="js-cue-line" />
        </span>
        <svg
          className={[styles.chev, "js-cue-chev", chevClassName].filter(Boolean).join(" ")}
          viewBox="0 0 23 12"
          aria-hidden="true"
        >
          <path d="M1.5 1.5l10 9 10-9" />
        </svg>
      </a>
    </div>
  );
}

export default ScrollCue;
