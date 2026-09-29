"use client";

/**
 * RUSH HUNTS — section 2, "How Rush Hunts work" (mockups/Rush Hunts/2.png,
 * a 950 x 1655 phone frame).
 *
 * A centred statement — red tracked eyebrow between two rules, a heavy
 * two-line headline, a tracked subline — over four numbered step cards
 * joined by chevrons: a red disc with the step number, a hairline, a red
 * line icon, then a two-colour title and two or three lines of copy. A red
 * brush-script line closes it.
 *
 * The edge grunge, the script and the four step icons are lifted from the
 * mockup file (see data/hunts.ts).
 *
 * MOTION:
 *   • the eyebrow decodes between its rules drawing outward, the headline's
 *     characters rise, the subline lifts
 *   • each card rises as it enters; its disc pops, the hairline drops, the
 *     icon settles in, and the title and copy lift
 *   • each chevron drops in after the card above it
 *   • the script writes on, left to right
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import { huntsSteps } from "@/data/hunts";
import styles from "./HuntsSteps.module.css";

export function HuntsSteps() {
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
      head.fromTo(q(`.${styles.subline}`), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.8);

      /* --- steps -------------------------------------------------------- */
      (q(`.${styles.step}`) as HTMLElement[]).forEach((step) => {
        const inS = gsap.utils.selector(step);
        const tl = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: step, start: "top 86%" },
        });
        tl.fromTo(inS(`.${styles.card}`), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, 0)
          .fromTo(
            inS(`.${styles.disc}`),
            { scale: 0.4, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.9, ease: "back.out(1.8)" },
            0.2,
          )
          .fromTo(inS(`.${styles.divider}`), { scaleY: 0 }, { scaleY: 1, duration: 0.8, ease: EASE_IO }, 0.3)
          .fromTo(
            inS(`.${styles.icon}`),
            { opacity: 0, scale: 0.85 },
            { opacity: 1, scale: 1, duration: 0.8 },
            0.35,
          )
          .fromTo(
            inS(`.${styles.stepTitle}, .${styles.stepBody}`),
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 },
            0.4,
          );
        const chev = inS(`.${styles.chev}`);
        if (chev.length) {
          tl.fromTo(chev, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.8);
        }
      });

      /* --- script ------------------------------------------------------- */
      gsap.fromTo(
        q(`.${styles.script}`),
        { clipPath: "inset(-10% 100% -10% 0)" },
        {
          clipPath: "inset(-10% 0% -10% 0)",
          duration: 1.2,
          ease: EASE_IO,
          clearProps: "clipPath",
          scrollTrigger: { trigger: q(`.${styles.script}`)[0], start: "top 92%" },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  const c = huntsSteps;

  return (
    <section ref={rootRef} id="how" className={styles.section} aria-labelledby="hunts-steps-title">
      <div className={styles.atmos} aria-hidden="true" />

      <div className="frame">
        {/* ---------------- Statement ---------------- */}
        <div className={styles.head}>
          <p className={styles.eyebrow}>
            <span className={`${styles.eyebrowRule} ${styles.ruleL}`} aria-hidden="true" />
            <span className={`${styles.eyebrowLabel} f-cond cz caps`}>{c.eyebrow}</span>
            <span className={`${styles.eyebrowRule} ${styles.ruleR}`} aria-hidden="true" />
          </p>

          <h2 id="hunts-steps-title" className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner t-white">{c.titleWhite}</span>
            </span>
            <span className="line f-display cz">
              <span className="line-inner t-red">{c.titleRed}</span>
            </span>
          </h2>

          <p className={`${styles.subline} f-sans cz caps`} data-a>
            {c.subline}
          </p>
        </div>

        {/* ---------------- Steps ---------------- */}
        <ol className={styles.steps}>
          {c.steps.map((step, i) => (
            <li key={step.titleRed} className={styles.step}>
              <div className={styles.card} data-a>
                <span className={styles.disc} aria-hidden="true">
                  {i + 1}
                </span>
                <span className={styles.divider} aria-hidden="true" />

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.icon}
                  src={step.icon.src}
                  width={step.icon.width}
                  height={step.icon.height}
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                />

                <div className={styles.text}>
                  <h3 className={`${styles.stepTitle} f-display cz caps`}>
                    <span className={styles.stretch}>
                      <span className="sr-only">Step {i + 1}: </span>
                      {step.titleWhite} <span className={styles.red}>{step.titleRed}</span>
                    </span>
                  </h3>
                  <p className={`${styles.stepBody} f-sans cz`}>
                    {step.body.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </p>
                </div>
              </div>

              {i < c.steps.length - 1 && (
                <svg className={styles.chev} viewBox="0 0 42 22" aria-hidden="true" data-a>
                  <path d="M2 2l19 18L40 2" />
                </svg>
              )}
            </li>
          ))}
        </ol>

        {/* The brush-script line and its stroke, lifted from the mockup as an
            alpha image: hand-painted, not a font. A fixed 710px asset. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.script}
          src="/assets/images/hunts-steps-script.webp"
          width={710}
          height={148}
          alt={c.script}
          decoding="async"
          data-a
        />
      </div>
    </section>
  );
}

export default HuntsSteps;
