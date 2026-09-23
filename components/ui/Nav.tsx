"use client";

/**
 * NAV — fixed header with the logo, a burger and a full-screen drawer.
 *
 * Behaviours:
 *   • transparent over the hero, gaining a solid background once the page has
 *     scrolled past 24px — a class toggle, nothing per-frame
 *   • otherwise it does not move or restyle while scrolling at all
 *   • the drawer wipes down, links rise in sequence, and focus is trapped
 *     while it is open; Escape closes it
 *
 * All of the above degrades cleanly: without JS the header is simply a static
 * bar, and under reduced motion the drawer opens and closes instantly.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO } from "@/lib/motion/helpers";
import { whenIntroReady } from "@/lib/motion/intro";
import { useMotion } from "@/components/motion/MotionProvider";
import { navLinks, site, socialLinks } from "@/data/site";
import Logo from "./Logo";
import SocialIcon from "./SocialIcon";
import styles from "./Nav.module.css";

export function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { ready, reduced, lockScroll, unlockScroll } = useMotion();

  /* --- background on scroll ------------------------------------------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* --- entrance ---------------------------------------------------------- */
  // The nav drops in as part of the hero's load, so it waits on the same
  // intro gate the preloader opens. It owns this rather than the hero, so the
  // header is never left hidden if the hero is not on the page.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !ready) return;

    const targets = nav.querySelectorAll("[data-a]");
    if (reduced) {
      gsap.set(targets, { visibility: "visible" });
      return;
    }

    let cancelled = false;
    whenIntroReady().then(() => {
      if (cancelled) return;
      gsap.set(targets, { visibility: "visible" });
      gsap.fromTo(
        targets,
        { y: -24, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: EASE, clearProps: "transform" },
      );
    });

    return () => {
      cancelled = true;
    };
  }, [ready, reduced]);

  /* --- no scroll-driven motion on the bar ------------------------------
     The header is simply fixed: transparent at the top, opaque past 24px via
     the `scrolled` class, and otherwise still. It used to do two things here,
     both removed deliberately:

       • a reading-progress hairline scrubbed from scroll 0 to the bottom of
         the document, which rewrote an inline `transform: scaleX()` on every
         frame of every scroll, for the whole page height;
       • hide-on-scroll-down / show-on-scroll-up, which slid the whole bar in
         and out by 110%.

     Both were per-frame or near-constant work on a full-width element pinned
     over everything else. The bar now stays put and mutates no inline styles
     while scrolling. Restoring the hairline is easy if it is wanted back —
     but it needs a mechanism that does not write to the DOM each frame. */

  /* --- drawer open / close --------------------------------------------- */
  const close = useCallback(() => setOpen(false), []);

  // Lock page scroll behind the drawer. Acquired only while open and released
  // in cleanup, so the lock is always balanced and never fires on mount.
  useEffect(() => {
    if (!open) return;
    lockScroll();
    return () => unlockScroll();
  }, [open, lockScroll, unlockScroll]);

  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;
    if (!ready || reduced) return;

    const items = drawer.querySelectorAll(`.${styles.drawerLink}`);
    const foot = drawer.querySelector(`.${styles.drawerFoot}`);

    const tl = gsap.timeline();
    if (open) {
      tl.set(drawer, { visibility: "visible" })
        .fromTo(
          drawer,
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0% 0)", duration: 0.8, ease: EASE_IO },
        )
        .fromTo(
          items,
          { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.07, ease: EASE },
          0.25,
        )
        .fromTo(foot, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: EASE }, 0.55);
    } else {
      tl.to(items, { yPercent: -60, opacity: 0, duration: 0.3, ease: "power2.in" })
        .to(foot, { opacity: 0, duration: 0.25 }, 0)
        .to(
          drawer,
          { clipPath: "inset(0 0 100% 0)", duration: 0.6, ease: EASE_IO },
          0.15,
        )
        .set(drawer, { visibility: "hidden" });
    }

    return () => {
      tl.kill();
    };
  }, [open, ready, reduced]);

  /* --- Escape to close, focus back to the burger ------------------------ */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        burgerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      <header
        ref={navRef}
        id="nav"
        className={[styles.nav, scrolled ? styles.scrolled : ""].filter(Boolean).join(" ")}
      >
        <div className={styles.inner}>
          <Logo hideUntilRevealed />

          <button
            ref={burgerRef}
            type="button"
            className={[styles.burger, open ? styles.burgerOpen : ""].filter(Boolean).join(" ")}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="nav-drawer"
            onClick={() => setOpen((v) => !v)}
            data-a
          >
            <span />
            <span />
            <span />
          </button>

        </div>
      </header>

      <div
        ref={drawerRef}
        id="nav-drawer"
        className={[styles.drawer, open && reduced ? styles.drawerOpen : ""]
          .filter(Boolean)
          .join(" ")}
        // The drawer stays in the DOM so its wipe has something to animate;
        // `inert` keeps it out of the tab order and the accessibility tree
        // while it is closed.
        inert={!open}
      >
        <span className={styles.drawerGlow} aria-hidden="true" />

        <nav aria-label="Main">
          <ul className={styles.drawerList}>
            {navLinks.map((link, i) => (
              <li key={link.href + link.label} className={styles.drawerItem}>
                <a href={link.href} className={styles.drawerLink} onClick={close}>
                  <span className={styles.drawerIndex} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.drawerFoot}>
          <span className={styles.drawerTag}>{site.tagline}</span>
          <div className={styles.drawerSocials}>
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target="_blank"
                rel="noreferrer noopener"
              >
                <SocialIcon name={s.icon} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Nav;
