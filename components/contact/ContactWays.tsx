"use client";

/**
 * CONTACT — section 2, "How can we connect?" (mockups/Contact/2.png, a
 * 1024 x 1536 phone frame).
 *
 * A centred statement — tracked eyebrow, rule, one-line slanted headline
 * in white and red with a brush stroke beneath, a tracked subline — over
 * four outlined cards in a 2 x 2 grid: red line icon, slanted title, two or
 * three lines of copy, a red script line, and an outlined button. A tracked
 * tagline between two red dashes closes it. The same red grunge as the hero
 * creeps in at both edges.
 *
 * MOTION:
 *   • the eyebrow words decode, the rule draws, the headline's characters
 *     rise, the brush wipes on, the subline lifts
 *   • the cards rise in turn; inside each, the icon's strokes draw on, the
 *     title and copy lift, the script writes on from the left, and the
 *     button wipes open from its centre
 *   • the tagline decodes between its dashes drawing outward
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn, prepareStrokes } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import Icon from "@/components/ui/Icon";
import { contactWays } from "@/data/contact";
import styles from "./ContactWays.module.css";

export function ContactWays() {
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
      const head = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.head}`)[0], start: "top 80%" },
      });
      (q(`.${styles.eyebrowWord}`) as HTMLElement[]).forEach((w, i) => {
        head.add(scramble(w, 0.8), i * 0.12);
      });
      head.fromTo(q(`.${styles.rule}`), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: EASE_IO }, 0.2);
      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(head, splitTitle(title), 0.25);
      head
        .fromTo(
          q(`.${styles.brush}`),
          { clipPath: "inset(-20% 100% -20% 0)" },
          { clipPath: "inset(-20% 0% -20% 0)", duration: 0.9, ease: EASE_IO, clearProps: "clipPath" },
          0.9,
        )
        .fromTo(q(`.${styles.subline}`), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 1.0);

      /* --- cards -------------------------------------------------------- */
      (q(`.${styles.card}`) as HTMLElement[]).forEach((card, i) => {
        const inCard = gsap.utils.selector(card);
        const tl = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: card, start: "top 85%" },
        });
        tl.fromTo(card, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, (i % 2) * 0.12)
          .fromTo(
            inCard(".i-stroke"),
            { strokeDashoffset: (_i: number, el: Element) => Number((el as SVGElement).dataset.len ?? 0) },
            { strokeDashoffset: 0, duration: 1.1, stagger: 0.05, ease: "power2.inOut" },
            0.2,
          )
          .fromTo(
            inCard(`.${styles.cardTitle}, .${styles.cardBody}`),
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 },
            0.35,
          )
          .fromTo(
            inCard(`.${styles.script}`),
            { clipPath: "inset(-30% 100% -30% 0)" },
            { clipPath: "inset(-30% 0% -30% 0)", duration: 0.8, ease: EASE_IO, clearProps: "clipPath" },
            0.6,
          )
          .fromTo(
            inCard(`.${styles.btnWrap}`),
            { opacity: 0, clipPath: "inset(0 50% 0 50%)" },
            { opacity: 1, clipPath: "inset(0 0% 0 0%)", duration: 0.9, ease: EASE_IO, clearProps: "clipPath" },
            0.75,
          );
      });

      /* --- tagline ------------------------------------------------------ */
      const foot = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.foot}`)[0], start: "top bottom" },
      });
      foot.fromTo(q(`.${styles.dash}`), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: EASE_IO }, 0);
      const tag = q(`.${styles.tagline}`)[0] as HTMLElement | undefined;
      if (tag) foot.add(scramble(tag, 0.9), 0.1);
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <section
      ref={rootRef}
      id="ways"
      className={styles.ways}
      aria-labelledby="contact-ways-title"
    >
      <div className={styles.atmos} aria-hidden="true" />

      <div className={styles.col}>
        {/* ---------------- Statement ---------------- */}
        <div className={styles.head}>
          <p className={`${styles.eyebrow} f-sans cz caps`}>
            {contactWays.eyebrow.map((w) => (
              <span key={w} className={styles.eyebrowWord}>
                {w}
              </span>
            ))}
          </p>
          <span className={styles.rule} aria-hidden="true" />

          <h2 id="contact-ways-title" className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner">
                <span className="t-white">{contactWays.titleWhite} </span>
                <span className="t-red">{contactWays.titleRed}</span>
              </span>
            </span>
          </h2>

          {/* The brush under the headline, lifted from the mockup as an
              alpha image. A fixed 730px asset, not a responsive photograph. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.brush}
            src="/assets/images/contact-ways-brush.webp"
            width={730}
            height={38}
            alt=""
            aria-hidden="true"
            decoding="async"
            data-a
          />

          <p className={`${styles.subline} f-sans cz caps`} data-a>
            {contactWays.subline}
          </p>
        </div>

        {/* ---------------- Cards ---------------- */}
        <ul className={styles.grid}>
          {contactWays.ways.map((way) => (
            <li key={way.title} className={styles.card} data-lines={way.body.length} data-a>
              <Icon name={way.icon} className={styles.icon} />

              <h3 className={`${styles.cardTitle} f-display cz caps`}>{way.title}</h3>

              <p className={`${styles.cardBody} f-sans cz`}>
                {way.body.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>

              <p className={styles.script} aria-hidden="true">
                {way.script}
              </p>

              <div className={styles.btnWrap}>
                <a href={way.cta.href} className={styles.btn}>
                  <span className="f-cond cz caps">{way.cta.label}</span>
                  <svg className={styles.btnArrow} viewBox="0 0 32 20" aria-hidden="true">
                    <path d="M1 10h29M21 1.5l9 8.5-9 8.5" />
                  </svg>
                </a>
              </div>
            </li>
          ))}
        </ul>

        {/* ---------------- Tagline ---------------- */}
        <div className={styles.foot}>
          <span className={`${styles.dash} ${styles.dashL}`} aria-hidden="true" />
          <p className={`${styles.tagline} f-sans cz caps`}>{contactWays.tagline}</p>
          <span className={`${styles.dash} ${styles.dashR}`} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

export default ContactWays;
