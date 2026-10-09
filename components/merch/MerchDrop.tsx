"use client";

/**
 * MERCH — section 2, "Featured drop: Level 1: Essentials" (mockups/Merch/
 * 2.png, a 941 x 1672 phone frame).
 *
 * The product: a centred statement — red tracked eyebrow, a two-line
 * leaning headline, a tracked subline — over the section's photograph (the
 * tee on a crate under red light, the mockup's own), with a prev/next ring
 * at each side, four view thumbnails, the name, price and two lines of
 * copy beside a size picker behind a red hairline, the glowing "add to
 * cart" button, and four dots.
 *
 * The thumbnails, the rings and the dots all pick the same thing: which
 * view is on the stage. The first view is the photograph itself; the rest
 * lay a picture over its tee.
 *
 * ▸ BACKEND SEAM — one product, no cart. "Add to cart" is a link to be
 *   pointed at the Shopify checkout in Phase 2 (RUSH5OUR-Implementation-
 *   Plan.md, 2B); the chosen size is held in state for it.
 *
 * MOTION:
 *   • the eyebrow decodes, the headline's characters rise, the subline lifts
 *   • the rings pop in, the thumbnails cascade, the details lift, the sizes
 *     cascade, the button wipes open, the dots follow
 *   • a view change cross-fades the stage and slides the ring's glyph
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import Icon from "@/components/ui/Icon";
import RedButton from "@/components/ui/RedButton";
import { merchDrop } from "@/data/merch";
import styles from "./MerchDrop.module.css";

export function MerchDrop() {
  const rootRef = useRef<HTMLElement>(null);
  const { ready, reduced } = useMotion();
  const [view, setView] = useState(0);
  const [size, setSize] = useState(0);

  const c = merchDrop;
  const { product } = c;
  const count = product.views.length;

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
      const label = q(`.${styles.eyebrow}`)[0] as HTMLElement | undefined;
      if (label) head.add(scramble(label, 0.9), 0);
      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(head, splitTitle(title), 0.2, 0.04);
      head.fromTo(q(`.${styles.subline}`), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.9);

      /* --- stage -------------------------------------------------------- */
      gsap
        .timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: q(`.${styles.rings}`)[0], start: "top 85%" },
        })
        .fromTo(
          q(`.${styles.ring}`),
          { scale: 0.6, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.9, ease: "back.out(1.8)", stagger: 0.1 },
          0,
        );

      /* --- details ------------------------------------------------------ */
      gsap
        .timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: q(`.${styles.thumbs}`)[0], start: "top 88%" },
        })
        .fromTo(q(`.${styles.thumb}`), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 }, 0)
        .fromTo(
          q(`.${styles.name}, .${styles.price}, .${styles.desc}`),
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 },
          0.3,
        )
        .fromTo(q(`.${styles.divider}`), { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: EASE_IO }, 0.4)
        .fromTo(
          q(`.${styles.sizeLabel}, .${styles.size}`),
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.06 },
          0.5,
        )
        .fromTo(
          q(`.${styles.btnWrap}`),
          { y: 20, opacity: 0, clipPath: "inset(0% 50% 0% 50%)" },
          { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: EASE_IO, clearProps: "clipPath" },
          0.9,
        )
        .fromTo(q(`.${styles.dot}`), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, stagger: 0.06 }, 1.1);
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  const go = (next: number) => setView(((next % count) + count) % count);

  return (
    <section ref={rootRef} id="drop" className={styles.section} aria-labelledby="merch-drop-title">
      {/* The mockup's own photograph, with its type and panels filled in —
          see data/merch.ts. The tee in it is the first view. */}
      <div className={styles.atmos} aria-hidden="true" />

      <div className={styles.frame}>
        {/* ---------------- Statement ---------------- */}
        <div className={styles.head}>
          <p className={`${styles.eyebrow} f-sans cz caps`}>{c.eyebrow}</p>
          <h2 id="merch-drop-title" className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner t-white">{c.titleWhite}</span>
            </span>
            <span className="line f-display cz glow-text">
              <span className="line-inner t-red">{c.titleRed}</span>
            </span>
          </h2>
          <p className={`${styles.subline} f-sans cz caps`} data-a>
            {c.subline}
          </p>
        </div>

        {/* ---------------- Stage ---------------- */}
        <div className={styles.stage} role="group" aria-roledescription="carousel" aria-label={product.name}>
          {product.views.map((v, i) =>
            v.stage ? (
              <div
                key={v.label}
                className={styles.view}
                data-active={i === view || undefined}
                role="group"
                aria-roledescription="slide"
                aria-label={`${v.label}, ${i + 1} of ${count}`}
                aria-hidden={i !== view}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.stage.src}
                  width={v.stage.width}
                  height={v.stage.height}
                  alt={`${product.name} — ${v.label.toLowerCase()}`}
                  decoding="async"
                  loading="lazy"
                />
              </div>
            ) : null,
          )}
        </div>

        <div className={styles.rings}>
          <button
            type="button"
            className={`${styles.ring} ${styles.ringL}`}
            aria-label="Previous view"
            onClick={() => go(view - 1)}
            data-a
          >
            <svg viewBox="0 0 11 23" aria-hidden="true">
              <path d="M9.5 1.5 1.5 11.5l8 10" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.ring} ${styles.ringR}`}
            aria-label="Next view"
            onClick={() => go(view + 1)}
            data-a
          >
            <svg viewBox="0 0 11 23" aria-hidden="true">
              <path d="m1.5 1.5 8 10-8 10" />
            </svg>
          </button>
        </div>

        {/* ---------------- Views ---------------- */}
        <div className={styles.thumbs} role="tablist" aria-label="Views">
          {product.views.map((v, i) => (
            <button
              key={v.label}
              type="button"
              role="tab"
              aria-selected={i === view}
              aria-label={v.label}
              className={`${styles.thumb} ${i === view ? styles.thumbActive : ""}`}
              onClick={() => setView(i)}
              data-a
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v.thumb.src} width={v.thumb.width} height={v.thumb.height} alt="" decoding="async" loading="lazy" />
            </button>
          ))}
        </div>

        {/* ---------------- Details ---------------- */}
        <h3 className={`${styles.name} f-sans cz caps`} data-a>
          {product.name}
        </h3>
        <p className={`${styles.price} f-display cz`} data-a>
          {product.price}
        </p>
        <p className={`${styles.desc} f-sans cz`} data-a>
          {product.descriptionLines.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </p>

        <span className={styles.divider} aria-hidden="true" data-a />

        <p className={`${styles.sizeLabel} f-sans cz caps`} data-a>
          {product.sizeLabel}
        </p>
        <div className={styles.sizes} role="radiogroup" aria-label={product.sizeLabel}>
          {product.sizes.map((s, i) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={i === size}
              className={`${styles.size} ${i === size ? styles.sizeActive : ""}`}
              onClick={() => setSize(i)}
              data-a
            >
              <span className="f-sans cz">{s}</span>
            </button>
          ))}
        </div>

        <div className={styles.btnWrap} data-a>
          <RedButton
            label={product.cta.label}
            href={product.cta.href}
            className={styles.btn}
            wrapperClassName={styles.btnMagnet}
            arrow="none"
            magnetStrength={0.12}
          >
            <Icon name="cart" className={styles.cart} />
          </RedButton>
        </div>

        <div className={styles.dots}>
          {product.views.map((v, i) => (
            <button
              key={v.label}
              type="button"
              className={`${styles.dot} ${i === view ? styles.dotActive : ""}`}
              aria-label={`Show ${v.label.toLowerCase()} view`}
              aria-current={i === view ? "true" : undefined}
              onClick={() => setView(i)}
              data-a
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default MerchDrop;
