"use client";

/**
 * ABOUT — section 4, "What we will achieve" (mockups/About/4.png).
 *
 * A three-line statement with a ghosted marker note at its right shoulder,
 * a six-item checked list split by hairlines, and a closing line — tracked
 * tagline, one-line headline in white and red, and a brush sweep beneath.
 *
 * MOTION:
 *   • the shared `headReveal` opens the statement and writes the note
 *   • the list runs as one timeline: each ring pops in and its tick draws
 *     on, the title and copy lift behind it, and the hairline below draws
 *     left to right — staggered down the list
 *   • the closing line decodes its tagline, rises its headline's characters,
 *     and wipes the brush sweep on from the left
 *
 * No standing `will-change` or `translateZ(0)` — see the note in
 * AboutHero.tsx for why.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn, headReveal, prepareStrokes } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import Eyebrow from "@/components/ui/Eyebrow";
import HandAccent from "@/components/ui/HandAccent";
import IconRing from "@/components/ui/IconRing";
import { aboutAchieve } from "@/data/about";
import styles from "./AboutAchieve.module.css";

export function AboutAchieve() {
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

    const ctx = gsap.context(() => {
      gsap.set(q("[data-a]"), { visibility: "visible" });
      prepareStrokes(root);

      /* --- statement + note --------------------------------------------- */
      const head = q(`.${styles.head}`)[0] as HTMLElement | undefined;
      if (head) headReveal(head);

      /* --- list --------------------------------------------------------- */
      const items = q(`.${styles.item}`) as HTMLElement[];
      const list = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.list}`)[0], start: "top 80%" },
      });
      items.forEach((item, i) => {
        const at = i * 0.16;
        const inItem = gsap.utils.selector(item);
        list
          .fromTo(
            inItem(`.${styles.ring}`),
            { scale: 0.4, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.9, ease: "back.out(1.8)" },
            at,
          )
          .fromTo(
            inItem(".i-stroke"),
            { strokeDashoffset: (_i: number, el: Element) => Number((el as SVGElement).dataset.len ?? 0) },
            { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" },
            at + 0.25,
          )
          .fromTo(
            inItem(`.${styles.itemTitle}, .${styles.itemDesc}`),
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, stagger: 0.1 },
            at + 0.1,
          );
        const hairline = inItem(`.${styles.hairline}`);
        if (hairline.length) {
          list.fromTo(hairline, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: EASE_IO }, at + 0.35);
        }
      });

      /* --- closing ------------------------------------------------------ */
      const closing = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.closing}`)[0], start: "top 85%" },
      });
      closing.fromTo(
        q(`.${styles.closingRule}`),
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: EASE_IO },
        0,
      );
      const tag = q(`.${styles.tagline}`)[0] as HTMLElement | undefined;
      if (tag) closing.add(scramble(tag, 0.9), 0.1);
      const closingTitle = q(`.${styles.closingTitle}`)[0] as HTMLElement | undefined;
      if (closingTitle) charsIn(closing, splitTitle(closingTitle), 0.25);
      closing.fromTo(
        q(`.${styles.sweep}`),
        { clipPath: "inset(-20% 100% -20% 0)" },
        { clipPath: "inset(-20% 0% -20% 0)", duration: 1, ease: EASE_IO, clearProps: "clipPath" },
        0.9,
      );
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <section
      ref={rootRef}
      id="achieve"
      className={styles.achieve}
      aria-labelledby="about-achieve-title"
    >
      <div className="frame">
        {/* ---------------- Statement ---------------- */}
        <div className={styles.head}>
          <Eyebrow
            label={aboutAchieve.eyebrow}
            className={styles.eyebrow}
            labelClassName={styles.eyebrowLabel}
            ruleClassName={styles.eyebrowRule}
          />

          <h2 id="about-achieve-title" className={styles.title}>
            {aboutAchieve.titleWhite.map((line) => (
              <span key={line} className="line f-display cz">
                <span className="line-inner t-white">{line}</span>
              </span>
            ))}
            <span className="line f-display cz glow-text">
              <span className="line-inner t-red">{aboutAchieve.titleRed}</span>
            </span>
          </h2>

          {/* Ghosted marker note — the same pen as the hero's, printed at
              ~14% white so it sits in the surface rather than on it. */}
          <HandAccent
            lines={aboutAchieve.noteLines}
            className={styles.note}
            textClassName={styles.noteText}
            underline="long"
            underlineClassName={styles.noteUnderline}
          />
        </div>

        {/* ---------------- Checked list ---------------- */}
        <ul className={styles.list} data-a>
          {aboutAchieve.items.map((item, i) => (
            <li key={item.title.join(" ")} className={styles.item}>
              <div className={styles.itemRow}>
                <IconRing name="check" size={`calc(63 * var(--u))`} className={styles.ring} />

                <div className={styles.itemBody}>
                  {/* Oswald, not the display face: the mockup's list titles are
                      the condensed UI cut the buttons use, set bold. */}
                  <h3 className={`${styles.itemTitle} f-cond cz caps`}>
                    {item.title.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </h3>
                  <p className={`${styles.itemDesc} f-sans cz`}>
                    {item.desc.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </p>
                </div>
              </div>

              {i < aboutAchieve.items.length - 1 && (
                <span className={styles.hairline} aria-hidden="true" />
              )}
            </li>
          ))}
        </ul>

        {/* ---------------- Closing ---------------- */}
        <div className={styles.closing}>
          <span className={styles.closingRule} aria-hidden="true" />

          <p className={`${styles.tagline} f-sans cz caps`}>{aboutAchieve.tagline}</p>

          <h3 className={styles.closingTitle}>
            <span className="line f-display cz">
              <span className="line-inner">
                <span className="t-white">{aboutAchieve.closingWhite} </span>
                <span className="t-red">{aboutAchieve.closingRed}</span>
              </span>
            </span>
          </h3>

          {/* Brush sweep under "yet to come." — a filled shape, thick at the
              left and tapering to a hair at the right, traced off the mockup
              (x 465..841, y 1552..1607). */}
          <svg
            className={styles.sweep}
            viewBox="0 0 376 55"
            preserveAspectRatio="none"
            aria-hidden="true"
            data-a
          >
            <path
              d="M12 45 C 70 10, 180 1, 375 2 L 375 4 C 190 10, 90 30, 12 56 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}

export default AboutAchieve;
