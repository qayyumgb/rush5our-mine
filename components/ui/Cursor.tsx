"use client";

/**
 * CUSTOM CURSOR — a red dot that tracks the pointer closely, with a ring
 * that lags behind it. Over interactive elements the ring opens up; over
 * anything carrying `data-cursor="PLAY"` (or similar) it fills red and shows
 * that word.
 *
 * Only mounts for fine pointers, and never under reduced motion, so touch
 * users and anyone who asked for stillness keep the native cursor.
 *
 * Note: the native cursor is only hidden once this component is actually
 * live, so a JS failure can never leave the page without a pointer.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { useFinePointer } from "@/lib/motion/useMediaQuery";
import { useMotion } from "@/components/motion/MotionProvider";
import styles from "./Cursor.module.css";

export function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const { ready, reduced } = useMotion();
  const finePointer = useFinePointer();

  // Derived, not stored: rendering is a pure function of the environment,
  // so plugging in a mouse mid-session brings the cursor to life.
  const mounted = ready && !reduced && finePointer;

  useEffect(() => {
    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!mounted || !root || !dot || !ring || !label) return;

    document.documentElement.classList.add("has-cursor");

    // Two different follow speeds are what create the trailing feel.
    const dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3.out" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      root.classList.remove(styles.hidden);
    };

    const onLeave = () => root.classList.add(styles.hidden);

    const onOver = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor], a, button, [role='button']",
      );
      root.classList.remove(styles.hover, styles.labelled);
      if (!target) return;
      if (target.dataset.cursor) {
        label.textContent = target.dataset.cursor;
        root.classList.add(styles.labelled);
      } else {
        root.classList.add(styles.hover);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.addEventListener("pointerover", onOver);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div ref={rootRef} className={`${styles.cursor} ${styles.hidden}`} aria-hidden="true">
      <div ref={ringRef} className={styles.ring}>
        <span ref={labelRef} className={styles.label} />
      </div>
      <div ref={dotRef} className={styles.dot} />
    </div>
  );
}

export default Cursor;
