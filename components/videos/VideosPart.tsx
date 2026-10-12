"use client";

/**
 * VIDEOS — section 5, "You're part of it." (mockups/Videos/5.png, a 941 x
 * 1672 phone frame).
 *
 * The page's close: the wordmark, a tracked "YOU'RE NOT JUST WATCHING.",
 * the two-line leaning headline — YOU'RE in scratched white, PART OF IT.
 * in red — over a red brush, two short tracked paragraphs with their red
 * words, and the glowing JOIN THE MOVEMENT button. The shared footer
 * follows from the root layout.
 *
 * The grunge, the wordmark, the brush and the people mark are the
 * mockup's own (see data/videos-page.ts).
 *
 * MOTION (scroll-triggered):
 *   • the wordmark settles, the eyebrow decodes
 *   • the headline's characters rise line by line; the brush sweeps on
 *   • the copy lifts line by line, the button wipes open
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import RedButton from "@/components/ui/RedButton";
import { videosPart } from "@/data/videos-page";
import styles from "./VideosPart.module.css";

export function VideosPart() {
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
      head.fromTo(q(`.${styles.mark}`), { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0);
      const eyebrow = q(`.${styles.eyebrow}`)[0] as HTMLElement | undefined;
      if (eyebrow) head.add(scramble(eyebrow, 0.9), 0.2);
      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(head, splitTitle(title), 0.4, 0.05);
      head.fromTo(
        q(`.${styles.brush}`),
        { clipPath: "inset(-10% 100% -10% 0)" },
        { clipPath: "inset(-10% 0% -10% 0)", duration: 1, ease: EASE_IO, clearProps: "clipPath" },
        1.3,
      );

      gsap
        .timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: q(`.${styles.copy}`)[0], start: "top 88%" },
        })
        .fromTo(q(`.${styles.copy} span[data-a]`), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.12 }, 0)
        .fromTo(
          q(`.${styles.btnWrap}`),
          { y: 20, opacity: 0, clipPath: "inset(0% 50% 0% 50%)" },
          { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: EASE_IO, clearProps: "clipPath" },
          0.5,
        );
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  const c = videosPart;

  return (
    <section ref={rootRef} id="part" className={styles.section} aria-labelledby="videos-part-title">
      {/* The mockup's own grunge, the type removed. */}
      <div className={styles.atmos} aria-hidden="true" />

      <div className={styles.frame}>
        <div className={styles.head}>
          {/* The wordmark as the mockup paints it, lifted as an image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.mark} src="/assets/images/videos-part-mark.webp" width={270} height={76} alt={c.mark} decoding="async" data-a />

          <p className={`${styles.eyebrow} f-sans cz caps`}>{c.eyebrow}</p>

          <h2 id="videos-part-title" className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner t-white">{c.titleWhite}</span>
            </span>
            <span className="line f-display cz glow-text">
              <span className="line-inner t-red">{c.titleRed}</span>
            </span>
          </h2>

          {/* The brush under the headline, lifted from the mockup as an
              alpha image. A fixed 770px asset. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.brush} src="/assets/images/videos-part-brush.webp" width={770} height={62} alt="" aria-hidden="true" decoding="async" data-a />
        </div>

        <div className={styles.copy}>
          {c.copy.map((para, p) => (
            <p key={p} className={`${styles.para} f-sans cz caps`}>
              {para.map((line, i) => (
                <span key={i} className={styles.copyLine} data-a>
                  {line.map((r, j) => (
                    <span key={j} className={r.red ? styles.red : undefined}>
                      {r.text}
                    </span>
                  ))}
                </span>
              ))}
            </p>
          ))}
        </div>

        <div className={styles.btnWrap} data-a>
          <RedButton label={c.cta.label} href={c.cta.href} className={styles.btn} wrapperClassName={styles.btnMagnet} arrow="long" magnetStrength={0.12}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.people} src="/assets/images/videos-part-people.webp" width={100} height={70} alt="" aria-hidden="true" decoding="async" />
          </RedButton>
        </div>
      </div>
    </section>
  );
}

export default VideosPart;
