"use client";

/**
 * MERCH — section 4, "Why our merch matters" (mockups/Merch/4.png, a 941 x
 * 1671 phone frame).
 *
 * Three beats down one photograph (the mockup's own, its type filled in):
 *   1. "MORE THAN MERCH." over a two-line leaning headline and five red-
 *      checked points, beside a hooded figure; a tracked line under them.
 *   2. A red-framed panel: the QR-printed tee on the left, and on the right
 *      "SCAN. CONNECT. UNLOCK.", "BIGGER THAN A SHIRT.", two paragraphs, a
 *      red outline button and a tracked line.
 *   3. The crowd in matching tees with the painted "IT'S BIGGER THAN
 *      CLOTHES." (part of the picture), and a tracked line over a red bar.
 *
 * MOTION:
 *   • each eyebrow decodes and its headline's characters rise
 *   • the checks pop in one by one as their points lift
 *   • the panel's copy lifts, its button wipes open
 *   • the closing line decodes and its bar draws
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import { merchWhy } from "@/data/merch";
import styles from "./MerchWhy.module.css";

function Check() {
  return (
    <svg className={styles.check} viewBox="0 0 37 37" aria-hidden="true">
      <circle cx="18.5" cy="18.5" r="16.8" />
      <path d="m11 18.8 5.2 5.2 10-10.2" />
    </svg>
  );
}

export function MerchWhy() {
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

      /* --- 1. why ------------------------------------------------------- */
      const why = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.why}`)[0], start: "top 80%" },
      });
      const e1 = q(`.${styles.why} .${styles.eyebrow}`)[0] as HTMLElement | undefined;
      if (e1) why.add(scramble(e1, 0.9), 0);
      const t1 = q(`.${styles.why} .${styles.title}`)[0] as HTMLElement | undefined;
      if (t1) charsIn(why, splitTitle(t1), 0.15, 0.03);
      why
        .fromTo(
          q(`.${styles.check}`),
          { scale: 0.4, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(2)", stagger: 0.1 },
          0.7,
        )
        .fromTo(
          q(`.${styles.point} p`),
          { x: -14, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, stagger: 0.1 },
          0.75,
        )
        .fromTo(q(`.${styles.whyTag}`), { opacity: 0 }, { opacity: 1, duration: 1 }, 1.4);

      /* --- 2. scan ------------------------------------------------------ */
      const scan = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.scan}`)[0], start: "top 78%" },
      });
      const e2 = q(`.${styles.scan} .${styles.eyebrow}`)[0] as HTMLElement | undefined;
      if (e2) scan.add(scramble(e2, 0.9), 0);
      const t2 = q(`.${styles.scan} .${styles.title}`)[0] as HTMLElement | undefined;
      if (t2) charsIn(scan, splitTitle(t2), 0.15, 0.03);
      scan
        .fromTo(
          q(`.${styles.para}`),
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.12 },
          0.7,
        )
        .fromTo(
          q(`.${styles.btn}`),
          { opacity: 0, clipPath: "inset(0 50% 0 50%)" },
          { opacity: 1, clipPath: "inset(0 0% 0 0%)", duration: 1, ease: EASE_IO, clearProps: "clipPath" },
          1.0,
        )
        .fromTo(q(`.${styles.scanTag}`), { opacity: 0 }, { opacity: 1, duration: 1 }, 1.3);

      /* --- 3. close ----------------------------------------------------- */
      const close = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.close}`)[0], start: "top 95%" },
      });
      const t3 = q(`.${styles.closeTag}`)[0] as HTMLElement | undefined;
      if (t3) close.add(scramble(t3, 0.9), 0);
      close.fromTo(q(`.${styles.bar}`), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: EASE_IO }, 0.3);
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  const { why, scan } = merchWhy;

  return (
    <section ref={rootRef} id="why" className={styles.section} aria-labelledby="merch-why-title">
      {/* The mockup's own photograph — the hooded figure, the framed panel
          with the QR tee, the crowd and its painted script — with the type
          filled in (see data/merch.ts). */}
      <div className={styles.atmos} aria-hidden="true" />

      <div className={styles.frame}>
        {/* ---------------- 1. Why ---------------- */}
        <div className={styles.why}>
          <p className={`${styles.eyebrow} f-sans cz caps`}>{why.eyebrow}</p>
          <h2 id="merch-why-title" className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner t-white">{why.titleWhite}</span>
            </span>
            <span className="line f-display cz glow-text">
              <span className="line-inner t-red">{why.titleRed}</span>
            </span>
          </h2>
          <ul className={styles.points}>
            {why.points.map((lines) => (
              <li key={lines[0]} className={styles.point}>
                <Check />
                <p className="f-sans cz" data-a>
                  {lines.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </p>
              </li>
            ))}
          </ul>
          <p className={`${styles.whyTag} f-sans cz caps`} data-a>
            {why.tagline}
          </p>
        </div>

        {/* ---------------- 2. Scan ---------------- */}
        <div className={styles.scan}>
          <p className={`${styles.eyebrow} f-sans cz caps`}>{scan.eyebrow}</p>
          <h2 className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner t-white">{scan.titleWhite}</span>
            </span>
            <span className="line f-display cz glow-text">
              <span className="line-inner t-red">{scan.titleRed}</span>
            </span>
          </h2>
          {scan.paragraphs.map((lines) => (
            <p key={lines[0]} className={`${styles.para} f-sans cz`} data-a>
              {lines.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </p>
          ))}
          <a href={scan.cta.href} className={styles.btn} data-a>
            <span className="f-cond cz caps">{scan.cta.label}</span>
            <svg className={styles.btnArrow} viewBox="0 0 28 16" aria-hidden="true">
              <path d="M1 8h25M19 1.5 26 8l-7 6.5" />
            </svg>
          </a>
          <p className={`${styles.scanTag} f-sans cz caps`} data-a>
            {scan.tagline}
          </p>
        </div>

        {/* ---------------- 3. Close ---------------- */}
        <p className="sr-only">{merchWhy.script}</p>
        <div className={styles.close}>
          <p className={`${styles.closeTag} f-sans cz caps`} data-a>
            {merchWhy.tagline}
          </p>
          <span className={styles.bar} aria-hidden="true" data-a />
        </div>
      </div>
    </section>
  );
}

export default MerchWhy;
