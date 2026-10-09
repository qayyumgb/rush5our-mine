"use client";

/**
 * MERCH — section 3, "Locked future drops" (mockups/Merch/3.png, a 941 x
 * 1672 phone frame).
 *
 * The teaser: a red tracked "LOCKED", a two-line leaning headline, a
 * two-line tracked subline, over the section's photograph — a blurred tee
 * under a spotlight with a red-bracketed padlock, on a crate in a red-lit
 * hallway with the designer's painted notes (all the mockup's own). A ring
 * at each side steps through the locked levels; the crate's face shows the
 * level, its name, a red rule and the red-framed "LOCKED" bar; five dots.
 *
 * The bar links to the Join page — "unlock more by being part of the
 * movement" — and says so on hover.
 *
 * MOTION:
 *   • the eyebrow decodes, the headline's characters rise, the subline lifts
 *   • the rings pop in; the level, name, rule and bar lift in turn; the dots
 *     follow
 *   • a level change swaps the text with a short lift, and the padlock in
 *     the picture gets a red pulse
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import { merchLocked } from "@/data/merch";
import styles from "./MerchLocked.module.css";

export function MerchLocked() {
  const rootRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef(true);
  const { ready, reduced } = useMotion();
  const [index, setIndex] = useState(0);

  const c = merchLocked;
  const count = c.levels.length;
  const current = c.levels[index];

  /* --- entrance ---------------------------------------------------------- */
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

      const head = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.head}`)[0], start: "top 80%" },
      });
      const label = q(`.${styles.eyebrow}`)[0] as HTMLElement | undefined;
      if (label) head.add(scramble(label, 0.9), 0);
      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(head, splitTitle(title), 0.2, 0.05);
      head.fromTo(
        q(`.${styles.subline} span`),
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1 },
        0.9,
      );

      gsap
        .timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: q(`.${styles.rings}`)[0], start: "top 85%" },
        })
        .fromTo(
          q(`.${styles.ring}`),
          { scale: 0.6, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.9, ease: "back.out(1.8)", stagger: 0.1 },
          0,
        );

      gsap
        .timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: q(`.${styles.panel}`)[0], start: "top 88%" },
        })
        .fromTo(
          q(`.${styles.level}, .${styles.name}`),
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.12 },
          0,
        )
        .fromTo(q(`.${styles.rule}`), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: EASE_IO }, 0.3)
        .fromTo(
          q(`.${styles.bar}`),
          { opacity: 0, clipPath: "inset(0 50% 0 50%)" },
          { opacity: 1, clipPath: "inset(0 0% 0 0%)", duration: 1, ease: EASE_IO, clearProps: "clipPath" },
          0.45,
        )
        .fromTo(q(`.${styles.dot}`), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, stagger: 0.06 }, 0.8);
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  /* --- level change -------------------------------------------------------- */
  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      return;
    }
    const root = rootRef.current;
    if (!root || reduced) return;
    const q = gsap.utils.selector(root);
    gsap.fromTo(
      q(`.${styles.level}, .${styles.name}`),
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: EASE, overwrite: true },
    );
    gsap.fromTo(
      plateRef.current,
      { "--pulse": 1 },
      { "--pulse": 0, duration: 1.1, ease: "power2.out", overwrite: true },
    );
  }, [index, reduced]);

  const go = (next: number) => setIndex(((next % count) + count) % count);

  return (
    <section ref={rootRef} id="locked" className={styles.section} aria-labelledby="merch-locked-title">
      {/* The mockup's own photograph, with its type and controls filled in —
          see data/merch.ts. The padlock and its brackets are part of it. */}
      <div ref={plateRef} className={styles.atmos} aria-hidden="true">
        <span className={styles.pulse} />
      </div>

      <div className={styles.frame}>
        {/* ---------------- Statement ---------------- */}
        <div className={styles.head}>
          <p className={`${styles.eyebrow} f-sans cz caps`}>{c.eyebrow}</p>
          <h2 id="merch-locked-title" className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner t-white">{c.titleWhite}</span>
            </span>
            <span className="line f-display cz glow-text">
              <span className="line-inner t-red">{c.titleRed}</span>
            </span>
          </h2>
          <p className={`${styles.subline} f-sans cz caps`} data-a>
            {c.sublines.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </p>
        </div>

        {/* ---------------- Rings ---------------- */}
        <div className={styles.rings}>
          <button
            type="button"
            className={`${styles.ring} ${styles.ringL}`}
            aria-label="Previous locked drop"
            onClick={() => go(index - 1)}
            data-a
          >
            <svg viewBox="0 0 12 23" aria-hidden="true">
              <path d="M10.5 1.5 1.5 11.5l9 10" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.ring} ${styles.ringR}`}
            aria-label="Next locked drop"
            onClick={() => go(index + 1)}
            data-a
          >
            <svg viewBox="0 0 12 23" aria-hidden="true">
              <path d="m1.5 1.5 9 10-9 10" />
            </svg>
          </button>
        </div>

        {/* ---------------- The crate's face ---------------- */}
        <div className={styles.panel} aria-live="polite">
          <h3 className={`${styles.level} f-display cz caps`} data-a>
            <span className={styles.slant}>{current.level}</span>
          </h3>
          <p className={`${styles.name} f-sans cz caps`} data-a>
            {current.name}
          </p>
          <span className={styles.rule} aria-hidden="true" data-a />

          <a
            href={c.locked.href}
            className={styles.bar}
            aria-label={`${current.level} ${current.name}: ${c.locked.label}. ${c.locked.hint}.`}
            data-a
          >
            <svg className={styles.lock} viewBox="0 0 42 56" aria-hidden="true">
              <path d="M9 23V15a12 12 0 0 1 24 0v8" fill="none" stroke="currentColor" strokeWidth="6" />
              <path
                fillRule="evenodd"
                d="M4 23h34a4 4 0 0 1 4 4v25a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V27a4 4 0 0 1 4-4Zm17 9a5 5 0 0 0-3 9v6h6v-6a5 5 0 0 0-3-9Z"
                fill="currentColor"
              />
            </svg>
            <span className={styles.barText}>
              <span className={`${styles.barLabel} f-cond cz caps`}>{c.locked.label}</span>
              <span className={`${styles.barHint} f-cond cz caps`} aria-hidden="true">
                {c.locked.hint}
              </span>
            </span>
          </a>
        </div>

        {/* ---------------- Dots ---------------- */}
        <div className={styles.dots}>
          {c.levels.map((l, i) => (
            <button
              key={l.level}
              type="button"
              className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
              aria-label={`Show ${l.level}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
              data-a
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default MerchLocked;
