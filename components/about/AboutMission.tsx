"use client";

/**
 * ABOUT — section 5, "The mission is simple" / "Welcome to the culture"
 * (mockups/About/5.png).
 *
 * Two halves on one black ground, split by a torn-paper edge:
 *   • a six-line mission list — outlined icon square, a two-colour title
 *     and one line of copy each
 *   • the welcome: a centred two-line headline, three lines of copy, the
 *     primary button, a three-column strip of icon + label pairs, the
 *     handwritten sign-off with its red sweep, and a tracked tagline
 *
 * MOTION:
 *   • the shared `headReveal` opens the eyebrow
 *   • each mission row rises in turn; its square draws its four sides on
 *     and the glyph inside strokes itself
 *   • the tear rips across from left to right
 *   • the welcome headline's characters rise, the copy lifts, the button
 *     wipes open from its centre (as on the homepage's culture section),
 *     the strip's dividers drop and its glyphs draw, the sign-off writes
 *     itself and the tagline decodes
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn, headReveal, prepareStrokes, writeHand } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import Eyebrow from "@/components/ui/Eyebrow";
import HandAccent from "@/components/ui/HandAccent";
import Icon from "@/components/ui/Icon";
import RedButton from "@/components/ui/RedButton";
import { aboutMission } from "@/data/about";
import styles from "./AboutMission.module.css";

/* Torn edge, traced off the mockup: the paper line wanders between y 5 and
   14 of an 18-tall band across the 950 frame. Two strokes, the second a
   little lower and fainter, read as a lit edge over its shadow. */
const TEAR =
  "M0 10 L20 9 40 11 60 8 80 10 100 6 120 7 140 5 160 7 180 9 200 8 220 10 240 7 260 6 280 8 300 5 320 6 340 4 360 5 380 8 400 7 420 9 440 6 460 8 480 9 500 8 520 10 540 7 560 8 580 6 600 5 620 7 640 4 660 5 680 7 700 6 720 9 740 8 760 10 780 9 800 8 820 11 840 10 860 13 880 11 900 8 920 9 950 9";

