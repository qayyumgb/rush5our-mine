"use client";

/**
 * RUSH HUNTS — section 1, "You found a Rush Hunt sticker." (mockups/Rush
 * Hunts/1.png, a 950 x 1655 phone frame).
 *
 * A full-bleed night photograph — a wet street out of focus on the left, a
 * pole carrying the sticker on the right — with the copy down the left: a
 * three-line headline set on a rising tilt, the red script line and its
 * brush beneath, three lines of copy, the red button and an outlined one
 * with a play disc, and at the foot a three-beat line between two red
 * dashes over a red arrow.
 *
 * MOTION, one timeline on arrival (no preloader on this page, so the intro
 * gate is opened here, as the About and Contact heroes do):
 *   1. the photograph settles out of a slight push-in
 *   2. the headline's characters rise from behind their line masks
 *   3. the script writes on, left to right
 *   4. copy lifts, then the two buttons wipe open
 *   5. the cue's dashes draw outward, its label decodes, the arrow drops
 *      in and then bobs
 *
 * Everything the timeline touches is marked `data-a`, so nothing paints
 * before its entrance exists. No standing `will-change` or `translateZ(0)`
 * — see AboutHero.tsx.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn, pauseWhenOffscreen } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { openIntroGate } from "@/lib/motion/intro";
import { useMotion } from "@/components/motion/MotionProvider";
import RedButton from "@/components/ui/RedButton";
import { huntsHero } from "@/data/hunts";
import styles from "./HuntsHero.module.css";

export function HuntsHero() {
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

    let stopWatching = () => {};
    const ctx = gsap.context(() => {
      gsap.set(q("[data-a]"), { visibility: "visible" });

      const tl = gsap.timeline({ defaults: { ease: EASE } });

      tl.fromTo(
        q(`.${styles.photo}`),
        { scale: 1.08, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.8, ease: "power2.out" },
        0,
      );

      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(tl, splitTitle(title), 0.35);

      tl.fromTo(
        q(`.${styles.script}`),
        { clipPath: "inset(-10% 100% -10% 0)" },
        { clipPath: "inset(-10% 0% -10% 0)", duration: 1.1, ease: EASE_IO, clearProps: "clipPath" },
        1.05,
      )
        .fromTo(
          q(`.${styles.body} span`),
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.08 },
          1.2,
        )
        .fromTo(
          q(`.${styles.btnWrap}`),
          { y: 24, opacity: 0, clipPath: "inset(0% 100% 0% 0%)" },
          {
            y: 0,
            opacity: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.1,
            stagger: 0.15,
            ease: EASE_IO,
            clearProps: "clipPath",
          },
          1.45,
        )
        .fromTo(
          q(`.${styles.cueDash}`),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, ease: EASE_IO },
          1.9,
        )
        .fromTo(
          q(`.${styles.cueArrow}`),
          { y: -14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          2.2,
        );
      const label = q(`.${styles.cueLabel}`)[0] as HTMLElement | undefined;
      if (label) tl.add(scramble(label, 0.9), 1.95);

      // The arrow's idle bob, paused while the hero is off screen.
      stopWatching = pauseWhenOffscreen(root, [
        gsap.to(q(`.${styles.cueArrow} svg`), {
          y: 7,
          duration: 1.1,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 3,
        }),
      ]);
    }, root);

    return () => {
      stopWatching();
      ctx.revert();
    };
  }, [ready, reduced]);

  const { media } = huntsHero;

  return (
    <section ref={rootRef} className={styles.hero} aria-labelledby="hunts-title">
      {/* ---------------- Background ----------------
          The mockup's own photograph — see the note in data/hunts.ts. */}
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.photo} data-a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.img}
            src={media.tall.src}
            width={media.tall.width}
            height={media.tall.height}
            alt={media.alt}
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </div>
      <div className={styles.shade} aria-hidden="true" />

      {/* ---------------- Copy ---------------- */}
      <div className={styles.copy}>
        <h1 id="hunts-title" className={styles.title} data-a>
          {huntsHero.title.map((line) => (
            <span
              key={line.text}
              className={`line f-display cz${line.red ? " glow-text" : ""}`}
            >
              <span className={`line-inner ${line.red ? "t-red" : "t-white"}`}>{line.text}</span>
            </span>
          ))}
        </h1>

        {/* The brush-script line and its stroke, lifted from the mockup as an
            alpha image: hand-painted, not a font. A fixed 550px asset. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.script}
          src="/assets/images/hunts-hero-script.webp"
          width={550}
          height={150}
          alt={huntsHero.script}
          decoding="async"
          data-a
        />

        <p className={`${styles.body} f-sans cz`} data-a>
          {huntsHero.bodyLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>

        <div className={styles.btnWrap} data-a>
          <RedButton
            label={huntsHero.primaryCta.label}
            href={huntsHero.primaryCta.href}
            className={styles.btn}
            arrow="long"
            magnetStrength={0.18}
          />
        </div>

        <div className={styles.btnWrap} data-a>
          <a href={huntsHero.secondaryCta.href} className={`${styles.btn} ${styles.btnOutline}`}>
            <span className={styles.playDisc} aria-hidden="true">
              <svg viewBox="0 0 12 14">
                <path d="M0 0v14l12-7z" fill="currentColor" />
              </svg>
            </span>
            <span className="f-cond cz caps">{huntsHero.secondaryCta.label}</span>
          </a>
        </div>
      </div>

      {/* ---------------- Cue ---------------- */}
      <a href={huntsHero.cue.href} className={styles.cue} aria-label={huntsHero.cue.label}>
        <span className={styles.cueRow}>
          <span className={`${styles.cueDash} ${styles.cueDashL}`} aria-hidden="true" data-a />
          <span className={`${styles.cueLabel} f-sans cz caps`} aria-hidden="true" data-a>
            {huntsHero.cue.label}
          </span>
          <span className={`${styles.cueDash} ${styles.cueDashR}`} aria-hidden="true" data-a />
        </span>
        <span className={styles.cueArrow} aria-hidden="true" data-a>
          <svg viewBox="0 0 27 36">
            <path d="M13.5 1.5v32M2 22.5l11.5 11.5L25 22.5" />
          </svg>
        </span>
      </a>
    </section>
  );
}

export default HuntsHero;
