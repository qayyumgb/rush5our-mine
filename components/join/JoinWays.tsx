"use client";

/**
 * JOIN THE MOVEMENT — section 2, "Choose how you join" (mockups/Join The
 * Movement/2.png, a 1024 x 1536 phone frame).
 *
 * A centred statement — tracked eyebrow, red rule, one leaning two-colour
 * headline, tracked subline — over the free tier's big red-framed card: the
 * community mark beside a hairline, a leaning title, the hand-painted
 * "FREE", a lead line, four checked perks, and the glowing red button. Then
 * "WANT TO GO FURTHER?" between two rules, its subline, three red-framed
 * cards (a red mark, a two-line leaning title, copy, a white outline
 * button), and a tracked tagline between two short rules.
 *
 * The marks, the "FREE" script, the check and the red grunge up both edges
 * are lifted from the mockup file (see data/join.ts).
 *
 * MOTION:
 *   • the eyebrow decodes, the rule draws, the headline's characters rise,
 *     the subline lifts
 *   • the free card rises; its hairline drops, the mark settles, the title,
 *     script, lead and perks cascade, the button wipes open
 *   • the "go further" rules draw outward as its characters rise
 *   • the three cards rise in turn, each mark settling as its text lifts
 *   • the tagline decodes between its rules
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import RedButton from "@/components/ui/RedButton";
import { joinWays } from "@/data/join";
import styles from "./JoinWays.module.css";

const CHECK = "/assets/images/join-ways-check.webp";

export function JoinWays() {
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
      (q(`.${styles.eyebrowWord}`) as HTMLElement[]).forEach((w, i) => {
        head.add(scramble(w, 0.8), i * 0.12);
      });
      head.fromTo(q(`.${styles.rule}`), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: EASE_IO }, 0.2);
      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(head, splitTitle(title), 0.25, 0.035);
      head.fromTo(q(`.${styles.subline}`), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 1.0);

      /* --- free card ---------------------------------------------------- */
      const free = q(`.${styles.free}`)[0] as HTMLElement | undefined;
      if (free) {
        const inF = gsap.utils.selector(free);
        gsap
          .timeline({ defaults: { ease: EASE }, scrollTrigger: { trigger: free, start: "top 82%" } })
          .fromTo(free, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, 0)
          .fromTo(inF(`.${styles.divider}`), { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: EASE_IO }, 0.25)
          .fromTo(inF(`.${styles.freeIcon}`), { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.9 }, 0.3)
          .fromTo(
            inF(`.${styles.freeTitle}, .${styles.lead}, .${styles.perk}`),
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 },
            0.35,
          )
          .fromTo(
            inF(`.${styles.badge}`),
            { clipPath: "inset(-20% 100% -20% 0)" },
            { clipPath: "inset(-20% 0% -20% 0)", duration: 0.7, ease: EASE_IO, clearProps: "clipPath" },
            0.55,
          )
          .fromTo(
            inF(`.${styles.freeBtn}`),
            { opacity: 0, clipPath: "inset(0 50% 0 50%)" },
            { opacity: 1, clipPath: "inset(0 0% 0 0%)", duration: 1, ease: EASE_IO, clearProps: "clipPath" },
            0.9,
          );
      }

      /* --- go further --------------------------------------------------- */
      const further = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.further}`)[0], start: "top 85%" },
      });
      further.fromTo(q(`.${styles.furtherRule}`), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: EASE_IO }, 0);
      const ft = q(`.${styles.furtherTitle}`)[0] as HTMLElement | undefined;
      if (ft) charsIn(further, splitTitle(ft), 0.1, 0.04);
      further.fromTo(q(`.${styles.furtherSub}`), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0.7);

      /* --- cards -------------------------------------------------------- */
      (q(`.${styles.card}`) as HTMLElement[]).forEach((card, i) => {
        const inC = gsap.utils.selector(card);
        gsap
          .timeline({ defaults: { ease: EASE }, scrollTrigger: { trigger: card, start: "top 88%" } })
          .fromTo(card, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, i * 0.1)
          .fromTo(inC(`.${styles.cardIcon}`), { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.9 }, i * 0.1 + 0.25)
          .fromTo(
            inC(`.${styles.cardTitle}, .${styles.cardBody}, .${styles.btn}`),
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 },
            i * 0.1 + 0.35,
          );
      });

      /* --- tagline ------------------------------------------------------ */
      const foot = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.foot}`)[0], start: "top 95%" },
      });
      foot.fromTo(q(`.${styles.footRule}`), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: EASE_IO }, 0);
      const tag = q(`.${styles.tagline}`)[0] as HTMLElement | undefined;
      if (tag) foot.add(scramble(tag, 0.9), 0.1);
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  const c = joinWays;

  return (
    <section ref={rootRef} id="ways" className={styles.section} aria-labelledby="join-ways-title">
      <div className={styles.atmos} aria-hidden="true" />

      <div className={styles.col}>
        {/* ---------------- Statement ---------------- */}
        <div className={styles.head}>
          <p className={`${styles.eyebrow} f-sans cz caps`}>
            {c.eyebrow.map((w) => (
              <span key={w} className={styles.eyebrowWord}>
                {w}
              </span>
            ))}
          </p>
          <span className={styles.rule} aria-hidden="true" />

          <h2 id="join-ways-title" className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner">
                <span className="t-white">{c.titleWhite} </span>
                <span className="t-red">{c.titleRed}</span>
              </span>
            </span>
          </h2>

          <p className={`${styles.subline} f-sans cz caps`} data-a>
            {c.subline}
          </p>
        </div>

        {/* ---------------- Free tier ---------------- */}
        <div className={styles.free} data-a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.freeIcon}
            src={c.free.icon.src}
            width={c.free.icon.width}
            height={c.free.icon.height}
            alt=""
            aria-hidden="true"
            decoding="async"
          />
          <span className={styles.divider} aria-hidden="true" />

          <div className={styles.freeText}>
            <h3 className={`${styles.freeTitle} f-display cz caps`}>
              <span className={styles.slant}>{c.free.title}</span>
            </h3>
            {/* The hand-painted "FREE", lifted from the mockup as an alpha
                image: a brush, not a font. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.badge}
              src="/assets/images/join-ways-free.webp"
              width={150}
              height={66}
              alt={c.free.badge}
              decoding="async"
            />
            <p className={`${styles.lead} f-sans cz`}>{c.free.lead}</p>
            <ul className={styles.perks}>
              {c.free.perks.map((perk) => (
                <li key={perk} className={`${styles.perk} f-sans`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={styles.check} src={CHECK} width={38} height={38} alt="" aria-hidden="true" decoding="async" />
                  <span className="cz">{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.freeBtn}>
            <RedButton
              label={c.free.cta.label}
              href={c.free.cta.href}
              className={styles.redBtn}
              wrapperClassName={styles.redMagnet}
              arrow="long"
              magnetStrength={0.14}
            />
          </div>
        </div>

        {/* ---------------- Go further ---------------- */}
        <div className={styles.further}>
          <div className={styles.furtherRow}>
            <span className={`${styles.furtherRule} ${styles.furtherL}`} aria-hidden="true" />
            <h3 className={styles.furtherTitle}>
              <span className="line f-display cz">
                <span className="line-inner">
                  <span className="t-white">{c.furtherWhite} </span>
                  <span className="t-red">{c.furtherRed}</span>
                </span>
              </span>
            </h3>
            <span className={`${styles.furtherRule} ${styles.furtherR}`} aria-hidden="true" />
          </div>
          <p className={`${styles.furtherSub} f-sans cz caps`} data-a>
            {c.furtherSub}
          </p>
        </div>

        <ul className={styles.cards}>
          {c.ways.map((way) => (
            <li key={way.cta.label} className={styles.card} data-lines={way.body.length} data-a>
              <span className={styles.iconSlot}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.cardIcon}
                  src={way.icon.src}
                  width={way.icon.width}
                  height={way.icon.height}
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                  style={{ "--w": way.icon.width, "--h": way.icon.height } as CSSProperties}
                />
              </span>
              <h4 className={`${styles.cardTitle} f-display cz caps`}>
                {way.title.map((l) => (
                  <span key={l} className={styles.slant}>
                    {l}
                  </span>
                ))}
              </h4>
              <p className={`${styles.cardBody} f-sans cz`}>
                {way.body.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </p>
              <a href={way.cta.href} className={styles.btn}>
                <span className={`${styles.btnLabel} f-cond cz caps`}>{way.cta.label}</span>
                <svg className={styles.btnArrow} viewBox="0 0 26 20" aria-hidden="true">
                  <path d="M1 10h23M16 2l8 8-8 8" />
                </svg>
              </a>
            </li>
          ))}
        </ul>

        {/* ---------------- Tagline ---------------- */}
        <p className={styles.foot}>
          <span className={`${styles.footRule} ${styles.footL}`} aria-hidden="true" data-a />
          <span className={`${styles.tagline} f-sans cz caps`} data-a>
            {c.tagline}
          </span>
          <span className={`${styles.footRule} ${styles.footR}`} aria-hidden="true" data-a />
        </p>
      </div>
    </section>
  );
}

export default JoinWays;
