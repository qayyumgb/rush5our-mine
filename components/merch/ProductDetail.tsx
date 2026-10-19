"use client";

/**
 * PRODUCT PAGE — /merch/[handle] (no mockup; Phase 2, 2B).
 *
 *   • the gallery: every photo, one at a time — swiped on a phone (native
 *     scroll-snap), picked from the thumbnails or the arrows elsewhere.
 *     Choosing a colour whose variant has its own photo turns to it.
 *   • the name, the price (struck-through compare-at price when on sale),
 *     the options (ProductOptions.tsx), the quantity, "add to cart" and the
 *     store's description
 *   • sold out: the product, or the chosen option — the button says so and
 *     can't be pressed
 *
 * Side by side from 900px, the details sticking beside the photos; stacked
 * on a phone. Set in the site's faces and red; sized in px and clamp(),
 * as a page of the store rather than a mockup composition.
 *
 * DATA: one Shopify product, fetched on the server (app/merch/[handle]/
 * page.tsx) and passed in.
 */

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import RedButton from "@/components/ui/RedButton";
import { MAX_QUANTITY, useAddToCart } from "@/components/cart/useAddToCart";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney, imageAt, srcSet } from "@/lib/shopify/format";
import { hasChoices } from "@/lib/shopify/variants";
import type { ShopProduct } from "@/lib/shopify/types";
import { merchDrop } from "@/data/merch";
import { shop } from "@/data/shop";
import ProductOptions from "./ProductOptions";
import styles from "./ProductDetail.module.css";

const WIDTHS = [480, 720, 960, 1280, 1600];

