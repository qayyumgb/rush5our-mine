"use client";

/**
 * JOIN THE MOVEMENT — section 1, "Join the movement." (mockups/Join The
 * Movement/1.png, a 1024 x 1536 phone frame).
 *
 * The page's opener: three tracked words over a short red rule, a two-line
 * leaning headline — "JOIN" in scratched white, "THE MOVEMENT." in red —
 * two lines of copy, three pillars divided by red hairlines (a red line
 * icon, an italic title, two lines of copy), the glowing red button, and a
 * tracked line over a second rule. The ghosted R5 marks and the red grunge
 * up both edges are the mockup's own (see data/join.ts).
 *
 * MOTION (one timeline on arrival; this page has no preloader, so the hero
 * opens the intro gate the shared Nav waits on):
 *   • the eyebrow's words decode, the rule draws
 *   • the headline's characters rise, the copy lifts
 *   • the dividers drop, each pillar's icon draws itself, its text lifts
 *   • the button wipes open, the tagline decodes, the rule draws, and the
 *     atmosphere fades up beneath it all
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn, prepareStrokes } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { openIntroGate } from "@/lib/motion/intro";
import { useMotion } from "@/components/motion/MotionProvider";
import Icon from "@/components/ui/Icon";
import RedButton from "@/components/ui/RedButton";
import { joinHero } from "@/data/join";
import styles from "./JoinHero.module.css";

export function JoinHero() {
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
      prepareStrokes(root);

      const tl = gsap.timeline({ defaults: { ease: EASE } });

      /* --- eyebrow ------------------------------------------------------ */
      (q(`.${styles.eyebrowWord}`) as HTMLElement[]).forEach((w, i) => {
        tl.add(scramble(w, 0.8), 0.1 + i * 0.12);
      });
      tl.fromTo(q(`.${styles.rule}`), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: EASE_IO }, 0.3);

      /* --- headline and copy -------------------------------------------- */
      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(tl, splitTitle(title), 0.35, 0.05);
      tl.fromTo(
        q(`.${styles.body} span`),
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.08 },
        1.1,
      );

      /* --- pillars ------------------------------------------------------ */
      tl.fromTo(q(`.${styles.divider}`), { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: EASE_IO }, 1.3)
        .fromTo(
          q(".i-stroke"),
          { strokeDashoffset: (_i: number, el: Element) => Number((el as SVGElement).dataset.len ?? 0) },
          { strokeDashoffset: 0, duration: 1.1, stagger: 0.04, ease: "power2.inOut" },
          1.35,
        )
        .fromTo(
          q(`.${styles.pillarTitle}, .${styles.pillarBody}`),
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.07 },
          1.5,
        );

      /* --- button, tagline and atmosphere ------------------------------- */
      tl.fromTo(
        q(`.${styles.btnWrap}`),
        { y: 26, opacity: 0, clipPath: "inset(0% 50% 0% 50%)" },
        { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: EASE_IO, clearProps: "clipPath" },
        1.8,
      );
      const tag = q(`.${styles.tagline}`)[0] as HTMLElement | undefined;
      if (tag) tl.add(scramble(tag, 0.9), 2.1);
      tl.fromTo(q(`.${styles.rule2}`), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: EASE_IO }, 2.25)
        .fromTo(q(`.${styles.atmos}`), { opacity: 0 }, { opacity: 1, duration: 2.2 }, 0.6);
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  const c = joinHero;

  return (
    <section ref={rootRef} className={styles.hero} aria-labelledby="join-title">
      {/* The mockup's own atmosphere — red grunge up both edges, the ghosted
          R5 brush marks over the headline and at the foot — lifted from the
          mockup file with the type removed (see data/join.ts). Static
          images, painted by this layer's background; it fades up with the
          timeline. */}
      <div className={styles.atmos} aria-hidden="true" data-a />

      <div className={styles.copy}>
        <p className={`${styles.eyebrow} f-sans cz caps`} data-a>
          {c.eyebrow.map((w) => (
            <span key={w} className={styles.eyebrowWord}>
              {w}
            </span>
          ))}
        </p>
        <span className={styles.rule} aria-hidden="true" data-a />

        <h1 id="join-title" className={styles.title} data-a>
          <span className="line f-display cz">
            <span className="line-inner t-white">{c.titleWhite}</span>
          </span>
          <span className="line f-display cz glow-text">
            <span className="line-inner t-red">{c.titleRed}</span>
          </span>
        </h1>

        <p className={`${styles.body} f-sans cz`} data-a>
          {c.bodyLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>

        <ul className={styles.pillars}>
          {c.pillars.map((p, i) => (
            <li key={p.title} className={styles.pillar} data-a>
              {i > 0 && <span className={styles.divider} aria-hidden="true" />}
              <span className={styles.iconSlot}>
                <Icon name={p.icon} className={`${styles.icon} ${styles[p.icon]}`} />
              </span>
              <h2 className={`${styles.pillarTitle} f-display cz caps`}>
                <span className={styles.slant}>{p.title}</span>
              </h2>
              <p className={`${styles.pillarBody} f-sans cz`}>
                {p.body.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </p>
            </li>
          ))}
        </ul>

        <div className={styles.btnWrap} data-a>
          <RedButton label={c.cta.label} href={c.cta.href} className={styles.btn} arrow="long" magnetStrength={0.18} />
        </div>

        <p className={`${styles.tagline} f-sans cz caps`} data-a>
          {c.tagline}
        </p>
        <span className={`${styles.rule} ${styles.rule2}`} aria-hidden="true" data-a />
      </div>
    </section>
  );
}

export default JoinHero;
