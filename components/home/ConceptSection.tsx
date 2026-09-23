"use client";

/**
 * CONCEPT — section 2, "What is RUSH 5OUR?" (mockup 2.png).
 *
 * Three cards explain the brand, over a CTA bar that repeats the primary
 * action. Content comes entirely from data/concept.ts.
 *
 * MOTION:
 *   • the shared `headReveal` opens the section (eyebrow decodes, headline
 *     characters rise, the marker note writes itself)
 *   • cards hinge up from below with their contents staggered inside them,
 *     the icons draw their strokes on, and a light traces each border once
 *   • the CTA bar rises and its button wipes in
 *   • on hover a card lifts, tilts toward the cursor, lights a red halo
 *     beneath itself and loops the border trace
 */

import { useEffect, useRef } from "react";
import { gsap, hasFinePointer } from "@/lib/motion/gsap";
import {
  EASE,
  EASE_IO,
  headReveal,
  injectTrace,
  prepareStrokes,
  runTrace,
  tilt,
  writeHand,
} from "@/lib/motion/helpers";
import { scramble } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import Eyebrow from "@/components/ui/Eyebrow";
import HandAccent from "@/components/ui/HandAccent";
import Icon from "@/components/ui/Icon";
import IconRing from "@/components/ui/IconRing";
import RedButton from "@/components/ui/RedButton";
import ScrollCue from "@/components/ui/ScrollCue";
import { concept } from "@/data/concept";
import styles from "./ConceptSection.module.css";

