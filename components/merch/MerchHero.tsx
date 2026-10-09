"use client";

/**
 * MERCH — section 1, "Build the movement." (mockups/Merch/1.png, a 941 x
 * 1671 phone frame).
 *
 * Full-bleed photograph — two tees front and back on a road case under red
 * light, with the designer's hand-painted notes and the crate's wordmark
 * all part of the picture — under a two-line leaning headline, a red brush
 * stroke, two tracked lines of copy, the glowing red button with its cart,
 * and a tracked tagline at the foot.
 *
 * The photograph and the brush are lifted from the mockup file (see
 * data/merch.ts).
 *
 * MOTION (one timeline on arrival; this page has no preloader, so the hero
 * opens the intro gate the shared Nav waits on):
 *   • the photograph settles in from a slight zoom
 *   • the headline's characters rise, the brush sweeps on beneath
 *   • the copy lifts, the button wipes open, the tagline decodes
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
import { merchHero } from "@/data/merch";
import styles from "./MerchHero.module.css";

export function MerchHero() {
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

      tl.fromTo(
        q(`.${styles.photo}`),
        { scale: 1.06, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.8, ease: "power2.out" },
        0,
      );

      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(tl, splitTitle(title), 0.35, 0.045);

      tl.fromTo(
        q(`.${styles.brush}`),
        { clipPath: "inset(-10% 100% -10% 0)" },
        { clipPath: "inset(-10% 0% -10% 0)", duration: 1, ease: EASE_IO, clearProps: "clipPath" },
        1.05,
      )
        .fromTo(
          q(`.${styles.body} span`),
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.1 },
          1.2,
        )
        .fromTo(
          q(`.${styles.btnWrap}`),
          { y: 24, opacity: 0, clipPath: "inset(0% 100% 0% 0%)" },
          { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: EASE_IO, clearProps: "clipPath" },
          1.45,
        );
      const tag = q(`.${styles.tagline}`)[0] as HTMLElement | undefined;
      if (tag) tl.add(scramble(tag, 0.9), 1.9);
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  const c = merchHero;

  return (
    <section ref={rootRef} className={styles.hero} aria-labelledby="merch-title">
      {/* ---------------- Background ----------------
          The mockup's own photograph — see the note in data/merch.ts. */}
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.photo} data-a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.img}
            src={c.media.tall.src}
            width={c.media.tall.width}
            height={c.media.tall.height}
            alt={c.media.alt}
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </div>
      <div className={styles.shade} aria-hidden="true" />

      {/* ---------------- Copy ---------------- */}
      <div className={styles.copy}>
        <h1 id="merch-title" className={styles.title} data-a>
          {c.title.map((line) => (
            <span key={line.text} className={`line f-display cz${line.red ? " glow-text" : ""}`}>
              <span className={`line-inner ${line.red ? "t-red" : "t-white"}`}>{line.text}</span>
            </span>
          ))}
        </h1>

        {/* The dry-brush sweep under the red line, lifted from the mockup as
            an alpha image so its ragged edge is the designer's, not a curve.
            A fixed 660px asset. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.brush}
          src="/assets/images/merch-hero-brush.webp"
          width={660}
          height={42}
          alt=""
          aria-hidden="true"
          decoding="async"
          data-a
        />

        <p className={`${styles.body} f-sans cz caps`} data-a>
          {c.bodyLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>

        <div className={styles.btnWrap} data-a>
          <RedButton label={c.cta.label} href={c.cta.href} className={styles.btn} arrow="long" magnetStrength={0.18}>
            <Icon name="cart" className={styles.cart} />
          </RedButton>
        </div>
      </div>

      {/* ---------------- Tagline ---------------- */}
      <p className={`${styles.tagline} f-sans cz caps`} data-a>
        {c.tagline}
      </p>
    </section>
  );
}

export default MerchHero;
