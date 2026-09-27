"use client";

/**
 * ABOUT — section 2, "More than content. Real impact." (mockups/About/2.png).
 *
 * A left-aligned statement over a 3x2 grid of the brand's values, each an
 * outlined red icon, a condensed title, a short red rule and two or three
 * lines of copy. Hairline red dividers split the columns of each row.
 *
 * MOTION:
 *   • the shared `headReveal` opens the statement (eyebrow decodes, headline
 *     characters rise, the paragraph lifts) — the same entrance every
 *     section on the homepage uses
 *   • each row's dividers draw down from the top, then its cells rise in
 *     turn; inside each cell the icon draws its strokes on, the title and
 *     rule follow, and the copy settles last
 *
 * Everything is transform / opacity / stroke-dashoffset, and none of it
 * carries a standing `will-change` — see the note in AboutHero.tsx.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, headReveal, prepareStrokes } from "@/lib/motion/helpers";
import { useMotion } from "@/components/motion/MotionProvider";
import Eyebrow from "@/components/ui/Eyebrow";
import Icon from "@/components/ui/Icon";
import { aboutValues } from "@/data/about";
import styles from "./AboutValues.module.css";

const PER_ROW = 3;

export function AboutValues() {
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

      /* --- statement ---------------------------------------------------- */
      const head = q(`.${styles.head}`)[0] as HTMLElement | undefined;
      if (head) headReveal(head, { copy: q(`.${styles.body}`) });

      /* --- grid, one timeline per row ----------------------------------- */
      (q(`.${styles.row}`) as HTMLElement[]).forEach((row) => {
        const inRow = gsap.utils.selector(row);
        const tl = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: row, start: "top 84%" },
        });

        tl.fromTo(
          inRow(`.${styles.divider}`),
          { scaleY: 0 },
          { scaleY: 1, duration: 1.1, ease: EASE_IO },
          0,
        )
          .fromTo(
            inRow(`.${styles.cell}`),
            { y: 44, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.2, stagger: 0.12 },
            0.1,
          )
          .fromTo(
            inRow(".i-stroke"),
            // Each path starts fully undrawn by its own measured length,
            // which `prepareStrokes` stashed on the element.
            {
              strokeDashoffset: (_i: number, el: Element) =>
                Number((el as SVGElement).dataset.len ?? 0),
            },
            { strokeDashoffset: 0, duration: 1.3, stagger: 0.04, ease: "power2.inOut" },
            0.35,
          )
          .fromTo(
            inRow(`.${styles.cellTitle}`),
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, stagger: 0.12 },
            0.5,
          )
          .fromTo(
            inRow(`.${styles.cellRule}`),
            { scaleX: 0 },
            { scaleX: 1, duration: 0.8, stagger: 0.12, ease: EASE_IO },
            0.6,
          )
          .fromTo(
            inRow(`.${styles.cellBody}`),
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, stagger: 0.12 },
            0.7,
          );
      });
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  // Three to a row, so a CMS can add a value without touching the markup.
  const rows: (typeof aboutValues.values)[] = [];
  for (let i = 0; i < aboutValues.values.length; i += PER_ROW) {
    rows.push(aboutValues.values.slice(i, i + PER_ROW));
  }

  return (
    <section
      ref={rootRef}
      id="story"
      className={styles.values}
      aria-labelledby="about-values-title"
    >
      <div className={styles.atmos} aria-hidden="true" />

      <div className="frame">
        {/* ---------------- Statement ---------------- */}
        <div className={styles.head}>
          <Eyebrow
            label={aboutValues.eyebrow}
            className={styles.eyebrow}
            labelClassName={styles.eyebrowLabel}
            ruleClassName={styles.eyebrowRule}
          />

          <h2 id="about-values-title" className={styles.title}>
            {aboutValues.titleWhite.map((line) => (
              <span key={line} className="line f-display cz">
                <span className="line-inner t-white">{line}</span>
              </span>
            ))}
            <span className="line f-display cz glow-text">
              <span className="line-inner t-red">{aboutValues.titleRed}</span>
            </span>
          </h2>

          {/* Explicit lines so the ragged setting matches the mockup rather
              than the font's own wrap; each is plain text and still
              re-wraps on a screen too narrow for it. */}
          <p className={`${styles.body} f-sans cz`}>
            {aboutValues.bodyLines.map((line) => (
              <span key={line} className={styles.bodyLine}>
                {line}
              </span>
            ))}
          </p>
        </div>

        {/* ---------------- Values grid ---------------- */}
        <div className={styles.grid} data-a>
          {rows.map((row, r) => (
            <div key={r} className={styles.row}>
              {/* Dividers sit between the columns, never after the last. */}
              {row.slice(1).map((_, i) => (
                <span
                  key={i}
                  className={styles.divider}
                  style={{ left: `${((i + 1) / PER_ROW) * 100}%` }}
                  aria-hidden="true"
                />
              ))}

              {row.map((v) => (
                <div key={v.title} className={styles.cell}>
                  <Icon name={v.icon} className={styles.icon} />

                  <h3 className={`${styles.cellTitle} f-display cz`}>{v.title}</h3>

                  <span className={styles.cellRule} aria-hidden="true" />

                  <p className={`${styles.cellBody} f-sans cz`}>
                    {v.body.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutValues;
