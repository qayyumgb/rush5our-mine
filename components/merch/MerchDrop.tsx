"use client";

/**
 * MERCH — section 2, "Featured drop: Level 1: Essentials" (mockups/Merch/
 * 2.png, a 941 x 1672 phone frame).
 *
 * The product: a centred statement — red tracked eyebrow, a two-line
 * leaning headline, a tracked subline — over the section's photograph (a
 * crate under red light), the product's photo on the stage with a
 * prev/next ring at each side, up to four photo thumbnails, the name,
 * price and description beside the option boxes behind a red hairline,
 * the glowing "add to cart" button, and a dot per photo.
 *
 * The mockup's composition holds whatever the product: the photo fills the
 * stage and is feathered into the crate scene (as the mockup's tee is),
 * the thumbnail row, size column and dots are always there. The mockup's
 * own look comes back exactly when the product's photos are the mockup's:
 * see the implementation plan, 2B, for the four to upload.
 *
 * DATA: the product is Shopify's — the first in the store's "featured"
 * collection, fetched on the server (app/merch/page.tsx) and passed in.
 * Name, price, photos, options and stock are all the store's; only the
 * statement above it is ours (data/merch.ts). "Add to cart" adds the
 * chosen variant to the Shopify cart and opens the cart drawer.
 *
 * STATES: no product (store not configured, nothing in it, or Shopify
 * unreachable) keeps the statement and the photograph and shows a short
 * note where the product would be. A sold-out product, or a sold-out
 * option, turns the button into "Sold out".
 *
 * LAYOUT: the statement, stage and rings are placed off the frame's top as
 * the mockup measures them. From the thumbnails down the block flows, at
 * the mockup's sizes, so a long name, a longer description or a second
 * option group pushes what follows down instead of overlapping it.
 *
 * MOTION:
 *   • the eyebrow decodes, the headline's characters rise, the subline lifts
 *   • the rings pop in, the thumbnails cascade, the details lift, the
 *     options follow, the button wipes open, the dots follow
 *   • a photo change cross-fades the stage
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
import { useAddToCart } from "@/components/cart/useAddToCart";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney, imageAt, srcSet } from "@/lib/shopify/format";
import type { ShopFailure, ShopProduct } from "@/lib/shopify/types";
import { merchDrop } from "@/data/merch";
import { shop } from "@/data/shop";
import ProductOptions from "./ProductOptions";
import styles from "./MerchDrop.module.css";

/** The thumbnail row holds four, as the mockup does. */
const MAX_VIEWS = 4;

export interface MerchDropProps {
  product: ShopProduct | null;
  /** Why there's no product (or "loading" while it's fetched); ignored
      when there is one. */
  failure?: ShopFailure | "empty" | "loading";
}

function Buy({ product }: { product: ShopProduct }) {
  const c = merchDrop;
  const cart = useCart();
  const buy = useAddToCart(product);
  const href = `/merch/${product.handle}`;
  const description = product.description.trim();

  return (
    <>
      <div className={styles.info}>
        <div className={styles.infoMain}>
          <h3 className={`${styles.name} f-sans caps`} data-a>
            <a href={href} title={product.title}>
              {product.title}
            </a>
          </h3>
          <p className={`${styles.price} f-display`} data-a>
            {formatMoney(buy.price)}
            {buy.compareAt && Number(buy.compareAt.amount) > Number(buy.price.amount) && (
              <s className={styles.compare}>{formatMoney(buy.compareAt)}</s>
            )}
          </p>
          {description && (
            <p className={`${styles.desc} f-sans`} data-a>
              {description}
            </p>
          )}
        </div>

        <span className={styles.divider} aria-hidden="true" data-a />

        <div className={styles.opts} data-a>
          {/* Always a size column, as the mockup has: a product without
              options shows its one size. */}
          <ProductOptions
            product={product}
            selection={buy.selection}
            choose={buy.choose}
            idPrefix="drop"
            className={styles.options}
            single={{ name: c.labels.size, value: c.labels.oneSize }}
          />
        </div>
      </div>

      <div className={styles.btnWrap} data-a>
        <RedButton
          label={buy.label}
          onClick={buy.submit}
          disabled={!cart?.enabled || buy.soldOut || buy.unavailable}
          className={`${styles.btn} ${buy.adding ? styles.btnBusy : ""}`}
          wrapperClassName={styles.btnMagnet}
          arrow="none"
          magnetStrength={buy.canAdd ? 0.12 : 0}
        >
          <Icon name="cart" className={styles.cart} />
        </RedButton>
      </div>

      <p className={`${styles.error} f-sans`} role="alert">
        {buy.error}
      </p>
    </>
  );
}

