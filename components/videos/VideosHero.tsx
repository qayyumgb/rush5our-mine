"use client";

/**
 * VIDEOS — section 1, "Watch the movement." (mockups/Videos/1.png, a 941 x
 * 1672 phone frame).
 *
 * The page's opener, type on atmosphere: a tracked eyebrow, a three-line
 * leaning headline — two in scratched white, one in red — two tracked
 * sublines, and the glowing red button with a play triangle, between red
 * grunge at both edges and red smoke at the foot (the mockup's own, its
 * type filled in).
 *
 * MOTION (one timeline on arrival; this page has no preloader, so the hero
 * opens the intro gate the shared Nav waits on):
 *   • the atmosphere fades up, the eyebrow decodes
 *   • the headline's characters rise line by line
 *   • the sublines lift, the button wipes open
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { openIntroGate } from "@/lib/motion/intro";
import { useMotion } from "@/components/motion/MotionProvider";
import RedButton from "@/components/ui/RedButton";
import { videosHero } from "@/data/videos-page";
import styles from "./VideosHero.module.css";

export function VideosHero() {
  const rootRef = useRef<HTMLElement>(null);
  const { ready, reduced } = useMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !ready) return;

    // The shared Nav waits on the intro gate; nothing else opens it here.
    openIntroGate();

    const q = gsap.utils.selector(root);

    if (reduced) {
      gsap.set(q("[data-a]"), { visibility: "visible" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(q("[data-a]"), { visibility: "visible" });

      const tl = gsap.timeline({ defaults: { ease: EASE } });

      tl.fromTo(q(`.${styles.atmos}`), { opacity: 0 }, { opacity: 1, duration: 2, ease: "power1.out" }, 0);

      const eyebrow = q(`.${styles.eyebrow}`)[0] as HTMLElement | undefined;
      if (eyebrow) tl.add(scramble(eyebrow, 0.9), 0.1);

      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(tl, splitTitle(title), 0.3, 0.05);

      tl.fromTo(
        q(`.${styles.sub} span`),
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.12 },
        1.3,
      ).fromTo(
        q(`.${styles.btnWrap}`),
        { y: 24, opacity: 0, clipPath: "inset(0% 50% 0% 50%)" },
        { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: EASE_IO, clearProps: "clipPath" },
        1.6,
      );
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  const c = videosHero;

  return (
    <section ref={rootRef} className={styles.hero} aria-labelledby="videos-title">
      {/* The mockup's own atmosphere — see data/videos-page.ts. */}
      <div className={styles.atmos} aria-hidden="true" data-a />

      <div className={styles.copy}>
        <p className={`${styles.eyebrow} f-sans cz caps`}>{c.eyebrow}</p>

        <h1 id="videos-title" className={styles.title} data-a>
          {c.title.map((line) => (
            <span key={line.text} className={`line f-display cz${line.red ? " glow-text" : ""}`}>
              <span className={`line-inner ${line.red ? "t-red" : "t-white"}`}>{line.text}</span>
            </span>
          ))}
        </h1>

        <p className={`${styles.sub} f-sans cz caps`}>
          {c.sublines.map((l) => (
            <span key={l} data-a>
              {l}
            </span>
          ))}
        </p>

        <div className={styles.btnWrap} data-a>
          <RedButton
            label={c.cta.label}
            href={c.cta.href}
            className={styles.btn}
            wrapperClassName={styles.btnMagnet}
            arrow="none"
            magnetStrength={0.14}
          >
            <svg className={styles.play} viewBox="0 0 49 58" aria-hidden="true">
              <path d="M0 0v58l49-29z" fill="currentColor" />
            </svg>
          </RedButton>
        </div>
      </div>
    </section>
  );
}

export default VideosHero;
