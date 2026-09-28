"use client";

/**
 * CONTACT — section 1, "Connect with the movement" (mockups/Contact/1.png,
 * an 887 x 1774 phone frame).
 *
 * A centred composition on black: a tracked three-word eyebrow over a red
 * rule, a three-line slanted headline with a brush sweep under the red
 * line, five lines of copy, the primary red button and a white outlined
 * one, a closing tagline with its own rule, and a ghosted "R5" brush mark
 * bleeding off the foot. Red grunge creeps in at both side edges.
 *
 * MOTION, one timeline on arrival (no preloader on this page, so the intro
 * gate is opened here, as the About hero does):
 *   1. the eyebrow words decode and the rule draws
 *   2. the headline's characters rise, then the brush sweeps on
 *   3. copy lifts, then the two buttons wipe open from their centres
 *   4. the tagline decodes, its rule draws, the R5 mark fades up
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { openIntroGate } from "@/lib/motion/intro";
import { useMotion } from "@/components/motion/MotionProvider";
import Icon from "@/components/ui/Icon";
import RedButton from "@/components/ui/RedButton";
import { contactHero } from "@/data/contact";
import styles from "./ContactHero.module.css";

export function ContactHero() {
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

    const ctx = gsap.context(() => {
      gsap.set(q("[data-a]"), { visibility: "visible" });

      const tl = gsap.timeline({ defaults: { ease: EASE } });

      /* --- eyebrow ------------------------------------------------------ */
      (q(`.${styles.eyebrowWord}`) as HTMLElement[]).forEach((w, i) => {
        tl.add(scramble(w, 0.8), 0.1 + i * 0.12);
      });
      tl.fromTo(q(`.${styles.rule}`), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: EASE_IO }, 0.3);

      /* --- headline ----------------------------------------------------- */
      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(tl, splitTitle(title), 0.35);
      tl.fromTo(
        q(`.${styles.brush}`),
        { clipPath: "inset(-20% 100% -20% 0)" },
        { clipPath: "inset(-20% 0% -20% 0)", duration: 0.9, ease: EASE_IO, clearProps: "clipPath" },
        1.1,
      );

      /* --- copy and buttons --------------------------------------------- */
      tl.fromTo(
        q(`.${styles.body} span`),
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.08 },
        1.2,
      ).fromTo(
        q(`.${styles.btnWrap}`),
        { y: 26, opacity: 0, clipPath: "inset(0% 50% 0% 50%)" },
        {
          y: 0,
          opacity: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.1,
          stagger: 0.15,
          ease: EASE_IO,
          clearProps: "clipPath",
        },
        1.5,
      );

      /* --- tagline and mark --------------------------------------------- */
      const tag = q(`.${styles.tagline}`)[0] as HTMLElement | undefined;
      if (tag) tl.add(scramble(tag, 0.9), 1.9);
      tl.fromTo(
        q(`.${styles.rule2}`),
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: EASE_IO },
        2.05,
      ).fromTo(q(`.${styles.atmos}`), { opacity: 0 }, { opacity: 1, duration: 2.2 }, 0.6);
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <section ref={rootRef} className={styles.hero} aria-labelledby="contact-title">
      {/* The mockup's own atmosphere — the red grunge up both edges and the
          ghosted R5 brush mark at the foot — lifted from the mockup file with
          the type removed (see data/contact.ts). One static image, painted
          by this layer's background; it fades up with the timeline. */}
      <div className={styles.atmos} aria-hidden="true" data-a />

      <div className={styles.copy}>
        <p className={`${styles.eyebrow} f-sans cz caps`}>
          {contactHero.eyebrow.map((w) => (
            <span key={w} className={styles.eyebrowWord}>
              {w}
            </span>
          ))}
        </p>
        <span className={styles.rule} aria-hidden="true" />

        <h1 id="contact-title" className={styles.title}>
          {contactHero.titleWhite.map((line) => (
            <span key={line} className="line f-display cz">
              <span className="line-inner t-white">{line}</span>
            </span>
          ))}
          <span className="line f-display cz glow-text">
            <span className="line-inner t-red">{contactHero.titleRed}</span>
          </span>
        </h1>

        {/* The dry-brush stroke under the red line, lifted from the mockup as
            an alpha image so its ragged edge is the designer's, not a curve.
            A fixed 730px asset, not a responsive photograph. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.brush}
          src="/assets/images/contact-hero-brush.webp"
          width={730}
          height={54}
          alt=""
          aria-hidden="true"
          decoding="async"
          data-a
        />

        <p className={`${styles.body} f-sans cz`}>
          {contactHero.bodyLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>

        <div className={styles.btnWrap} data-a>
          <RedButton
            label={contactHero.primaryCta.label}
            href={contactHero.primaryCta.href}
            className={styles.btn}
            arrow="long"
            magnetStrength={0.18}
          />
        </div>

        <div className={styles.btnWrap} data-a>
          <a href={contactHero.secondaryCta.href} className={`${styles.btn} ${styles.btnOutline}`}>
            <Icon name="send" className={styles.btnIcon} />
            <span className="f-cond cz caps">{contactHero.secondaryCta.label}</span>
          </a>
        </div>

        <p className={`${styles.tagline} f-sans cz caps`}>
          {contactHero.tagline.map((run, i) =>
            run.accent ? (
              <b key={i} className={styles.taglineAccent}>
                {run.text}
              </b>
            ) : (
              <span key={i}>{run.text}</span>
            ),
          )}
        </p>
        <span className={`${styles.rule} ${styles.rule2}`} aria-hidden="true" />
      </div>
    </section>
  );
}

export default ContactHero;
