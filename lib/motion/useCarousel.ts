"use client";

/**
 * CAROUSEL HOOK — shared by the featured-video and merch-product carousels.
 *
 * Owns index, autoplay, swipe and pause behaviour; the *look* of a
 * transition is supplied by the caller's `animate` callback, so the two
 * carousels can move completely differently while behaving identically.
 *
 * Deliberate behaviours:
 *   • autoplay pauses while hovered, and while the carousel is off-screen
 *     (an IntersectionObserver), so nothing animates where nobody is looking
 *   • transitions are guarded by `busy`, so fast clicks can't interleave two
 *     animations and strand a slide mid-tween
 *   • without GSAP or under reduced motion it still works — it just cuts
 *     between slides instead of animating
 *
 * Slide visibility is toggled by adding/removing `activeClass` directly on
 * the elements rather than through React state: during a transition two
 * slides are visible at once, and driving that from render would fight the
 * tween that is mid-flight.
 *
 * All the mutable machinery lives in a single `engine` ref, written only
 * inside effects. That keeps render pure, and lets `goTo` stay referentially
 * stable no matter how often the caller re-renders.
 */

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

export interface CarouselOptions {
  /** The element that receives swipe and hover handling. */
  stageRef: RefObject<HTMLElement | null>;
  /** Slide elements, in order. */
  slidesRef: RefObject<(HTMLElement | null)[]>;
  /** Class that marks a slide visible. */
  activeClass: string;
  /** ms between automatic advances; 0 disables autoplay. */
  autoplay?: number;
  /** Skip all animation (reduced motion). */
  reduced?: boolean;
  /**
   * Runs the visual transition. Call `done()` when finished so the outgoing
   * slide can be hidden and the next advance unblocked.
   */
  animate?: (from: HTMLElement, to: HTMLElement, direction: 1 | -1, done: () => void) => void;
  /** Called with the new index as soon as a change is committed. */
  onChange?: (index: number) => void;
}

interface Engine {
  index: number;
  busy: boolean;
  hovered: boolean;
  inView: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  activeClass: string;
  autoplay: number;
  reduced: boolean;
  animate?: CarouselOptions["animate"];
  onChange?: CarouselOptions["onChange"];
}

export function useCarousel({
  stageRef,
  slidesRef,
  activeClass,
  autoplay = 0,
  reduced = false,
  animate,
  onChange,
}: CarouselOptions) {
  const [index, setIndex] = useState(0);

  const engineRef = useRef<Engine>({
    index: 0,
    busy: false,
    hovered: false,
    inView: true,
    timer: null,
    activeClass,
    autoplay,
    reduced,
    animate,
    onChange,
  });

  // Keep the engine's copy of the caller's options current. Done in an
  // effect (never during render) so the ref is only ever written after commit.
  useEffect(() => {
    const e = engineRef.current;
    e.activeClass = activeClass;
    e.autoplay = autoplay;
    e.reduced = reduced;
    e.animate = animate;
    e.onChange = onChange;
  }, [activeClass, autoplay, reduced, animate, onChange]);

  /**
   * `schedule` needs to advance the carousel, and `goTo` needs to re-arm the
   * timer — a genuine cycle. It is broken with a forward ref: `schedule` is
   * declared first and calls whatever `advanceRef` currently holds, which an
   * effect points at `goTo` after commit.
   */
  const advanceRef = useRef<(next: number, direction?: 1 | -1) => void>(() => {});

  /** (Re)arms the autoplay timer, honouring hover/visibility/reduced motion. */
  const schedule = useCallback(() => {
    const e = engineRef.current;
    if (e.timer) clearTimeout(e.timer);
    if (!e.autoplay || e.reduced || !e.inView || e.hovered) return;
    e.timer = setTimeout(() => advanceRef.current(e.index + 1, 1), e.autoplay);
  }, []);

  /**
   * Stable for the lifetime of the hook: it reads everything it needs from
   * the engine ref, so it never has to be rebuilt and never restarts the
   * autoplay timer by changing identity.
   */
  const goTo = useCallback(
    (next: number, direction: 1 | -1 = 1) => {
      const e = engineRef.current;
      const slides = slidesRef.current ?? [];
      if (slides.length === 0) return;

      const n = ((next % slides.length) + slides.length) % slides.length;
      if (n === e.index || e.busy) return;

      const from = slides[e.index];
      const to = slides[n];
      if (!from || !to) return;

      e.index = n;
      setIndex(n);
      e.onChange?.(n);

      if (e.animate && !e.reduced) {
        e.busy = true;
        to.classList.add(e.activeClass);
        e.animate(from, to, direction, () => {
          from.classList.remove(e.activeClass);
          e.busy = false;
        });
      } else {
        from.classList.remove(e.activeClass);
        to.classList.add(e.activeClass);
      }

      schedule();
    },
    [slidesRef, schedule],
  );

  useEffect(() => {
    advanceRef.current = goTo;
  }, [goTo]);

  const next = useCallback(() => goTo(engineRef.current.index + 1, 1), [goTo]);
  const prev = useCallback(() => goTo(engineRef.current.index - 1, -1), [goTo]);

  /* --- swipe, hover pause, off-screen pause ---------------------------- */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const e = engineRef.current;

    let x0: number | null = null;
    let y0: number | null = null;

    const onDown = (ev: PointerEvent) => {
      x0 = ev.clientX;
      y0 = ev.clientY;
    };
    const onUp = (ev: PointerEvent) => {
      if (x0 === null || y0 === null) return;
      const dx = ev.clientX - x0;
      const dy = ev.clientY - y0;
      x0 = null;
      // Horizontal intent only, so a vertical page scroll never flips a slide.
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next();
        else prev();
      }
    };
    const onCancel = () => {
      x0 = null;
    };
    const onEnter = () => {
      e.hovered = true;
      if (e.timer) clearTimeout(e.timer);
    };
    const onLeave = () => {
      e.hovered = false;
      schedule();
    };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onCancel);
    stage.addEventListener("pointerenter", onEnter);
    stage.addEventListener("pointerleave", onLeave);

    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        e.inView = entries[0].isIntersecting;
        if (e.inView) schedule();
        else if (e.timer) clearTimeout(e.timer);
      });
      observer.observe(stage);
    }

    schedule();

    return () => {
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onCancel);
      stage.removeEventListener("pointerenter", onEnter);
      stage.removeEventListener("pointerleave", onLeave);
      observer?.disconnect();
      if (e.timer) clearTimeout(e.timer);
    };
  }, [stageRef, next, prev, schedule]);

  return { index, goTo, next, prev };
}

export default useCarousel;
