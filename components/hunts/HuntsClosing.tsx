"use client";

/**
 * RUSH HUNTS — section 6, "The hunt has started" (mockups/Rush Hunts/6.png,
 * a 950 x 1655 phone frame).
 *
 * The page's close: a red tracked eyebrow between two rules, a three-line
 * headline — two white lines, then an italic red one over a brush stroke —
 * a four-beat tracked line, three lines of copy and a red shout, the glowing
 * button, and the wordmark between two rules with its tagline. The shared
 * footer follows from the root layout.
 *
 * The edge grunge, the brush stroke and the wordmark are lifted from the
 * mockup file (see data/hunts.ts).
 *
 * MOTION:
 *   • the eyebrow decodes between its rules drawing outward, the headline's
 *     characters rise line by line, the brush stroke paints under the last
 *   • the four beats land one at a time, the copy lifts, the shout follows
 *   • the button rises and its glow breathes; the wordmark settles between
 *     its rules
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn, pauseWhenOffscreen } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import RedButton from "@/components/ui/RedButton";
import { huntsClosing } from "@/data/hunts";
import styles from "./HuntsClosing.module.css";

export function HuntsClosing() {
  const rootRef = useRef<HTMLElement>(null);
  const { ready, reduced } = useMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !ready) return;

    const q = gsap.utils.selector(root);

    if (reduced) {
      gsap.set(q("[data-a]"), { visibility: "visible" });
      return;
    }

    let stopWatching = () => {};

    const ctx = gsap.context(() => {
      gsap.set(q("[data-a]"), { visibility: "visible" });

      /* --- statement ---------------------------------------------------- */
      const head = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.head}`)[0], start: "top 80%" },
      });
      head.fromTo(q(`.${styles.eyebrowRule}`), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: EASE_IO }, 0);
      const label = q(`.${styles.eyebrowLabel}`)[0] as HTMLElement | undefined;
      if (label) head.add(scramble(label, 0.9), 0.05);
      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(head, splitTitle(title), 0.2);
      head.fromTo(
        q(`.${styles.brush}`),
        { clipPath: "inset(-10% 100% -10% 0)" },
        { clipPath: "inset(-10% 0% -10% 0)", duration: 1, ease: EASE_IO, clearProps: "clipPath" },
        1.1,
      );

      /* --- copy --------------------------------------------------------- */
      gsap
        .timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: q(`.${styles.strap}`)[0], start: "top 88%" },
        })
        .fromTo(
          q(`.${styles.beat}`),
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.16 },
          0,
        )
        .fromTo(
          q(`.${styles.body} span`),
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 },
          0.5,
        )
        .fromTo(q(`.${styles.shout}`), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0.85);

      /* --- button and foot ---------------------------------------------- */
      gsap
        .timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: q(`.${styles.btnWrap}`)[0], start: "top 92%" },
        })
        .fromTo(q(`.${styles.btnWrap}`), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0);

      // The button's glow breathes.
      const glow = gsap.fromTo(
        q(`.${styles.glow}`),
        { opacity: 0.55 },
        { opacity: 1, duration: 1.8, ease: "sine.inOut", repeat: -1, yoyo: true },
      );
      stopWatching = pauseWhenOffscreen(root, [glow]);

      gsap
        .timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: q(`.${styles.foot}`)[0], start: "top 96%" },
        })
        .fromTo(q(`.${styles.mark}`), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0)
        .fromTo(q(`.${styles.footRule}`), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: EASE_IO }, 0.15)
        .fromTo(q(`.${styles.tag}`), { opacity: 0 }, { opacity: 1, duration: 1 }, 0.35);
    }, root);

    return () => {
      stopWatching();
      ctx.revert();
    };
  }, [ready, reduced]);

  const c = huntsClosing;

  return (
    <section ref={rootRef} id="join" className={styles.section} aria-labelledby="hunts-closing-title">
      <div className={styles.atmos} aria-hidden="true" />

      <div className="frame">
        {/* ---------------- Statement ---------------- */}
        <div className={styles.head}>
          <p className={styles.eyebrow}>
            <span className={`${styles.eyebrowRule} ${styles.ruleL}`} aria-hidden="true" />
            <span className={`${styles.eyebrowLabel} f-cond cz caps`}>{c.eyebrow}</span>
            <span className={`${styles.eyebrowRule} ${styles.ruleR}`} aria-hidden="true" />
          </p>

          <h2 id="hunts-closing-title" className={styles.title}>
            {c.title.map((line) => (
              <span key={line.text} className={`line f-display cz ${line.red ? styles.lineRed : ""}`}>
                <span className={`line-inner ${line.red ? "t-red" : "t-white"}`}>{line.text}</span>
              </span>
            ))}
          </h2>

          {/* The brush stroke under the headline, lifted from the mockup as
              an alpha image: hand-painted. A fixed 780px asset. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.brush}
            src="/assets/images/hunts-closing-brush.webp"
            width={780}
            height={50}
            alt=""
            aria-hidden="true"
            decoding="async"
            data-a
          />
        </div>

        {/* ---------------- Copy ---------------- */}
        <p className={`${styles.strap} f-cond cz caps`}>
          {c.strap.map((beat) => (
            <span key={beat.text} className={`${styles.beat} ${beat.red ? styles.beatRed : ""}`} data-a>
              {beat.text}
            </span>
          ))}
        </p>

        <p className={`${styles.body} f-sans cz`}>
          {c.bodyLines.map((line) => (
            <span key={line} data-a>
              {line}
            </span>
          ))}
        </p>

        <p className={`${styles.shout} f-display cz caps`} data-a>
          <span className={styles.stretch}>{c.shout}</span>
        </p>

        {/* ---------------- Button ---------------- */}
        <div className={styles.btnWrap} data-a>
          <span className={styles.glow} aria-hidden="true" />
          <RedButton
            label={c.cta.label}
            href={c.cta.href}
            className={styles.btn}
            wrapperClassName={styles.btnMagnet}
            arrow="short"
            magnetStrength={0.12}
          />
        </div>

        {/* ---------------- Foot ---------------- */}
        <div className={styles.foot}>
          <span className={`${styles.footRule} ${styles.footL}`} aria-hidden="true" data-a />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.mark}
            src="/assets/images/hunts-closing-mark.webp"
            width={280}
            height={70}
            alt={c.mark}
            decoding="async"
            data-a
          />
          <span className={`${styles.footRule} ${styles.footR}`} aria-hidden="true" data-a />
          <p className={`${styles.tag} f-sans cz caps`} data-a>
            {c.tag}
          </p>
        </div>
      </div>
    </section>
  );
}

export default HuntsClosing;
