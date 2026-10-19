"use client";

/**
 * MERCH — the store: every product, after the featured drop (no mockup;
 * Phase 2, 2B in RUSH5OUR-Implementation-Plan.md).
 *
 * The statement in the page's own manner — red tracked eyebrow, a leaning
 * two-colour headline, a tracked subline — then a carousel of product
 * cards: photo (the second photo shows on hover), name, price ("From $30"
 * when the variants differ), and a "Sold out" tag. Each card opens the
 * product's page.
 *
 * CAROUSEL: a native scroll-snap row, so a phone swipes it like any list
 * (one card and a peek of the next); three cards from 700px. The featured
 * drop's red rings page it by a screenful and dim at either end; a red
 * bar under it shows where in the row you are. Arrow keys page it once it
 * has focus. Rings and bar are left out when every card already fits.
 *
 * DATA: Shopify's products, fetched on the server (app/merch/page.tsx) and
 * passed in. The page leaves this section out when there are none — the
 * featured drop above already says why.
 *
 * MOTION: the statement as the sections around it; the cards rise in turn.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, charsIn } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import { formatPriceRange, imageAt, srcSet } from "@/lib/shopify/format";
import type { ShopProductCard } from "@/lib/shopify/types";
import { merchShop } from "@/data/merch";
import { shop } from "@/data/shop";
import styles from "./MerchShop.module.css";

const WIDTHS = [240, 360, 480, 640, 800];

const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.visibility = "hidden";
};

export function MerchShop({ products }: { products: ShopProductCard[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const { ready, reduced } = useMotion();
  const c = merchShop;
  const trackRef = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState({
    start: true,
    end: false,
    fits: true,
    left: 0,
    width: 1,
  });

  /* --- where the row is: ends, and the bar's thumb ------------------- */
  const measure = useCallback(() => {
    const t = trackRef.current;
    if (!t) return;
    const max = t.scrollWidth - t.clientWidth;
    const width = t.scrollWidth ? t.clientWidth / t.scrollWidth : 1;
    setPos({
      start: t.scrollLeft <= 2,
      end: t.scrollLeft >= max - 2,
      fits: max <= 2,
      left: max > 0 ? (t.scrollLeft / max) * (1 - width) : 0,
      width,
    });
  }, []);

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const ro = new ResizeObserver(onScroll);
    ro.observe(t);
    t.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      t.removeEventListener("scroll", onScroll);
    };
  }, [measure, products.length]);

  /** As many cards as fit in view at a time: three on a wide screen, one on
      a phone (where the next only peeks in). */
  const page = (dir: 1 | -1) => {
    const t = trackRef.current;
    const card = t?.firstElementChild as HTMLElement | null;
    if (!t || !card) return;
    const style = getComputedStyle(t);
    const gap = parseFloat(style.columnGap) || 0;
    const view = t.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const step = card.offsetWidth + gap;
    const perView = Math.max(1, Math.floor((view + gap + 1) / step));
    t.scrollBy({ left: dir * perView * step, behavior: reduced ? "auto" : "smooth" });
  };

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
        scrollTrigger: { trigger: q(`.${styles.head}`)[0], start: "top 82%" },
      });
      const label = q(`.${styles.eyebrow}`)[0] as HTMLElement | undefined;
      if (label) head.add(scramble(label, 0.9), 0);
      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(head, splitTitle(title), 0.15, 0.04);
      head.fromTo(q(`.${styles.subline}`), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.7);

      gsap.fromTo(
        q(`.${styles.card}`),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: EASE,
          stagger: 0.08,
          clearProps: "transform",
          scrollTrigger: {
            trigger: q(`.${styles.track}`)[0],
            start: "top 85%",
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <section ref={rootRef} id="shop" className={styles.section} aria-labelledby="merch-shop-title">
      <div className={styles.atmos} aria-hidden="true" />

      <div className={styles.frame}>
        <div className={styles.head}>
          <p className={`${styles.eyebrow} f-sans cz caps`}>{c.eyebrow}</p>
          <h2 id="merch-shop-title" className={styles.title}>
            <span className="line f-display cz glow-text">
              <span className="line-inner">
                <span className="t-white">{c.titleWhite}</span> <span className="t-red">{c.titleRed}</span>
              </span>
            </span>
          </h2>
          <p className={`${styles.subline} f-sans cz caps`} data-a>
            {c.subline}
          </p>
        </div>

        <div className={styles.carousel}>
          <ul
            ref={trackRef}
            className={styles.track}
            aria-roledescription="carousel"
            aria-label={`${c.titleWhite} ${c.titleRed}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                e.preventDefault();
                page(1);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                page(-1);
              }
            }}
          >
            {products.map((p, i) => {
              const [first, second] = p.images;
              return (
                <li key={p.id} className={styles.card} data-a>
                  <a className={styles.link} href={`/merch/${p.handle}`}>
                    <span className={styles.media}>
                      {first && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          className={styles.img}
                          src={imageAt(first.url, 640)}
                          srcSet={srcSet(first, WIDTHS)}
                          sizes="(min-width: 900px) 280px, (min-width: 700px) 30vw, 62vw"
                          width={first.width ?? undefined}
                          height={first.height ?? undefined}
                          alt={first.altText || p.title}
                          loading={i < 4 ? "eager" : "lazy"}
                          decoding="async"
                          // A photo removed from the store leaves the card's dark face,
                          // not broken-image text.
                          onError={hideBroken}
                        />
                      )}
                      {second && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          className={`${styles.img} ${styles.imgAlt}`}
                          src={imageAt(second.url, 640)}
                          srcSet={srcSet(second, WIDTHS)}
                          sizes="(min-width: 900px) 280px, (min-width: 700px) 30vw, 62vw"
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          decoding="async"
                          onError={hideBroken}
                        />
                      )}
                      {!p.availableForSale && <span className={`${styles.tag} f-cond caps`}>{shop.soldOut}</span>}
                    </span>
                    <span className={`${styles.name} f-cond caps`}>{p.title}</span>
                    <span className={`${styles.price} f-display`}>{formatPriceRange(p.minPrice, p.maxPrice, shop.from)}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          {!pos.fits && (
            <>
              <button
                type="button"
                className={`${styles.ring} ${styles.ringL}`}
                aria-label={c.labels.prev}
                onClick={() => page(-1)}
                disabled={pos.start}
              >
                <svg viewBox="0 0 11 23" aria-hidden="true">
                  <path d="M9.5 1.5 1.5 11.5l8 10" />
                </svg>
              </button>
              <button
                type="button"
                className={`${styles.ring} ${styles.ringR}`}
                aria-label={c.labels.next}
                onClick={() => page(1)}
                disabled={pos.end}
              >
                <svg viewBox="0 0 11 23" aria-hidden="true">
                  <path d="m1.5 1.5 8 10-8 10" />
                </svg>
              </button>
            </>
          )}
        </div>

        {!pos.fits && (
          <div className={styles.bar} aria-hidden="true">
            <span
              className={styles.thumb}
              style={{
                left: `${pos.left * 100}%`,
                width: `${pos.width * 100}%`,
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default MerchShop;
