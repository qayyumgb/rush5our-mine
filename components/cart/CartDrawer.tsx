"use client";

/**
 * CART DRAWER — slides in from the right over any page.
 *
 *   • the lines: photo, name (to its product page), options, price, a −/+
 *     quantity stepper and "remove"; the line's total beside it
 *   • the subtotal, live from Shopify after every change, and the checkout
 *     button — to Shopify's own hosted checkout for this cart, by the
 *     cart's `checkoutUrl` (see `checkout()` in CartProvider.tsx). No
 *     payment is taken or handled here.
 *   • states: loading the stored cart, empty, an error (with a retry when
 *     the cart couldn't be read), and Shopify's notices (a quantity it
 *     lowered to the stock, say)
 *
 * A modal dialog: the page behind is locked and inert to the pointer,
 * focus moves in and is kept inside, Escape or the backdrop closes it and
 * focus goes back to where it was. Stays mounted so it can slide; `inert`
 * hides it while closed.
 */

import { useEffect, useRef } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { formatMoney, imageAt } from "@/lib/shopify/format";
import type { CartLine } from "@/lib/shopify/types";
import { shop } from "@/data/shop";
import { useCart } from "./CartProvider";
import styles from "./CartDrawer.module.css";

const MAX_QUANTITY = 20;

function optionsText(line: CartLine): string {
  return line.merchandise.selectedOptions
    .filter((o) => o.value !== "Default Title")
    .map((o) => o.value)
    .join(" / ");
}

function Line({ line }: { line: CartLine }) {
  const ctx = useCart()!;
  const c = shop.cart;
  const busy = ctx.pending === line.id;
  const m = line.merchandise;
  const href = `/merch/${m.product.handle}`;
  const options = optionsText(line);

  return (
    <li className={`${styles.line} ${busy ? styles.lineBusy : ""}`} aria-busy={busy || undefined}>
      <a className={styles.thumb} href={href} tabIndex={-1} aria-hidden="true">
        {m.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageAt(m.image.url, 200)} alt="" width={76} height={76} loading="lazy" decoding="async" />
        )}
      </a>

      <div className={styles.info}>
        <a className={`${styles.name} f-cond caps`} href={href}>
          {m.product.title}
        </a>
        {options && <p className={`${styles.meta} f-sans`}>{options}</p>}
        <p className={`${styles.meta} f-sans`}>{formatMoney(m.price)}</p>
        {!m.availableForSale && <p className={`${styles.warn} f-sans`}>{c.unavailable}</p>}

        <div className={styles.controls}>
          <div className={styles.stepper} role="group" aria-label={`${shop.buy.quantity}, ${m.product.title}`}>
            <button
              type="button"
              aria-label={shop.buy.decrease}
              onClick={() => ctx.setQuantity(line.id, line.quantity - 1)}
              disabled={busy}
            >
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2 6h8" />
              </svg>
            </button>
            <span className="f-cond" aria-live="polite">
              {line.quantity}
            </span>
            <button
              type="button"
              aria-label={shop.buy.increase}
              onClick={() => ctx.setQuantity(line.id, line.quantity + 1)}
              disabled={busy || line.quantity >= MAX_QUANTITY}
            >
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2 6h8M6 2v8" />
              </svg>
            </button>
          </div>
          <button type="button" className={`${styles.remove} f-sans`} onClick={() => ctx.remove(line.id)} disabled={busy}>
            {c.remove}
            <span className="sr-only"> {m.product.title}</span>
          </button>
        </div>
      </div>

      <p className={`${styles.total} f-cond`}>{formatMoney(line.total)}</p>
    </li>
  );
}

export function CartDrawer() {
  const ctx = useCart()!;
  const { lockScroll, unlockScroll } = useMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const { isOpen, closeCart, cart, status, error, notice, pending } = ctx;
  const c = shop.cart;
  const lines = cart?.lines ?? [];
  const count = cart?.totalQuantity ?? 0;

  /* --- open: lock the page, move focus in; close: give it back ----------- */
  useEffect(() => {
    if (!isOpen) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    lockScroll();
    const t = window.setTimeout(() => closeRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(t);
      unlockScroll();
      lastFocus.current?.focus?.();
    };
  }, [isOpen, lockScroll, unlockScroll]);

  /* --- Escape closes; Tab stays inside --------------------------------- */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeCart();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = [
        ...panel.querySelectorAll<HTMLElement>('a[href]:not([tabindex="-1"]), button:not([disabled])'),
      ].filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  const countText = (count === 1 ? c.count.one : c.count.other).replace("{n}", String(count));
  const busy = pending !== null;
  const leaving = pending === "checkout";

  return (
    <div className={`${styles.root} ${isOpen ? styles.open : ""}`} inert={!isOpen}>
      <div className={styles.backdrop} onClick={closeCart} aria-hidden="true" />

      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <span className={styles.glow} aria-hidden="true" />

        <header className={styles.head}>
          <h2 id="cart-title" className={`${styles.title} f-display`}>
            {c.title}
          </h2>
          {count > 0 && <span className={`${styles.count} f-cond caps`}>{countText}</span>}
          <button ref={closeRef} type="button" className={styles.close} aria-label={c.close} onClick={closeCart}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M4 4l12 12M16 4 4 16" />
            </svg>
          </button>
        </header>

        <div className={styles.body} data-lenis-prevent>
          {(error || notice) && (
            <div className={`${styles.message} ${error ? styles.messageError : ""} f-sans`} role={error ? "alert" : "status"}>
              <p>{error ?? notice}</p>
              {error && status === "ready" && !cart && (
                <button type="button" className={`${styles.retry} f-cond caps`} onClick={ctx.retry}>
                  {c.retry}
                </button>
              )}
            </div>
          )}

          {status === "loading" && !cart ? (
            <p className={`${styles.loading} f-sans`} role="status">
              <span className={styles.spinner} aria-hidden="true" />
              {c.loading}
            </p>
          ) : lines.length === 0 ? (
            !error && (
              <div className={styles.empty}>
                <p className={`${styles.emptyTitle} f-display`}>{c.empty.title}</p>
                <p className="f-sans">{c.empty.body}</p>
                <a className={`${styles.emptyCta} f-cond caps`} href={c.empty.cta.href} onClick={closeCart}>
                  {c.empty.cta.label}
                </a>
              </div>
            )
          ) : (
            <ul className={styles.lines} aria-label={c.title}>
              {lines.map((line) => (
                <Line key={line.id} line={line} />
              ))}
            </ul>
          )}
        </div>

        {cart && lines.length > 0 && (
          <footer className={styles.foot}>
            <p className={styles.subtotal}>
              <span className="f-cond caps">{c.subtotal}</span>
              <strong className="f-display" aria-live="polite">
                {formatMoney(cart.subtotal)}
              </strong>
            </p>
            <p className={`${styles.note} f-sans`}>{c.note}</p>
            <a
              className={`${styles.checkout} f-cond caps`}
              // The cart's own checkout link, for a new tab or no JavaScript.
              href={cart.checkoutUrl}
              aria-disabled={busy || undefined}
              aria-busy={leaving || undefined}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                // Otherwise: wait for any change in flight, re-read the cart
                // for its latest link, then go.
                e.preventDefault();
                if (!busy) ctx.checkout();
              }}
            >
              {leaving ? c.checkingOut : c.checkout}
              <svg viewBox="0 0 32 20" aria-hidden="true">
                <path d="M1 10h29M21 1.5l9 8.5-9 8.5" />
              </svg>
            </a>
          </footer>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
