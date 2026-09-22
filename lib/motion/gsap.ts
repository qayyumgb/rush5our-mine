/**
 * GSAP SETUP — plugin registration and the brand easing curves.
 *
 * Imported by every client component that animates. Registration is
 * idempotent and runs once per browser session; on the server this module
 * does nothing, so it is safe to import from shared code.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";

let registered = false;

/**
 * Brand easing. `r5` is the signature settle used for nearly every entrance;
 * `r5.inOut` drives wipes and clip-path reveals. They are CustomEase curves,
 * so they must be registered before any tween references them by name.
 */
export const EASE = "r5";
export const EASE_IO = "r5.inOut";

/** Registers GSAP plugins and brand eases exactly once. Client-side only. */
export function initGsap() {
  if (registered || typeof window === "undefined") return;
  registered = true;

  gsap.registerPlugin(ScrollTrigger, CustomEase, Flip);

  // A slightly softer expo.out — long tail, no visible overshoot.
  CustomEase.create(EASE, "M0,0 C0.16,1 0.3,1 1,1");
  // Symmetrical in/out with a fast middle, for wipes.
  CustomEase.create(EASE_IO, "M0,0 C0.77,0 0.18,1 1,1");

  // On phones the URL bar hides and shows as you flick-scroll, which changes
  // the viewport height. By default ScrollTrigger treats that as a resize and
  // refreshes — recalculating every trigger mid-scroll, which is what makes
  // in-flight animations stick or jump. Ignoring it is the documented fix.
  ScrollTrigger.config({ ignoreMobileResize: true });

  // NOTE: lag smoothing is configured by MotionProvider, not here. It depends
  // on whether Lenis is driving the ticker, which is a per-device decision.
}

/** True when the visitor has asked for reduced motion. */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True for mouse/trackpad pointers — gates hover-only effects. */
export function hasFinePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}

export { gsap, ScrollTrigger, CustomEase, Flip };
