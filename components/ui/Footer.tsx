"use client";

/**
 * FOOTER — shared by every page. Rendered once from the root layout, after
 * the page's own sections.
 *
 * Measured from the homepage's mockup 6 (it used to live inside the FAQ
 * section there): wordmark and tagline on the left, socials behind a
 * divider and the utility links on the right.
 *
 * MOTION: lifts into view — wordmark, tagline, socials, divider, links in
 * sequence — the once it is scrolled to.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO } from "@/lib/motion/helpers";
import { useMotion } from "@/components/motion/MotionProvider";
import { footerLinks, site, socialLinks } from "@/data/site";
import SocialIcon from "./SocialIcon";
import styles from "./Footer.module.css";

export function Footer() {
  const rootRef = useRef<HTMLElement>(null);
  const { ready, reduced } = useMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !ready || reduced) return;

    const q = gsap.utils.selector(root);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: EASE },
        // The foot of every page: on a tall viewport the document can stop
        // scrolling with the footer still low in view, so it fires on entry.
        scrollTrigger: { trigger: root, start: "top bottom" },
      });
      tl.fromTo(q(`.${styles.word}`), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0)
        .fromTo(q(`.${styles.tag}`), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.12)
        .fromTo(q(`.${styles.socials} a`), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 }, 0.2)
        .fromTo(q(`.${styles.sep}`), { scaleY: 0 }, { scaleY: 1, duration: 0.8, ease: EASE_IO }, 0.2)
        .fromTo(q(`.${styles.links} a`), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06 }, 0.35);
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <footer ref={rootRef} className={styles.footer}>
      <div className={`frame ${styles.rule}`}>
        <div className={styles.inner}>
          <div>
            <span className={`${styles.word} f-display cz`}>
              {site.wordmark.light}
              <span className="text-red">{site.wordmark.accent}</span>
            </span>
            <p className={`${styles.tag} f-sans cz caps`}>
              <span>More than merch.</span>
              <span>A culture.</span>
            </p>
          </div>

          <div className={styles.right}>
            {/* The divider is scoped to the icon row so the wider link row
                below can extend past it to the left, as in the mockup. */}
            <div className={styles.socialsRow}>
              <span className={styles.sep} aria-hidden="true" />
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

            <nav className={styles.links} aria-label="Footer">
              {footerLinks.map((l) => (
                <a key={l.label} href={l.href} className="f-sans cz caps">
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
