"use client";

/**
 * ABOUT — section 3, "How we're making it real" (mockups/About/3.png).
 *
 * Three numbered rows, each a filled icon tile beside a two-line title, a
 * paragraph of body copy below spanning the full column, a short red rule,
 * and a huge outlined numeral standing behind the title's right shoulder.
 * A closing line, flanked by hairlines, sits at the foot.
 *
 * MOTION:
 *   • the shared `headReveal` opens the eyebrow
 *   • each row animates as its own timeline: the icon tile scales in, the
 *     numeral fades up behind it, the title's characters rise, the body
 *     lifts, and the rule draws open — the same vocabulary the rest of the
 *     page uses, just recombined per row
 *   • the footer's hairlines draw open from the centre and its label
 *     decodes, mirroring the eyebrow it echoes
 *
 * No standing `will-change` or `translateZ(0)` — see the note in
 * AboutHero.tsx for why.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import Eyebrow from "@/components/ui/Eyebrow";
import Icon from "@/components/ui/Icon";
import { aboutPillars } from "@/data/about";
import styles from "./AboutPillars.module.css";

export function AboutPillars() {
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

      /* --- eyebrow -------------------------------------------------------- */
      const eyebrowLabel = q(".js-eyebrow-label")[0] as HTMLElement | undefined;
      const eyebrowTl = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.head}`)[0], start: "top 85%" },
      });
      if (eyebrowLabel) eyebrowTl.add(scramble(eyebrowLabel, 0.9), 0);
      const eyebrowRule = q(".js-eyebrow-rule")[0];
      if (eyebrowRule) {
        eyebrowTl.fromTo(eyebrowRule, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: EASE_IO }, 0.1);
      }

      /* --- each row, its own timeline ------------------------------------- */
      (q(`.${styles.row}`) as HTMLElement[]).forEach((row) => {
        const inRow = gsap.utils.selector(row);
        const tl = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: row, start: "top 82%" },
        });

        tl.fromTo(
          inRow(`.${styles.icon}`),
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.9, ease: "back.out(1.8)" },
          0,
        ).fromTo(
          inRow(`.${styles.numeral}`),
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 1.2, ease: EASE_IO },
          0.15,
        );

        const titleEl = inRow(`.${styles.title}`)[0] as HTMLElement | undefined;
        if (titleEl) charsIn(tl, splitTitle(titleEl), 0.1);

        tl.fromTo(
          inRow(`.${styles.body}`),
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.1 },
          0.35,
        ).fromTo(
          inRow(`.${styles.rule}`),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.7, ease: EASE_IO },
          0.6,
        );

        // Draws left-to-right after the copy has landed. Rows without one
        // (the last) simply have nothing to animate here.
        const hairline = inRow(`.${styles.hairline}`);
        if (hairline.length) {
          tl.fromTo(hairline, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: EASE_IO }, 0.75);
        }
      });

      /* --- footer ----------------------------------------------------------- */
      const footer = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.footer}`)[0], start: "top 92%" },
      });
      footer
        .fromTo(q(`.${styles.footerTick}`), { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: EASE_IO }, 0)
        .fromTo(
          q(`.${styles.footerDash}`),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, ease: EASE_IO, stagger: 0.1 },
          0.15,
        );
      const footerLabel = q(`.${styles.footerLabel}`)[0] as HTMLElement | undefined;
      if (footerLabel) footer.add(scramble(footerLabel, 0.8), 0.2);
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <section
      ref={rootRef}
      id="building"
      className={styles.pillars}
      aria-labelledby="about-pillars-title"
    >
      <div className="frame">
        <div className={styles.head}>
          <Eyebrow
            label={aboutPillars.eyebrow}
            className={styles.eyebrow}
            labelClassName={styles.eyebrowLabel}
            ruleClassName={styles.eyebrowRule}
          />
        </div>
        {/* Visually-hidden heading: the mockup carries no single h2 — each
            row has its own title — but the section still needs a name for
            assistive tech and the aria-labelledby above. */}
        <h2 id="about-pillars-title" className="sr-only">
          {aboutPillars.eyebrow}
        </h2>

        <div className={styles.rows}>
          {aboutPillars.pillars.map((pillar, i) => (
            <div key={pillar.titleRed} className={styles.row}>
              <span className={styles.numeral} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className={styles.rowHead}>
                <div className={styles.iconTile} aria-hidden="true">
                  <Icon name={pillar.icon} className={styles.icon} />
                </div>

                <h3 className={styles.title}>
                  <span className={`${styles.titleWhite} line f-display cz`}>
                    <span className="line-inner t-white">{pillar.titleWhite}</span>
                  </span>
                  <span className={`${styles.titleRed} line f-display cz glow-text`}>
                    <span className="line-inner t-red">{pillar.titleRed}</span>
                  </span>
                </h3>
              </div>

              {pillar.body.map((paragraph, p) => (
                <p key={p} className={`${styles.body} f-sans cz`} data-a>
                  {paragraph.map((line) => (
                    <span key={line} className={styles.bodyLine}>
                      {line}
                    </span>
                  ))}
                </p>
              ))}

              <span className={styles.rule} aria-hidden="true" />

              {/* Full-width hairline between rows; the last row runs
                  straight into the footer. */}
              {i < aboutPillars.pillars.length - 1 && (
                <span className={styles.hairline} aria-hidden="true" />
              )}
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <span className={styles.footerTick} aria-hidden="true" />
          <p className={styles.footerRow}>
            <span className={styles.footerDash} aria-hidden="true" />
            <span className={`${styles.footerLabel} f-sans cz caps js-eyebrow-label`}>
              {aboutPillars.footer}
            </span>
            <span className={styles.footerDash} aria-hidden="true" />
          </p>
        </div>
      </div>
    </section>
  );
}

export default AboutPillars;
