"use client";

/**
 * PRELOADER — the branded hold that covers font loading and the hero's first
 * paint.
 *
 * It opens the shared intro gate part-way through its exit, so the hero's
 * entrance is already running as the panels wipe away. That overlap is what
 * makes the load read as one continuous move rather than two.
 *
 * Under reduced motion (or when `enabled` is false) it never renders and the
 * gate opens immediately, so the hero still animates in on schedule.
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO } from "@/lib/motion/helpers";
import { openIntroGate } from "@/lib/motion/intro";
import { useMotion } from "@/components/motion/MotionProvider";
import { site } from "@/data/site";
import styles from "./Preloader.module.css";

export interface PreloaderProps {
  /** Set false to ship without the intro loader. */
  enabled?: boolean;
}

export function Preloader({ enabled = true }: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);
  const { ready, reduced, lockScroll, unlockScroll } = useMotion();

  const active = enabled && !reduced;

  useEffect(() => {
    // Always land at the top when the loader is in play, so the hero's
    // entrance is actually visible after a refresh mid-page.
    if (active && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }
  }, [active]);

  // Hold the scroll lock while the loader is on screen.
  //
  // `done` is a dependency for a reason: when the loader finishes, this
  // component renders `null` but stays MOUNTED, so React never runs effect
  // cleanup. Depending on `done` makes the effect re-run and release the lock
  // at that moment instead of waiting for an unmount that never comes.
  useEffect(() => {
    if (!active || !ready || done) return;
    lockScroll();
    return () => unlockScroll();
  }, [active, ready, done, lockScroll, unlockScroll]);

  useEffect(() => {
    if (!ready) return;

    // Nothing to play: release the hero immediately. No state change is
    // needed — `active` already keeps this component from rendering.
    if (!active) {
      openIntroGate();
      return;
    }

    const ctx = gsap.context(() => {
      const counter = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => setDone(true),
      });

      tl.fromTo(
        `.${styles.mark}`,
        { scale: 0, rotate: -120 },
        { scale: 1, rotate: 0, duration: 1, ease: "back.out(1.7)" },
        0,
      )
        .fromTo(
          `.${styles.wordInner}`,
          { yPercent: 110 },
          { yPercent: 0, duration: 1, ease: EASE },
          0.15,
        )
        .fromTo(
          `.${styles.bottom}`,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          0.2,
        )
        .to(
          counter,
          {
            v: 100,
            duration: 1.35,
            ease: "power2.inOut",
            onUpdate: () => {
              if (countRef.current) {
                countRef.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
              }
            },
          },
          0.15,
        )
        .fromTo(
          `.${styles.bar} i`,
          { scaleX: 0 },
          { scaleX: 1, duration: 1.35, ease: "power2.inOut" },
          0.15,
        )
        // Exit: the lockup leaves first, then the two panels wipe upward.
        .to(`.${styles.center}`, { yPercent: -60, opacity: 0, duration: 0.55, ease: "power3.in" }, 1.6)
        .to(`.${styles.bottom}`, { opacity: 0, duration: 0.4 }, 1.6)
        .fromTo(
          `.${styles.panel}`,
          { clipPath: "inset(0% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 100% 0%)", duration: 1, ease: EASE_IO },
          1.95,
        )
        // Hand over to the hero as the wipe begins, not when it ends.
        .add(openIntroGate, 2.05)
        .fromTo(
          `.${styles.red}`,
          { clipPath: "inset(0% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 100% 0%)", duration: 1, ease: EASE_IO },
          2.08,
        );
    }, rootRef);

    return () => ctx.revert();
  }, [ready, active]);

  // Failsafe: if the motion system never reports ready, don't trap the page.
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      openIntroGate();
      setDone(true);
    }, 6000);
    return () => clearTimeout(t);
  }, [active]);

  if (!active || done) return null;

  return (
    <div ref={rootRef} className={styles.preloader} aria-hidden="true">
      <div className={styles.red} />
      <div className={styles.panel}>
        <div className={styles.center}>
          <span className={styles.mark}>
            <span>{site.mark}</span>
          </span>
          <span className={styles.word}>
            <span className={styles.wordInner}>
              {site.wordmark.light}
              <span className="text-red">{site.wordmark.accent}</span>
            </span>
          </span>
        </div>

        <div className={styles.bottom}>
          <span className={styles.tag}>Loading the movement</span>
          <span ref={countRef} className={styles.count}>
            000
          </span>
        </div>

        <span className={styles.bar}>
          <i />
        </span>
      </div>
    </div>
  );
}

export default Preloader;