export function MerchDrop({ product, failure = "empty" }: MerchDropProps) {
  const rootRef = useRef<HTMLElement>(null);
  const { ready, reduced } = useMotion();
  const [view, setView] = useState(0);

  const c = merchDrop;
  const views = product?.images.slice(0, MAX_VIEWS) ?? [];
  const count = views.length;
  const state = { empty: shop.empty, loading: shop.loading, unconfigured: shop.unconfigured, error: shop.error }[failure];

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
      const rings = q(`.${styles.ring}`);
      if (rings.length) {
        gsap
          .timeline({
            defaults: { ease: EASE },
            scrollTrigger: { trigger: q(`.${styles.rings}`)[0], start: "top 85%" },
          })
          .fromTo(rings, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: "back.out(1.8)", stagger: 0.1 }, 0);
      }

      /* --- details ------------------------------------------------------ */
      const details = q(`.${styles.details}`)[0];
      if (details) {
        gsap
          .timeline({ defaults: { ease: EASE }, scrollTrigger: { trigger: details, start: "top 88%" } })
          .fromTo(q(`.${styles.thumb}`), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 }, 0)
          .fromTo(
            q(`.${styles.name}, .${styles.price}, .${styles.desc}, .${styles.more}`),
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 },
            0.3,
          )
          .fromTo(q(`.${styles.divider}`), { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: EASE_IO }, 0.4)
          .fromTo(q(`.${styles.opts}`), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.5)
          .fromTo(
            q(`.${styles.btnWrap}`),
            { y: 20, opacity: 0, clipPath: "inset(0% 50% 0% 50%)" },
            { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: EASE_IO, clearProps: "clipPath" },
            0.9,
          )
          .fromTo(q(`.${styles.dot}`), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, stagger: 0.06 }, 1.1);
      }

      const note = q(`.${styles.state}`)[0];
      if (note) {
        gsap.fromTo(note, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: EASE, scrollTrigger: { trigger: note, start: "top 88%" } });
      }
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  const go = (next: number) => setView(((next % count) + count) % count);
  const viewLabel = (i: number) => c.labels.view.replace("{n}", String(i + 1));

  return (
    <section ref={rootRef} id="drop" className={styles.section} aria-labelledby="merch-drop-title">
      {/* The mockup's own photograph, with its type and panels filled in —
          see data/merch.ts. */}
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

        {product && count > 0 && (
          <>
            {/* ---------------- Stage ---------------- */}
            <div className={styles.stage} role="group" aria-roledescription="carousel" aria-label={product.title}>
              {views.map((img, i) => (
                <div
                  key={img.url}
                  className={styles.view}
                  data-active={i === view || undefined}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${viewLabel(i)} of ${count}`}
                  aria-hidden={i !== view}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageAt(img.url, 900)}
                    srcSet={srcSet(img, [480, 720, 900, 1200, 1600])}
                    sizes="(min-width: 900px) 900px, 100vw"
                    width={img.width ?? undefined}
                    height={img.height ?? undefined}
                    alt={img.altText || `${product.title} — ${viewLabel(i).toLowerCase()}`}
                    decoding="async"
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                </div>
              ))}
            </div>

            {count > 0 && (
              <div className={styles.rings}>
                <button type="button" className={`${styles.ring} ${styles.ringL}`} aria-label={c.labels.prev} onClick={() => go(view - 1)} data-a>
                  <svg viewBox="0 0 11 23" aria-hidden="true">
                    <path d="M9.5 1.5 1.5 11.5l8 10" />
                  </svg>
                </button>
                <button type="button" className={`${styles.ring} ${styles.ringR}`} aria-label={c.labels.next} onClick={() => go(view + 1)} data-a>
                  <svg viewBox="0 0 11 23" aria-hidden="true">
                    <path d="m1.5 1.5 8 10-8 10" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}

        {product ? (
          <div className={styles.details}>
            {/* ---------------- Photos ---------------- */}
            {count > 0 && (
              <div className={styles.thumbs} role="tablist" aria-label={product.title}>
                {views.map((img, i) => (
                  <button
                    key={img.url}
                    type="button"
                    role="tab"
                    aria-selected={i === view}
                    aria-label={viewLabel(i)}
                    className={`${styles.thumb} ${i === view ? styles.thumbActive : ""}`}
                    onClick={() => setView(i)}
                    data-a
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageAt(img.url, 400)} width={194} height={181} alt="" decoding="async" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* ---------------- Details ---------------- */}
            <Buy product={product} />

            {count > 0 && (
              <div className={styles.dots}>
                {views.map((img, i) => (
                  <button
                    key={img.url}
                    type="button"
                    className={`${styles.dot} ${i === view ? styles.dotActive : ""}`}
                    aria-label={viewLabel(i)}
                    aria-current={i === view ? "true" : undefined}
                    onClick={() => setView(i)}
                    data-a
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.state} role={failure === "error" ? "alert" : failure === "loading" ? "status" : undefined}>
            <p className={`${styles.stateTitle} f-display`}>{state.title}</p>
            <p className={`${styles.stateBody} f-sans`}>{state.body}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default MerchDrop;
