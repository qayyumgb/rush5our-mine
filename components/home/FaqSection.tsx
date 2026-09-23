"use client";

/**
 * FAQ — section 6, "Questions? Answered." (mockup 6.png).
 *
 * A centred heading, a single-open accordion, the "reach out" bar (which
 * opens the contact form) and the site footer.
 *
 * ▸ BACKEND SEAM: `items` arrives as a prop, defaulted to the static data.
 *
 * MOTION:
 *   • the shared `headReveal` opens the section
 *   • rows rise in sequence, then their numbers decode into place
 *   • opening a row animates its real height — measured from the content, so
 *     it works for answers of any length — while the previous row closes in
 *     the same timeline, and the toggle's vertical bar rotates flat
 *   • the footer lifts as it comes into view
 *
 * ACCESSIBILITY: the accordion is a set of buttons with `aria-expanded` and
 * `aria-controls`; panels are `role="region"` labelled by their trigger, and
 * are hidden from assistive tech while collapsed.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, headReveal, prepareStrokes, settle } from "@/lib/motion/helpers";
import { scramble } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import ContactForm from "@/components/ui/ContactForm";
import Eyebrow from "@/components/ui/Eyebrow";
import Icon from "@/components/ui/Icon";
import SocialIcon from "@/components/ui/SocialIcon";
import { faqContent, faqItems as defaultItems, type FaqItem } from "@/data/faq";
import { footerLinks, site, socialLinks } from "@/data/site";
import styles from "./FaqSection.module.css";

export interface FaqSectionProps {
  items?: FaqItem[];
}

export function FaqSection({ items = defaultItems }: FaqSectionProps) {
  const rootRef = useRef<HTMLElement>(null);
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  /** Tracks which panel is open so the previous one can be closed in step. */
  const openRef = useRef<string | null>(items[0]?.id ?? null);

  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  const [contactOpen, setContactOpen] = useState(false);
  const { ready, reduced } = useMotion();

  /* --- accordion --------------------------------------------------------- */
  const toggle = useCallback(
    (id: string) => {
      const next = openRef.current === id ? null : id;
      const prev = openRef.current;
      openRef.current = next;
      setOpenId(next);

      if (reduced || !ready) return;

      // Animate the real content height, so any answer length works.
      if (prev && prev !== next) {
        const el = panelRefs.current[prev];
        if (el) gsap.to(el, { height: 0, duration: 0.5, ease: EASE_IO, overwrite: true });
      }
      if (next) {
        const el = panelRefs.current[next];
        if (el) {
          const inner = el.firstElementChild as HTMLElement | null;
          gsap.to(el, {
            height: inner?.offsetHeight ?? "auto",
            duration: 0.65,
            ease: EASE_IO,
            overwrite: true,
          });
          gsap.fromTo(
            inner,
            { y: -14, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: EASE, delay: 0.1 },
          );
        }
      }
    },
    [reduced, ready],
  );

  /* --- entrance ---------------------------------------------------------- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !ready) return;

    const q = gsap.utils.selector(root);

    if (reduced) {
      gsap.set(q("[data-a]"), { visibility: "visible" });
      // Panel heights are handled in CSS under reduced motion — see the
      // `prefers-reduced-motion` rule in FaqSection.module.css.
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(q("[data-a]"), { visibility: "visible" });
      prepareStrokes(root);

      // Open the initially-expanded panel without animating it.
      const first = openRef.current ? panelRefs.current[openRef.current] : null;
      if (first) {
        const inner = first.firstElementChild as HTMLElement | null;
        gsap.set(first, { height: inner?.offsetHeight ?? "auto" });
      }

      const head = q(`.${styles.head}`)[0] as HTMLElement | undefined;
      if (head) headReveal(head, { copy: q(`.${styles.sub} span`) });

      /* rows */
      const rows = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.list}`)[0], start: "top 84%" },
      });
      settle(rows);
      rows.fromTo(
        q(`.${styles.item}`),
        { y: 44, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, stagger: 0.1, clearProps: "transform" },
        0,
      );
      q(`.${styles.num}`).forEach((n, i) => {
        rows.add(scramble(n as HTMLElement, 0.6), 0.25 + i * 0.1);
      });

      /* reach out */
      gsap.fromTo(
        q(`.${styles.reach}`),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: EASE,
          scrollTrigger: { trigger: q(`.${styles.reach}`)[0], start: "top 92%" },
        },
      );

      /* footer */
      const footer = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.footer}`)[0], start: "top 94%" },
      });
      settle(footer);
      footer
        .fromTo(q(`.${styles.footerWord}`), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0)
        .fromTo(q(`.${styles.footerTag}`), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.12)
        .fromTo(
          q(`.${styles.socials} a`),
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 },
          0.2,
        )
        .fromTo(q(`.${styles.footerSep}`), { scaleY: 0 }, { scaleY: 1, duration: 0.8, ease: EASE_IO }, 0.2)
        .fromTo(
          q(`.${styles.footerLinks} a`),
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.06 },
          0.35,
        );
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <section ref={rootRef} id="faq" className={styles.faq} aria-labelledby="faq-title">
      <div className={styles.atmos} aria-hidden="true" />

      <div className="frame">
        {/* ---------------- Heading ---------------- */}
        <div className={styles.head}>
          <Eyebrow
            label={faqContent.eyebrow}
            rules="both"
            className={styles.eyebrow}
            labelClassName={styles.eyebrowLabel}
            ruleClassName={styles.eyebrowRule}
          />

          <h2 id="faq-title" className={styles.title}>
            <span className={`line ${styles.l1} f-display cz`}>
              <span className="line-inner t-white">{faqContent.titleWhite}</span>
            </span>
            <span className={`line ${styles.l2} f-display cz glow-text`}>
              <span className="line-inner t-red">{faqContent.titleRed}</span>
            </span>
          </h2>

          <p className={`${styles.sub} f-sans cz`}>
            {faqContent.subLines.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </p>
        </div>

        {/* ---------------- Accordion ---------------- */}
        <div className={styles.list} data-a>
          {items.map((item, i) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`}
              >
                <button
                  type="button"
                  id={`faq-trigger-${item.id}`}
                  className={styles.trigger}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${item.id}`}
                  onClick={() => toggle(item.id)}
                >
                  <span className={`${styles.num} f-display cz`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.sep} aria-hidden="true" />
                  <span className={`${styles.question} f-display cz`}>{item.question}</span>
                  <span className={styles.toggle} aria-hidden="true">
                    <i />
                    <i />
                  </span>
                </button>

                <div
                  id={`faq-panel-${item.id}`}
                  ref={(el) => {
                    panelRefs.current[item.id] = el;
                  }}
                  className={styles.panel}
                  role="region"
                  aria-labelledby={`faq-trigger-${item.id}`}
                  inert={!isOpen}
                >
                  <p className={`${styles.answer} f-sans cz`}>
                    {item.answer.map((line, j) => (
                      <span key={j}>{line}</span>
                    ))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ---------------- Reach out ---------------- */}
        {/* CONTACT: opens the contact form overlay. The submit handler is
            stubbed — see components/ui/ContactForm.tsx. */}
        <button
          type="button"
          id="contact"
          className={styles.reach}
          data-a
          onClick={() => setContactOpen(true)}
        >
          <span className={styles.reachMark} aria-hidden="true">
            R5
          </span>
          <Icon name="envelope" className={styles.reachIcon} />
          <span className={styles.reachSep} aria-hidden="true" />
          <span>
            <span className={`${styles.reachKicker} f-sans cz caps`} style={{ display: "block" }}>
              {faqContent.reachOut.kicker}
            </span>
            <span className={`${styles.reachLabel} f-display cz`}>
              {faqContent.reachOut.label}
              <Icon name="arrowRight" />
            </span>
          </span>
        </button>
      </div>

      {/* ---------------- Footer ---------------- */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <span className={`${styles.footerWord} f-display cz`}>
              {site.wordmark.light}
              <span className="text-red">{site.wordmark.accent}</span>
            </span>
            <p className={`${styles.footerTag} f-sans cz caps`}>
              <span>More than merch.</span>
              <span>A culture.</span>
            </p>
          </div>

          <div className={styles.footerRight}>
            {/* The divider is scoped to the icon row so the wider link row
                below can extend past it to the left, as in the mockup. */}
            <div className={styles.socialsRow}>
              <span className={styles.footerSep} aria-hidden="true" />
              <div className={styles.socials}>
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <SocialIcon name={s.icon} />
                  </a>
                ))}
              </div>
            </div>

            <nav className={styles.footerLinks} aria-label="Footer">
              {footerLinks.map((l) => (
                <a key={l.label} href={l.href} className="f-sans cz caps">
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </footer>

      <ContactForm open={contactOpen} onClose={() => setContactOpen(false)} />
    </section>
  );
}

export default FaqSection;
