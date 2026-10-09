"use client";

/**
 * MERCH — section 5, "Wear the movement. Rep the culture." (mockups/Merch/
 * 5.png, a 941 x 1672 phone frame).
 *
 * The page's close: the RUSH5OUR wordmark over a short red rule, a tracked
 * "MORE THAN MERCH.", a four-line leaning headline — two lines in scratched
 * white, two in red — a red brush stroke, four tracked lines of copy, the
 * glowing "shop all merch" button, and two quiet taglines, between red
 * grunge at both edges. The shared footer follows from the root layout.
 *
 * The wordmark, the brush and the grunge are lifted from the mockup file
 * (see data/merch.ts).
 *
 * MOTION:
 *   • the wordmark settles, the rule draws, the eyebrow decodes
 *   • the headline's characters rise line by line; the brush sweeps on
 *   • the copy lifts line by line, the button wipes open, the taglines fade
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import RedButton from "@/components/ui/RedButton";
import { merchClose } from "@/data/merch";
import styles from "./MerchClose.module.css";

export function MerchClose() {
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

      const head = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.head}`)[0], start: "top 80%" },
      });
      head
        .fromTo(q(`.${styles.mark}`), { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0)
        .fromTo(q(`.${styles.rule}`), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: EASE_IO }, 0.25);
      const eyebrow = q(`.${styles.eyebrow}`)[0] as HTMLElement | undefined;
      if (eyebrow) head.add(scramble(eyebrow, 0.9), 0.35);
      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(head, splitTitle(title), 0.5, 0.035);
      head.fromTo(
        q(`.${styles.brush}`),
        { clipPath: "inset(-10% 100% -10% 0)" },
        { clipPath: "inset(-10% 0% -10% 0)", duration: 1, ease: EASE_IO, clearProps: "clipPath" },
        1.4,
      );

      gsap
        .timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: q(`.${styles.body}`)[0], start: "top 88%" },
        })
        .fromTo(
          q(`.${styles.body} span`),
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.12 },
          0,
        )
        .fromTo(
          q(`.${styles.btnWrap}`),
          { y: 20, opacity: 0, clipPath: "inset(0% 50% 0% 50%)" },
          { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: EASE_IO, clearProps: "clipPath" },
          0.5,
        )
        .fromTo(q(`.${styles.tag} span`), { opacity: 0 }, { opacity: 1, duration: 1, stagger: 0.15 }, 0.9);
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  const c = merchClose;

  return (
    <section ref={rootRef} id="shop" className={styles.section} aria-labelledby="merch-close-title">
      {/* The mockup's red grunge up both edges, the type removed. */}
      <div className={styles.atmos} aria-hidden="true" />

      <div className={styles.frame}>
        <div className={styles.head}>
          {/* The wordmark as the mockup paints it, lifted as an image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.mark}
            src="/assets/images/merch-close-mark.webp"
            width={220}
            height={60}
            alt={c.mark}
            decoding="async"
            data-a
          />
          <span className={styles.rule} aria-hidden="true" data-a />
          <p className={`${styles.eyebrow} f-sans cz caps`}>{c.eyebrow}</p>

          <h2 id="merch-close-title" className={styles.title}>
            {c.titleWhite.map((l) => (
              <span key={l} className="line f-display cz">
                <span className="line-inner t-white">{l}</span>
              </span>
            ))}
            {c.titleRed.map((l) => (
              <span key={l} className="line f-display cz glow-text">
                <span className="line-inner t-red">{l}</span>
              </span>
            ))}
          </h2>

          {/* The dry-brush sweep under the headline, lifted from the mockup as
              an alpha image. A fixed 800px asset. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.brush}
            src="/assets/images/merch-close-brush.webp"
            width={800}
            height={96}
            alt=""
            aria-hidden="true"
            decoding="async"
            data-a
          />
        </div>

        <p className={`${styles.body} f-sans cz`}>
          {c.bodyLines.map((l) => (
            <span key={l} data-a>
              {l}
            </span>
          ))}
        </p>

        <div className={styles.btnWrap} data-a>
          <RedButton
            label={c.cta.label}
            href={c.cta.href}
            className={styles.btn}
            wrapperClassName={styles.btnMagnet}
            arrow="long"
            magnetStrength={0.12}
          />
        </div>

        <p className={`${styles.tag} f-sans cz caps`}>
          {c.taglines.map((l) => (
            <span key={l} data-a>
              {l}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

export default MerchClose;
