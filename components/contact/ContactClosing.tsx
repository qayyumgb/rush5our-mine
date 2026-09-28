"use client";

/**
 * CONTACT — section 5, "This is only the beginning" (mockups/Contact/5.png,
 * a 1024 x 1536 phone frame). The page's close.
 *
 * The brand's brush mark — a red R5 with the name scripted beneath it —
 * over a centred two-line slanted headline, three lines of copy, the red
 * join button, a four-column strip of icon and label pairs split by red
 * hairlines, and a footer line of four runs joined by dots between two
 * white dashes.
 *
 * The brush mark and the scripted name are lifted from the mockup file as
 * alpha images (see data/contact.ts): they are hand-painted, not a font.
 *
 * MOTION: the eyebrow decodes; the R5 wipes on as a brush stroke would,
 * left to right, and the script writes on after it; the headline's
 * characters rise, the copy lifts, the button wipes open from its centre;
 * the strip's dividers drop and its icons draw on; the footer's dashes draw
 * outward and its runs decode.
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn, prepareStrokes } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import Icon from "@/components/ui/Icon";
import RedButton from "@/components/ui/RedButton";
import { contactClosing } from "@/data/contact";
import styles from "./ContactClosing.module.css";

export function ContactClosing() {
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

      /* --- mark + statement --------------------------------------------- */
      const head = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.head}`)[0], start: "top 80%" },
      });
      (q(`.${styles.eyebrowWord}`) as HTMLElement[]).forEach((w, i) => {
        head.add(scramble(w, 0.8), i * 0.12);
      });
      head
        .fromTo(q(`.${styles.rule}`), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: EASE_IO }, 0.2)
        .fromTo(
          q(`.${styles.r5}`),
          { clipPath: "inset(-10% 100% -10% 0)" },
          { clipPath: "inset(-10% 0% -10% 0)", duration: 1.2, ease: EASE_IO, clearProps: "clipPath" },
          0.3,
        )
        .fromTo(
          q(`.${styles.script}`),
          { clipPath: "inset(-10% 100% -10% 0)" },
          { clipPath: "inset(-10% 0% -10% 0)", duration: 1.1, ease: EASE_IO, clearProps: "clipPath" },
          1.0,
        );
      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(head, splitTitle(title), 1.2);
      head
        .fromTo(q(`.${styles.body} span`), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.1 }, 1.9)
        .fromTo(
          q(`.${styles.btnWrap}`),
          { y: 24, opacity: 0, clipPath: "inset(0% 50% 0% 50%)" },
          { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: EASE_IO, clearProps: "clipPath" },
          2.2,
        );

      /* --- strip -------------------------------------------------------- */
      const strip = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.strip}`)[0], start: "top 88%" },
      });
      strip
        .fromTo(q(`.${styles.divider}`), { scaleY: 0 }, { scaleY: 1, duration: 1, ease: EASE_IO, stagger: 0.1 }, 0)
        .fromTo(q(`.${styles.pillar}`), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.12 }, 0.1)
        .fromTo(
          q(".i-stroke"),
          { strokeDashoffset: (_i: number, el: Element) => Number((el as SVGElement).dataset.len ?? 0) },
          { strokeDashoffset: 0, duration: 1, stagger: 0.04, ease: "power2.inOut" },
          0.3,
        );

      /* --- footer: the foot of the page, so it fires on entry ----------- */
      const foot = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.foot}`)[0], start: "top bottom" },
      });
      foot.fromTo(q(`.${styles.dash}`), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: EASE_IO }, 0);
      (q(`.${styles.footRun}`) as HTMLElement[]).forEach((s, i) => {
        foot.add(scramble(s, 0.8), 0.1 + i * 0.12);
      });
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  const c = contactClosing;

  return (
    <section
      ref={rootRef}
      id="closing"
      className={styles.section}
      aria-labelledby="contact-closing-title"
    >
      <div className={styles.atmos} aria-hidden="true" />

      <div className={styles.col}>
        <div className={styles.head}>
          <p className={`${styles.eyebrow} f-sans cz caps`}>
            {c.eyebrow.map((w) => (
              <span key={w} className={styles.eyebrowWord}>
                {w}
              </span>
            ))}
          </p>
          <span className={styles.rule} aria-hidden="true" />

          {/* The brush mark and the scripted name, as painted. Fixed-size
              artwork lifted from the mockup, not responsive photographs. */}
          <div className={styles.mark} role="img" aria-label={c.markLabel}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.r5} src="/assets/images/contact-closing-r5.webp" width={730} height={350} alt="" decoding="async" data-a />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.script} src="/assets/images/contact-closing-script.webp" width={700} height={180} alt="" decoding="async" data-a />
          </div>

          <h2 id="contact-closing-title" className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner t-white">{c.titleWhite}</span>
            </span>
            <span className="line f-display cz">
              <span className="line-inner t-red">{c.titleRed}</span>
            </span>
          </h2>

          <p className={`${styles.body} f-sans cz`}>
            {c.bodyLines.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </p>

          <div className={styles.btnWrap} data-a>
            <RedButton
              label={c.cta.label}
              href={c.cta.href}
              className={styles.btn}
              arrow="long"
              magnetStrength={0.18}
            />
          </div>
        </div>

        {/* ---------------- Strip ---------------- */}
        <ul className={styles.strip}>
          {c.pillars.map((p, i) => (
            <li key={p.label.join(" ")} className={styles.pillar} data-a>
              {i > 0 && <span className={styles.divider} aria-hidden="true" />}
              <Icon name={p.icon} className={styles.icon} />
              <span className={`${styles.label} f-cond cz caps`}>
                {p.label.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </span>
            </li>
          ))}
        </ul>

        {/* ---------------- Footer ---------------- */}
        <div className={styles.foot}>
          <span className={`${styles.dash} ${styles.dashL}`} aria-hidden="true" />
          <p className={`${styles.footLine} f-sans cz caps`}>
            {c.footer.map((run, i) => (
              <span key={run} className={styles.footItem}>
                {i > 0 && (
                  <span className={styles.dot} aria-hidden="true">
                    •
                  </span>
                )}
                <span className={styles.footRun}>{run}</span>
              </span>
            ))}
          </p>
          <span className={`${styles.dash} ${styles.dashR}`} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

export default ContactClosing;
