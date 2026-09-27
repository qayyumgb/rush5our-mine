"use client";

/**
 * MOTION PROVIDER — one place that owns the page's motion environment.
 *
 * Responsibilities:
 *   • register GSAP plugins and the brand eases (once)
 *   • run Lenis smooth scrolling and drive it from GSAP's ticker, so
 *     ScrollTrigger and Lenis share a single RAF loop
 *   • intercept in-page anchor links and hand them to Lenis
 *   • wait for real fonts before declaring motion "ready", because splitting
 *     text against a fallback font measures the wrong widths
 *   • expose `reduced`, `ready` and scroll controls to every section
 *
 * Sections never set up their own scroll engine — they read `ready` from
 * `useMotion()` and build their timelines inside a `gsap.context`.
 *
 * Note the context exposes `lockScroll`/`unlockScroll` rather than the Lenis
 * instance itself. Modals only ever need to freeze the page, and keeping the
 * instance in a ref behind stable callbacks means the context value never
 * changes identity, so nothing re-renders when smooth scrolling starts.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, initGsap } from "@/lib/motion/gsap";
import { useReducedMotion } from "@/lib/motion/useMediaQuery";
import { whenIntroReady } from "@/lib/motion/intro";

interface MotionContextValue {
  /** The visitor asked for reduced motion — skip everything decorative. */
  reduced: boolean;
  /** Fonts are loaded and GSAP is registered; safe to split text and animate. */
  ready: boolean;
  /** Freeze page scrolling — for modals and the preloader. */
  lockScroll: () => void;
  /** Resume page scrolling. */
  unlockScroll: () => void;
}

const MotionContext = createContext<MotionContextValue>({
  reduced: false,
  ready: false,
  lockScroll: () => {},
  unlockScroll: () => {},
});

/** Read the shared motion environment from any client component. */
export function useMotion() {
  return useContext(MotionContext);
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);
  const reduced = useReducedMotion();

  /**
   * Scroll locking is reference-counted. The preloader, the nav drawer, the
   * video player and the contact form can all want the page frozen, and they
   * can overlap; a plain boolean would let whichever released first unlock
   * the page out from under the others.
   */
  const locksRef = useRef(0);

  // The refs are read at call time, never during render, so these callbacks
  // stay stable for the life of the provider.
  const lockScroll = useCallback(() => {
    locksRef.current += 1;
    if (locksRef.current > 1) return;
    lenisRef.current?.stop();
    // Covers the reduced-motion case, where Lenis isn't running at all.
    document.documentElement.style.overflow = "hidden";
  }, []);

  const unlockScroll = useCallback(() => {
    locksRef.current = Math.max(0, locksRef.current - 1);
    if (locksRef.current > 0) return;
    lenisRef.current?.start();
    document.documentElement.style.overflow = "";
  }, []);

  /* --- smooth scroll ---------------------------------------------------- */
  // Skipped entirely under reduced motion: hijacking the scroll wheel is
  // exactly the kind of movement that setting asks us to avoid.
  useEffect(() => {
    initGsap();
    if (reduced) return;

    const instance = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    lenisRef.current = instance;

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  /* --- in-page anchors --------------------------------------------------- */
  // Handled here rather than per-link so every section behaves the same,
  // including the "#" placeholders that must not jump.
  //
  // Three kinds of link are caught:
  //   "#id"   — a section on this page
  //   "/#id"  — a section on the homepage; smooth-scrolled when already on
  //             the homepage, otherwise left to navigate normally
  //   "/"     — the homepage itself (the logo); on the homepage that means
  //             "back to the top" rather than a reload that replays the intro
  // Anything else — another route, an external URL, a modified click — is
  // not touched.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.dataset.noScroll === "true" || link.target === "_blank") return;

      const href = link.getAttribute("href") ?? "";
      const onHome = window.location.pathname === "/";

      let id: string;
      if (href.startsWith("#")) id = href;
      else if (href.startsWith("/#") && onHome) id = href.slice(1);
      else if (href === "/" && onHome) id = "top";
      else return;

      e.preventDefault();
      if (id.length < 2) return; // bare "#" placeholder — stay put

      const lenis = lenisRef.current;
      if (id === "top") {
        if (lenis) lenis.scrollTo(0, { duration: 1.6 });
        else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        return;
      }

      let target: Element | null = null;
      try {
        target = document.querySelector(id);
      } catch {
        return;
      }
      if (!target) return;
      if (lenis) lenis.scrollTo(target as HTMLElement, { duration: 1.6 });
      else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [reduced]);

  /* --- arriving with a hash ---------------------------------------------- */
  // "/#merch" from another page lands on the homepage, where the preloader
  // pins the page to the top for its intro. Once the intro gate opens, the
  // section in the hash is scrolled to — so a menu link from /about still
  // ends up where it points.
  useEffect(() => {
    if (!ready) return;
    const hash = window.location.hash;
    if (hash.length < 2) return;

    let cancelled = false;
    whenIntroReady().then(() => {
      if (cancelled) return;
      // A frame for the unlocked page to settle before measuring.
      requestAnimationFrame(() => {
        let target: Element | null = null;
        try {
          target = document.querySelector(hash);
        } catch {
          return; // not a valid selector, e.g. "#!" — nothing to scroll to
        }
        if (!target || cancelled) return;
        const lenis = lenisRef.current;
        // An absolute offset, not the element: the browser has already made
        // its own jump to the hash, which Lenis did not see, so its idea of
        // the current scroll is stale and an element target lands short.
        const y = target.getBoundingClientRect().top + window.scrollY;
        if (lenis) lenis.scrollTo(y, { duration: 1.4, force: true });
        else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      });
    });
    return () => {
      cancelled = true;
    };
  }, [ready, reduced]);

  /* --- ready signal ------------------------------------------------------ */
  // Raced against a timeout so a slow or blocked font never strands the page
  // with hidden [data-a] elements.
  useEffect(() => {
    let cancelled = false;

    const fontsReady = document.fonts
      ? Promise.race([document.fonts.ready, new Promise<void>((r) => setTimeout(r, 1500))])
      : Promise.resolve();

    fontsReady.then(() => {
      if (cancelled) return;
      setReady(true);
      document.documentElement.classList.add("motion-ready");
      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<MotionContextValue>(
    () => ({ reduced, ready, lockScroll, unlockScroll }),
    [reduced, ready, lockScroll, unlockScroll],
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}
