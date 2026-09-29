"use client";

/**
 * RUSH HUNTS — section 3, "Live rewards" (mockups/Rush Hunts/3.png, a
 * 950 x 1655 phone frame).
 *
 * A centred statement — red tracked eyebrow between two rules, a one-line
 * headline with an italic white "LIVE" against an upright red "REWARDS", a
 * tracked subline — over six reward cards: a red line icon, a hairline, then
 * a two-colour title and two lines of copy. A red brush-script line between
 * two rules closes it.
 *
 * The edge grunge, the script and the six icons are lifted from the mockup
 * file (see data/hunts.ts).
 *
 * MOTION:
 *   • the eyebrow decodes between its rules drawing outward, the headline's
 *     characters rise, the subline lifts
 *   • each card rises as it enters; its icon settles in, the hairline drops,
 *     and the title and copy lift
 *   • the script writes on, left to right, as its rules draw outward
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import { huntsRewards } from "@/data/hunts";
import styles from "./HuntsRewards.module.css";

export function HuntsRewards() {
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

      /* --- statement ---------------------------------------------------- */
      const head = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.head}`)[0], start: "top 80%" },
      });
      head.fromTo(q(`.${styles.eyebrowRule}`), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: EASE_IO }, 0);
      const label = q(`.${styles.eyebrowLabel}`)[0] as HTMLElement | undefined;
      if (label) head.add(scramble(label, 0.9), 0.05);
      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(head, splitTitle(title), 0.2);
      head.fromTo(q(`.${styles.subline}`), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.8);

      /* --- rewards ------------------------------------------------------ */
      (q(`.${styles.reward}`) as HTMLElement[]).forEach((reward) => {
        const inR = gsap.utils.selector(reward);
        gsap
          .timeline({
            defaults: { ease: EASE },
            scrollTrigger: { trigger: reward, start: "top 88%" },
          })
          .fromTo(reward, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, 0)
          .fromTo(
            inR(`.${styles.icon}`),
            { opacity: 0, scale: 0.85 },
            { opacity: 1, scale: 1, duration: 0.8 },
            0.2,
          )
          .fromTo(inR(`.${styles.divider}`), { scaleY: 0 }, { scaleY: 1, duration: 0.8, ease: EASE_IO }, 0.3)
          .fromTo(
            inR(`.${styles.rewardTitle}, .${styles.rewardBody}`),
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 },
            0.35,
          );
      });

      /* --- script ------------------------------------------------------- */
      gsap
        .timeline({
          scrollTrigger: { trigger: q(`.${styles.foot}`)[0], start: "top 92%" },
        })
        .fromTo(
          q(`.${styles.script}`),
          { clipPath: "inset(-10% 100% -10% 0)" },
          { clipPath: "inset(-10% 0% -10% 0)", duration: 1.2, ease: EASE_IO, clearProps: "clipPath" },
          0,
        )
        .fromTo(q(`.${styles.footRule}`), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: EASE_IO }, 0.3);
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  const c = huntsRewards;

  return (
    <section ref={rootRef} id="rewards" className={styles.section} aria-labelledby="hunts-rewards-title">
      <div className={styles.atmos} aria-hidden="true" />

      <div className="frame">
        {/* ---------------- Statement ---------------- */}
        <div className={styles.head}>
          <p className={styles.eyebrow}>
            <span className={`${styles.eyebrowRule} ${styles.ruleL}`} aria-hidden="true" />
            <span className={`${styles.eyebrowLabel} f-cond cz caps`}>{c.eyebrow}</span>
            <span className={`${styles.eyebrowRule} ${styles.ruleR}`} aria-hidden="true" />
          </p>

          <h2 id="hunts-rewards-title" className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner">
                <span className={`${styles.live} t-white`}>{c.titleWhite}</span>{" "}
                <span className={`${styles.rewards} t-red`}>{c.titleRed}</span>
              </span>
            </span>
          </h2>

          <p className={`${styles.subline} f-sans cz caps`} data-a>
            {c.subline}
          </p>
        </div>

        {/* ---------------- Rewards ---------------- */}
        <ul className={styles.list}>
          {c.rewards.map((reward) => (
            <li key={reward.titleRed} className={styles.reward} data-a>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.icon}
                src={reward.icon.src}
                width={reward.icon.width}
                height={reward.icon.height}
                alt=""
                aria-hidden="true"
                decoding="async"
              />
              <span className={styles.divider} aria-hidden="true" />

              <div className={styles.text}>
                <h3 className={`${styles.rewardTitle} f-display cz caps`}>
                  <span className={styles.stretch}>
                    {reward.titleWhite && <>{reward.titleWhite} </>}
                    <span className={styles.red}>{reward.titleRed}</span>
                  </span>
                </h3>
                <p className={`${styles.rewardBody} f-sans cz`}>
                  {reward.body.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* The brush-script lines and their stroke, lifted from the mockup as
            an alpha image: hand-painted, not a font. A fixed 480px asset. */}
        <div className={styles.foot}>
          <span className={`${styles.footRule} ${styles.footL}`} aria-hidden="true" data-a />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.script}
            src="/assets/images/hunts-rewards-script.webp"
            width={480}
            height={168}
            alt={c.script}
            decoding="async"
            data-a
          />
          <span className={`${styles.footRule} ${styles.footR}`} aria-hidden="true" data-a />
        </div>
      </div>
    </section>
  );
}

export default HuntsRewards;
