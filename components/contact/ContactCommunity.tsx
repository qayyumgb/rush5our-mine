"use client";

/**
 * CONTACT — section 4, "Connect with the community" (mockups/Contact/4.png,
 * a 1024 x 1536 phone frame).
 *
 * A centred two-line slanted headline over three outlined network cards —
 * brand mark, name, handle, outlined button — and a wide red-framed panel:
 * a slanted headline, three lines of copy and a red script sign-off on the
 * left, a night-crowd photograph fading in from the right.
 *
 * The brand marks, the photograph and the "Thank you." script are lifted
 * from the mockup file (see data/contact.ts). The same red grunge as the
 * rest of the page creeps in at both edges.
 *
 * MOTION: the eyebrow decodes, the headline's characters rise, the subline
 * lifts; the cards rise in turn with their marks popping in and buttons
 * wiping open; the panel rises, its photo settles out of a push-in, its
 * headline rises, the copy lifts and the script writes on.
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import { contactCommunity } from "@/data/contact";
import styles from "./ContactCommunity.module.css";

export function ContactCommunity() {
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
      if (title) charsIn(head, splitTitle(title), 0.25);
      head.fromTo(q(`.${styles.subline}`), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 1.0);

      /* --- cards -------------------------------------------------------- */
      const cards = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.grid}`)[0], start: "top 85%" },
      });
      cards
        .fromTo(q(`.${styles.card}`), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.12 }, 0)
        .fromTo(
          q(`.${styles.logo}`),
          { scale: 0.6, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.9, stagger: 0.12, ease: "back.out(1.6)" },
          0.2,
        )
        .fromTo(
          q(`.${styles.name}, .${styles.handle}`),
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.06 },
          0.4,
        )
        .fromTo(
          q(`.${styles.btnWrap}`),
          { opacity: 0, clipPath: "inset(0 50% 0 50%)" },
          { opacity: 1, clipPath: "inset(0 0% 0 0%)", duration: 0.9, stagger: 0.12, ease: EASE_IO, clearProps: "clipPath" },
          0.6,
        );

      /* --- panel -------------------------------------------------------- */
      const panel = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.panel}`)[0], start: "top 80%" },
      });
      panel
        .fromTo(q(`.${styles.panel}`), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, 0)
        .fromTo(q(`.${styles.photo}`), { scale: 1.08, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.8, ease: "power2.out" }, 0.1);
      const pTitle = q(`.${styles.panelTitle}`)[0] as HTMLElement | undefined;
      if (pTitle) charsIn(panel, splitTitle(pTitle), 0.3);
      panel
        .fromTo(q(`.${styles.panelBody} span`), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 }, 0.7)
        .fromTo(
          q(`.${styles.thanks}`),
          { clipPath: "inset(-20% 100% -20% 0)" },
          { clipPath: "inset(-20% 0% -20% 0)", duration: 1.1, ease: EASE_IO, clearProps: "clipPath" },
          1.0,
        );
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  const c = contactCommunity;

  return (
    <section
      ref={rootRef}
      id="community"
      className={styles.section}
      aria-labelledby="contact-community-title"
    >
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

          <h2 id="contact-community-title" className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner t-white">{c.titleLine1}</span>
            </span>
            <span className="line f-display cz">
              <span className="line-inner">
                <span className="t-white">{c.titleLine2White} </span>
                <span className="t-red">{c.titleLine2Red}</span>
              </span>
            </span>
          </h2>

          <p className={`${styles.subline} f-sans cz caps`} data-a>
            {c.subline}
          </p>
        </div>

        {/* ---------------- Network cards ---------------- */}
        <ul className={styles.grid}>
          {c.networks.map((n) => (
            <li key={n.name} className={styles.card} data-a>
              {/* Brand marks are the mockup's own, on the card's black. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.logo}
                src={n.logo.src}
                width={n.logo.width}
                height={n.logo.height}
                alt=""
                aria-hidden="true"
                decoding="async"
              />
              <span className={`${styles.name} f-cond cz caps`}>{n.name}</span>
              <span className={`${styles.handle} f-sans cz`}>{n.handle}</span>
              <div className={styles.btnWrap}>
                <a href={n.cta.href} className={styles.btn} target="_blank" rel="noreferrer noopener">
                  <span className="f-cond cz caps">{n.cta.label}</span>
                  <svg className={styles.btnArrow} viewBox="0 0 32 20" aria-hidden="true">
                    <path d="M1 10h29M21 1.5l9 8.5-9 8.5" />
                  </svg>
                  <span className="sr-only"> {n.name}</span>
                </a>
              </div>
            </li>
          ))}
        </ul>

        {/* ---------------- Panel ---------------- */}
        <div className={styles.panel} data-a>
          {/* The crowd photograph, lifted from the mockup; it already fades
              to black on its left edge. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.photo}
            src="/assets/images/contact-community-photo.webp"
            width={475}
            height={490}
            alt=""
            aria-hidden="true"
            decoding="async"
            data-a
          />

          <div className={styles.panelCopy}>
            <h3 className={styles.panelTitle}>
              <span className="line f-display cz">
                <span className="line-inner t-white">{c.panel.titleWhite}</span>
              </span>
              <span className="line f-display cz">
                <span className="line-inner t-red">{c.panel.titleRed}</span>
              </span>
            </h3>

            <p className={`${styles.panelBody} f-sans cz`}>
              {c.panel.bodyLines.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </p>

            {/* The script sign-off, lifted from the mockup as an alpha
                image; a fixed 330px asset. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.thanks}
              src="/assets/images/contact-community-thanks.webp"
              width={330}
              height={110}
              alt={c.panel.thanks}
              decoding="async"
              data-a
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactCommunity;