function Gallery({ product, focusUrl }: { product: ShopProduct; focusUrl: string | null }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const images = product.images;
  const count = images.length;
  const labels = merchDrop.labels;

  const show = (i: number, smooth = true) => {
    const track = trackRef.current;
    if (!track) return;
    const n = (i + count) % count;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: n * track.clientWidth, behavior: smooth && !reduced ? "smooth" : "auto" });
  };

  // Which slide is in view, as the visitor swipes.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActive(Math.round(track.scrollLeft / Math.max(1, track.clientWidth))));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  // A variant with its own photo (a colour, usually) turns the gallery to it.
  useEffect(() => {
    if (!focusUrl) return;
    const i = images.findIndex((img) => img.url === focusUrl);
    if (i >= 0) show(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusUrl]);

  if (count === 0) return <div className={styles.media} aria-hidden="true" />;

  // The frame takes the first photo's shape, between square and 4:5, so a
  // square shot isn't letterboxed.
  const first = images[0];
  const ratio = first.width && first.height ? Math.min(1, Math.max(0.8, first.width / first.height)) : 0.8;

  return (
    <div className={styles.gallery}>
      <div className={styles.stageWrap}>
        <div
          ref={trackRef}
          className={styles.track}
          style={{ "--ar": ratio } as React.CSSProperties}
          role="group"
          aria-roledescription="carousel"
          aria-label={product.title}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") show(active + 1);
            if (e.key === "ArrowLeft") show(active - 1);
          }}
        >
          {images.map((img, i) => (
            <div
              key={img.url}
              className={styles.slide}
              role="group"
              aria-roledescription="slide"
              aria-label={shop.product.slide.replace("{n}", String(i + 1)).replace("{total}", String(count))}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageAt(img.url, 960)}
                srcSet={srcSet(img, WIDTHS)}
                sizes="(min-width: 900px) 600px, 100vw"
                width={img.width ?? undefined}
                height={img.height ?? undefined}
                alt={img.altText || `${product.title} — ${labels.view.replace("{n}", String(i + 1)).toLowerCase()}`}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : undefined}
                decoding="async"
              />
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <button type="button" className={`${styles.arrow} ${styles.arrowL}`} aria-label={labels.prev} onClick={() => show(active - 1)}>
              <svg viewBox="0 0 11 23" aria-hidden="true">
                <path d="M9.5 1.5 1.5 11.5l8 10" />
              </svg>
            </button>
            <button type="button" className={`${styles.arrow} ${styles.arrowR}`} aria-label={labels.next} onClick={() => show(active + 1)}>
              <svg viewBox="0 0 11 23" aria-hidden="true">
                <path d="m1.5 1.5 8 10-8 10" />
              </svg>
            </button>
            <p className={`${styles.counter} f-cond`} aria-hidden="true">
              {active + 1} / {count}
            </p>
          </>
        )}
      </div>

      {count > 1 && (
        <div className={styles.thumbs} role="tablist" aria-label={product.title}>
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={labels.view.replace("{n}", String(i + 1))}
              className={`${styles.thumb} ${i === active ? styles.thumbActive : ""}`}
              onClick={() => show(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageAt(img.url, 240)} alt="" width={96} height={120} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductDetail({ product }: { product: ShopProduct }) {
  const cart = useCart();
  const buy = useAddToCart(product);
  const b = shop.buy;
  const paragraphs = product.description
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const onSale = buy.compareAt && Number(buy.compareAt.amount) > Number(buy.price.amount);

  return (
    <article className={styles.product}>
      <a className={`${styles.back} f-cond caps`} href={shop.product.back.href}>
        <svg viewBox="0 0 20 14" aria-hidden="true">
          <path d="M19 7H2M8 1.5 2 7l6 5.5" />
        </svg>
        {shop.product.back.label}
      </a>

      <div className={styles.layout}>
        <Gallery product={product} focusUrl={buy.variant?.image?.url ?? null} />

        <div className={styles.info}>
          {product.productType && <p className={`${styles.eyebrow} f-sans caps`}>{product.productType}</p>}
          <h1 className={`${styles.title} f-display`}>{product.title}</h1>

          <p className={styles.priceRow}>
            <span className={`${styles.price} f-display`}>{formatMoney(buy.price)}</span>
            {onSale && <s className={`${styles.compare} f-sans`}>{formatMoney(buy.compareAt!)}</s>}
            {buy.soldOut && <span className={`${styles.badge} f-cond caps`}>{shop.soldOut}</span>}
          </p>

          {hasChoices(product) && (
            <ProductOptions
              product={product}
              selection={buy.selection}
              choose={buy.choose}
              idPrefix="product"
              className={styles.options}
            />
          )}

          <div className={styles.qtyRow}>
            <span id="qty-label" className={`${styles.label} f-sans caps`}>
              {b.quantity}
            </span>
            <div className={styles.stepper} role="group" aria-labelledby="qty-label">
              <button
                type="button"
                aria-label={b.decrease}
                onClick={() => buy.setQuantity(buy.quantity - 1)}
                disabled={buy.quantity <= 1}
              >
                <svg viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2 6h8" />
                </svg>
              </button>
              <output className="f-cond" aria-live="polite">
                {buy.quantity}
              </output>
              <button
                type="button"
                aria-label={b.increase}
                onClick={() => buy.setQuantity(buy.quantity + 1)}
                disabled={buy.quantity >= MAX_QUANTITY}
              >
                <svg viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2 6h8M6 2v8" />
                </svg>
              </button>
            </div>
          </div>

          <div className={styles.buy}>
            <RedButton
              label={buy.label}
              onClick={buy.submit}
              disabled={!cart?.enabled || buy.soldOut || buy.unavailable}
              className={`${styles.btn} ${buy.adding ? styles.btnBusy : ""}`}
              wrapperClassName={styles.btnMagnet}
              arrow="none"
              magnetStrength={0}
            >
              <Icon name="cart" className={styles.cart} />
            </RedButton>
          </div>
          <p className={`${styles.error} f-sans`} role="alert">
            {buy.error}
          </p>

          <p className={`${styles.note} f-sans`}>
            <svg viewBox="0 0 14 16" aria-hidden="true">
              <rect x="1.5" y="7" width="11" height="8" rx="1.5" />
              <path d="M4 7V4.8a3 3 0 0 1 6 0V7" />
            </svg>
            {shop.product.note}
          </p>

          {paragraphs.length > 0 && (
            <section className={styles.desc} aria-labelledby="product-desc">
              <h2 id="product-desc" className={`${styles.descTitle} f-sans caps`}>
                {shop.product.description}
              </h2>
              {paragraphs.map((p, i) => (
                <p key={i} className="f-sans">
                  {p}
                </p>
              ))}
            </section>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductDetail;
