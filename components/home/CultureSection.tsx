"use client";

/**
 * CULTURE — section 5, "This is more than content. This is a culture."
 * (mockup 5.png).
 *
 * A centred three-line statement, the primary CTA, and a 2x2 feature grid
 * split by a hairline cross.
 *
 * MOTION:
 *   • the statement uses the shared `headReveal`, so its headline rises the
 *     same way every other section's does
 *   • the dividing cross draws itself open from the centre outward, which is
 *     what makes the grid feel constructed rather than simply faded in
 *   • each cell rises in turn, its title and copy following
 *
 * The feature icons are deliberately static — no glow, no hover, no entrance
 * or ambient animation. They ride in with their cell and then stay put.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, headReveal } from "@/lib/motion/helpers";
import { useMotion } from "@/components/motion/MotionProvider";
import Eyebrow from "@/components/ui/Eyebrow";
import Icon from "@/components/ui/Icon";
import RedButton from "@/components/ui/RedButton";
import { culture } from "@/data/culture";
import styles from "./CultureSection.module.css";

export function CultureSection() {
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
      const head = q(`.${styles.head}`)[0] as HTMLElement | undefined;
      if (head) {
        const tl = headReveal(head, { copy: q(`.${styles.sub} span`) });
        tl.fromTo(
          q(`.${styles.btnWrap}`),
          { y: 28, opacity: 0, clipPath: "inset(0% 50% 0% 50%)" },
          {
            y: 0,
            opacity: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.2,
            ease: EASE_IO,
            clearProps: "clipPath",
          },
          0.75,
        );
      }

      /* --- grid --------------------------------------------------------- */
      const grid = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.grid}`)[0], start: "top 84%" },
      });

      grid
        // The cross opens from its centre, drawing the grid into existence.
        .fromTo(
          q(`.${styles.divH}`),
          { scaleX: 0 },
          { scaleX: 1, duration: 1.2, ease: EASE_IO },
          0,
        )
        .fromTo(q(`.${styles.divV}`), { scaleY: 0 }, { scaleY: 1, duration: 1.2, ease: EASE_IO }, 0.1)
        .fromTo(
          q(`.${styles.cell}`),
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, stagger: 0.12 },
          0.15,
        )
        // The icons are intentionally left alone — no pop, no stroke draw-on,
        // no ambient pulse. They simply ride in with their cell.
        .fromTo(
          q(`.${styles.cellTitle}`),
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.12 },
          0.6,
        )
        .fromTo(
          q(`.${styles.cellBody}`),
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.12 },
          0.72,
        );

      // (No ambient loop on the icons — they stay static by design.)
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <section ref={rootRef} id="culture" className={styles.culture} aria-labelledby="culture-title">
      <div className={styles.atmos} aria-hidden="true" />

      <div className="frame">
        {/* ---------------- Statement ---------------- */}
        <div className={styles.head}>
          <Eyebrow
            label={culture.eyebrow}
            rules="both"
            className={styles.eyebrow}
            labelClassName={styles.eyebrowLabel}
            ruleClassName={styles.eyebrowRule}
          />

          <h2 id="culture-title" className={styles.title}>
            <span className={`line ${styles.l1} f-display cz`}>
              <span className="line-inner t-white">{culture.titleWhite[0]}</span>
            </span>
            <span className={`line ${styles.l2} f-display cz`}>
              <span className="line-inner t-white">{culture.titleWhite[1]}</span>
            </span>
            <span className={`line ${styles.l3} f-display cz glow-text`}>
              <span className="line-inner t-red">{culture.titleRed}</span>
            </span>
          </h2>

          <p className={`${styles.sub} f-sans cz caps`}>
            {culture.subLines.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </p>

          <div className={styles.btnWrap}>
            <RedButton
              label={culture.cta.label}
              href={culture.cta.href}
              className={styles.btn}
              arrow="long"
              magnetStrength={0.18}
            />
          </div>
        </div>

        {/* ---------------- Feature grid ---------------- */}
        <div className={styles.grid} data-a>
          <span className={styles.divH} aria-hidden="true" />
          <span className={styles.divV} aria-hidden="true" />

          {culture.features.map((f) => (
            <div key={f.title.join(" ")} className={styles.cell}>
              <Icon name={f.icon} className={styles.icon} />

              <h3 className={`${styles.cellTitle} f-display cz`}>
                {f.title.map((line, i) => (
                  <span key={i}>{line}</span>
                ))}
              </h3>

              <p className={`${styles.cellBody} f-sans cz`}>
                {f.body.map((line, i) => (
                  <span key={i}>{line}</span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CultureSection;