export function ConceptSection() {
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

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      gsap.set(q("[data-a]"), { visibility: "visible" });

      // Icon strokes need their own lengths before they can be drawn on.
      prepareStrokes(root);

      /* --- atmosphere --------------------------------------------------- */
      // POINTER DEVICES ONLY.
      //
      // `.glow` carries `filter: blur(30px)` over a square roughly 90% of the
      // viewport wide. Drifting it is cheap — the compositor moves a texture
      // it already has — but growing it is not: a scaled layer has to be
      // rasterised again at every new scale to stay sharp, which re-computes
      // that blur across the whole area, continuously, for as long as the
      // section is on screen. On a high-DPI phone that is a large texture
      // rebuilt over and over, and it was implicated in the Galaxy S25
      // dropping other layers nearby (the CTA bar sits directly over it).
      //
      // Touch devices get the glow as a still image: identical picture, no
      // per-frame raster work.
      if (hasFinePointer()) {
        gsap.to(q(`.${styles.glow}`), {
          yPercent: 40,
          scale: 1.25,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
        });
      }

      /* --- heading ------------------------------------------------------ */
      const head = q(`.${styles.head}`)[0] as HTMLElement | undefined;
      if (head) {
        headReveal(head, {
          copy: q(`.${styles.intro}`),
          extraHand: q(`.${styles.accentBigger}`)[0],
        });
      }

      /* --- cards -------------------------------------------------------- */
      const cardEls = q(`.${styles.card}`) as HTMLElement[];
      cardEls.forEach((card) => injectTrace(card));

      const cards = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.cards}`)[0], start: "top 82%" },
      });

      cards
        // rotateX from a bottom origin makes the cards hinge up off the page.
        .fromTo(
          q(`.${styles.cardWrap}`),
          { y: 90, opacity: 0, rotateX: -14, transformPerspective: 1000, transformOrigin: "50% 100%" },
          { y: 0, opacity: 1, rotateX: 0, duration: 1.4, stagger: 0.15 },
          0,
        )
        .fromTo(
          q(`.${styles.cardNum} i`),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.8, stagger: 0.15, ease: EASE_IO },
          0.5,
        )
        .fromTo(
          q(`.${styles.cardTitle}`),
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.15 },
          0.35,
        )
        .fromTo(
          q(`.${styles.cardDesc}`),
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.15 },
          0.45,
        )
        .fromTo(
          q(`.${styles.cardIcon}`),
          { scale: 0.3, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.1, stagger: 0.15, ease: "back.out(1.8)" },
          0.55,
        )
        .fromTo(
          q(`.${styles.card} .i-stroke`),
          // Each path starts fully "undrawn" by its own measured length,
          // which `prepareStrokes` stashed on the element.
          { strokeDashoffset: (_i: number, el: Element) => Number((el as SVGElement).dataset.len ?? 0) },
          { strokeDashoffset: 0, duration: 1.3, stagger: 0.03, ease: "power2.inOut" },
          0.75,
        )
        .fromTo(
          q(`.${styles.cardLink}`),
          { x: -12, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.9, stagger: 0.15 },
          0.8,
        );

      q(`.${styles.cardNum} span`).forEach((s, i) => {
        cards.add(scramble(s as HTMLElement, 0.6), 0.35 + i * 0.15);
      });
      cardEls.forEach((card, i) => {
        runTrace(cards, card.querySelector(".card-trace"), 0.3 + i * 0.15, 1.6);
      });

      /* --- CTA bar ------------------------------------------------------ */
      const ctaBar = q(`.${styles.ctaBar}`)[0];
      if (ctaBar) injectTrace(ctaBar);

      const cta = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.ctaWrap}`)[0], start: "top 88%" },
      });

      cta
        .fromTo(
          q(`.${styles.ctaWrap}`),
          { y: 60, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 1.3 },
          0,
        )
        .fromTo(
          q(`.${styles.ctaDivider}`),
          { scaleY: 0 },
          { scaleY: 1, duration: 0.8, ease: EASE_IO },
          0.4,
        )
        .fromTo(
          q(`.${styles.ctaBtnWrap}`),
          { clipPath: "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: EASE_IO, clearProps: "clipPath" },
          0.45,
        );

      runTrace(cta, ctaBar?.querySelector(".card-trace") ?? null, 0.2, 1.8);
      q(`.${styles.ctaTags} span`).forEach((s, i) => {
        cta.add(scramble(s as HTMLElement, 0.8), 0.3 + i * 0.12);
      });
      writeHand(cta, q(`.${styles.accentBuild}`)[0], 0.6);

      /* --- scroll cue --------------------------------------------------- */
      gsap.fromTo(
        q(`.${styles.cueWrap}`),
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: EASE,
          scrollTrigger: { trigger: q(`.${styles.cueWrap}`)[0], start: "top 96%" },
        },
      );

      /* --- hover -------------------------------------------------------- */
      cardEls.forEach((card) => {
        cleanups.push(tilt(card, 10, 8));

        // Feeds the cursor position to the card's red spotlight gradient.
        const onMove = (e: PointerEvent) => {
          const r = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${e.clientX - r.left}px`);
          card.style.setProperty("--my", `${e.clientY - r.top}px`);
        };
        card.addEventListener("pointermove", onMove);
        cleanups.push(() => card.removeEventListener("pointermove", onMove));
      });
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [ready, reduced]);

  return (
    <section ref={rootRef} id="concept" className={styles.concept} aria-labelledby="concept-title">
      {/* ---------------- Atmosphere ---------------- */}
      <div className={styles.atmos} aria-hidden="true">
        <div className={styles.glow} />
        <svg className={styles.scratches} viewBox="0 0 400 160" preserveAspectRatio="none">
          <path d="M-10 60 C 80 40, 160 90, 260 50 S 380 70, 420 40" />
          <path d="M20 140 L 140 90" />
          <path d="M160 150 L 300 100" />
          <path d="M280 155 L 410 110" />
          <path d="M-10 130 C 90 110, 180 150, 300 120" />
          <path d="M60 150 L 110 100" />
          <path d="M330 90 L 380 30" />
        </svg>
      </div>

      <div className="frame">
        {/* ---------------- Heading ---------------- */}
        <div className={styles.head}>
          <Eyebrow
            label={concept.eyebrow}
            className={styles.eyebrow}
            labelClassName={styles.eyebrowLabel}
            ruleClassName={styles.eyebrowRule}
          />

          <h2 id="concept-title" className={styles.title}>
            <span className={`line ${styles.l1} f-display cz`}>
              <span className="line-inner t-white">{concept.titleWhite}</span>
            </span>
            <span className={`line ${styles.l2} f-display cz glow-text`}>
              <span className="line-inner">
                <span className="t-red">{concept.titleRed}</span>
                <span className="t-white">{concept.titleTail}</span>
              </span>
            </span>
          </h2>

          <p className={`${styles.intro} f-sans cz`}>
            {concept.intro.map((line, i) => (
              <span key={i} style={{ display: "block" }}>
                {line}
              </span>
            ))}
          </p>
        </div>

        <HandAccent
          lines={concept.accent.lines}
          className={styles.accentBigger}
          underline="long"
          underlineClassName={styles.accentBiggerUnderline}
        />

        {/* ---------------- Cards ---------------- */}
        <div className={styles.cards} data-a>
          {concept.cards.map((card) => (
            <div key={card.number} className={styles.cardWrap}>
              <article
                className={`${styles.card} js-card`}
                style={
                  {
                    "--fs": `calc(${card.titleSize} * var(--u))`,
                    ...(card.bodySize
                      ? { "--fs-body": `calc(${card.bodySize} * var(--u))` }
                      : {}),
                  } as React.CSSProperties
                }
              >
                <span className={styles.halo} aria-hidden="true" />

                <div className={styles.cardNum}>
                  <span className="f-display cz">{card.number}</span>
                  <i aria-hidden="true" />
                </div>

                <h3 className={`${styles.cardTitle} f-display cz`}>{card.title}</h3>

                <p className={`${styles.cardDesc} f-sans cz`}>
                  {card.body.map((line, i) => (
                    <span key={i} style={{ display: "block" }}>
                      {line}
                    </span>
                  ))}
                </p>

                <div className={styles.cardIcon}>
                  <IconRing name={card.icon} size="calc(131 * var(--u))" />
                </div>

                <a href={card.linkHref} className={styles.cardLink}>
                  <span className="f-sans cz caps">
                    {card.linkLabel.map((line, i) => (
                      <span key={i} style={{ display: "block" }}>
                        {line}
                      </span>
                    ))}
                  </span>
                  <Icon name="chevronRight" />
                </a>
              </article>
            </div>
          ))}
        </div>

        {/* ---------------- CTA bar ---------------- */}
        <div className={styles.ctaWrap} data-a>
          <div className={styles.ctaBar}>
            <span className={styles.ctaHalo} aria-hidden="true" />
            <span className={styles.ctaEdgeTop} aria-hidden="true" />
            <span className={styles.ctaCorner} aria-hidden="true" />
            <span className={styles.ctaCornerGlow} aria-hidden="true" />

            <p className={`${styles.ctaTags} f-sans cz caps`}>
              {concept.cta.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </p>

            <span className={styles.ctaDivider} aria-hidden="true" />

            <HandAccent
              lines={concept.cta.accent.lines}
              className={styles.accentBuild}
              underline="long"
              underlineClassName={styles.accentBuildUnderline}
            />

            <div className={styles.ctaBtnWrap}>
              <RedButton
                label={concept.cta.button.label}
                href={concept.cta.button.href}
                className={styles.ctaBtn}
                arrow="medium"
                magnetStrength={0.12}
              />
            </div>
          </div>
        </div>
      </div>

      <ScrollCue
        label={concept.scrollCue}
        href="#videos"
        className={styles.cueWrap}
        labelClassName={styles.cueLabel}
        lineClassName={styles.cueLine}
        chevClassName={styles.cueChev}
      />
    </section>
  );
}

export default ConceptSection;