export function AboutMission() {
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

      /* --- eyebrow ------------------------------------------------------ */
      const head = q(`.${styles.head}`)[0] as HTMLElement | undefined;
      if (head) headReveal(head);

      /* --- mission list ------------------------------------------------- */
      const list = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.list}`)[0], start: "top 80%" },
      });
      (q(`.${styles.item}`) as HTMLElement[]).forEach((item, i) => {
        const at = i * 0.12;
        const inItem = gsap.utils.selector(item);
        list
          .fromTo(item, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, at)
          // The square's four sides draw on as one stroke.
          .fromTo(
            inItem(`.${styles.boxEdge}`),
            { strokeDashoffset: (_i: number, el: Element) => Number((el as SVGElement).dataset.len ?? 0) },
            { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" },
            at + 0.1,
          )
          .fromTo(
            inItem(`.${styles.glyph} .i-stroke`),
            { strokeDashoffset: (_i: number, el: Element) => Number((el as SVGElement).dataset.len ?? 0) },
            { strokeDashoffset: 0, duration: 0.9, stagger: 0.05, ease: "power2.inOut" },
            at + 0.35,
          );
      });

      /* --- tear ---------------------------------------------------------- */
      // A clip wipe rather than a dash draw: the SVG is stretched to the
      // viewport width, and dash lengths measured in viewBox units would
      // only ever cover part of the stretched path.
      gsap.fromTo(
        q(`.${styles.tear}`),
        { clipPath: "inset(-50% 100% -50% 0)" },
        {
          clipPath: "inset(-50% 0% -50% 0)",
          duration: 1.6,
          ease: "power2.inOut",
          clearProps: "clipPath",
          scrollTrigger: { trigger: q(`.${styles.tear}`)[0], start: "top 90%" },
        },
      );

      /* --- welcome ------------------------------------------------------ */
      const welcome = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.welcome}`)[0], start: "top 78%" },
      });
      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) {
        charsIn(welcome, splitTitle(title), 0);
        welcome.add(() => title.classList.add("sheen"), 0.8);
      }
      welcome
        .fromTo(
          q(`.${styles.copy} span`),
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.1 },
          0.35,
        )
        .fromTo(
          q(`.${styles.btnWrap}`),
          { y: 28, opacity: 0, clipPath: "inset(0% 50% 0% 50%)" },
          { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: EASE_IO, clearProps: "clipPath" },
          0.65,
        )
        .fromTo(
          q(`.${styles.statDivider}`),
          { scaleY: 0 },
          { scaleY: 1, duration: 1, ease: EASE_IO, stagger: 0.1 },
          0.9,
        )
        .fromTo(
          q(`.${styles.stat}`),
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.12 },
          0.95,
        )
        .fromTo(
          q(`.${styles.statIcon} .i-stroke`),
          { strokeDashoffset: (_i: number, el: Element) => Number((el as SVGElement).dataset.len ?? 0) },
          { strokeDashoffset: 0, duration: 1, stagger: 0.04, ease: "power2.inOut" },
          1.05,
        );
      (q(`.${styles.statTop}`) as HTMLElement[]).forEach((s, i) => {
        welcome.add(scramble(s, 0.7), 1.1 + i * 0.12);
      });

      /* --- sign-off ----------------------------------------------------- */
      // This is the foot of the page. On a tall viewport the document stops
      // scrolling with the signature still low in view, so it triggers the
      // moment it enters rather than at the usual 80-90% line.
      const signoff = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.signature}`)[0], start: "top bottom" },
      });
      writeHand(signoff, q(`.${styles.signature}`)[0] ?? null, 0);
      const tag = q(`.${styles.tagline}`)[0] as HTMLElement | undefined;
      if (tag) signoff.add(scramble(tag, 0.9), 0.5);
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <section
      ref={rootRef}
      id="mission"
      className={styles.mission}
      aria-labelledby="about-mission-title"
    >
      <div className="frame">
        {/* ---------------- Mission list ---------------- */}
        <div className={styles.head}>
          <Eyebrow
            label={aboutMission.eyebrow}
            className={styles.eyebrow}
            labelClassName={styles.eyebrowLabel}
            ruleClassName={styles.eyebrowRule}
          />
        </div>
        <h2 id="about-mission-title" className="sr-only">
          {aboutMission.eyebrow}
        </h2>

        <ul className={styles.list} data-a>
          {aboutMission.items.map((item) => (
            <li key={item.titleRed} className={styles.item}>
              {/* The outlined square is an SVG so its border can be drawn on
                  as a stroke; the glyph sits in the middle of it. */}
              <span className={styles.box} aria-hidden="true">
                <svg className={styles.boxSvg} viewBox="0 0 88 82" preserveAspectRatio="none">
                  <rect className={`${styles.boxEdge} i-stroke`} x="1" y="1" width="86" height="80" />
                </svg>
                <Icon name={item.icon} className={styles.glyph} />
              </span>

              <div className={styles.itemBody}>
                <h3 className={`${styles.itemTitle} f-cond cz caps`}>
                  <span className="t-white">{item.titleWhite} </span>
                  <span className={styles.itemTitleRed}>{item.titleRed}</span>
                </h3>
                <p className={`${styles.itemDesc} f-sans cz`}>{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* ---------------- Torn edge ---------------- */}
        <svg
          className={styles.tear}
          viewBox="0 0 950 18"
          preserveAspectRatio="none"
          aria-hidden="true"
          data-a
        >
          <path className={styles.tearShadow} d={TEAR} />
          <path className={styles.tearEdge} d={TEAR} />
        </svg>

        {/* ---------------- Welcome ---------------- */}
        <div className={styles.welcome}>
          <h3 className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner t-white">{aboutMission.welcomeWhite}</span>
            </span>
            <span className="line f-display cz glow-text">
              <span className="line-inner t-red">{aboutMission.welcomeRed}</span>
            </span>
          </h3>

          <p className={`${styles.copy} f-sans cz`}>
            {aboutMission.copyLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
            <span className={styles.copyRed}>{aboutMission.copyRed}</span>
          </p>

          <div className={styles.btnWrap}>
            <RedButton
              label={aboutMission.cta.label}
              href={aboutMission.cta.href}
              className={styles.btn}
              arrow="long"
              magnetStrength={0.18}
            />
          </div>

          <div className={styles.stats}>
            {aboutMission.stats.map((stat, i) => (
              <div key={stat.bottom} className={styles.stat}>
                {i > 0 && <span className={styles.statDivider} aria-hidden="true" />}
                <Icon name={stat.icon} className={styles.statIcon} />
                <span className={`${styles.statTop} f-sans cz caps`}>{stat.top}</span>
                <span className={`${styles.statBottom} f-display cz caps`}>{stat.bottom}</span>
              </div>
            ))}
          </div>

          <HandAccent
            lines={[aboutMission.signature]}
            className={styles.signature}
            textClassName={styles.signatureText}
            underline="long"
            underlineClassName={styles.signatureUnderline}
            hideUntilRevealed
          />

          <p className={`${styles.tagline} f-sans cz caps`}>{aboutMission.tagline}</p>
        </div>
      </div>
    </section>
  );
}

export default AboutMission;
