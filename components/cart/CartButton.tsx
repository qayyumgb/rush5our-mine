"use client";

/**
 * CART BUTTON — in the nav, beside the burger: the cart icon with a red
 * count, opening the drawer. Not shown when the store isn't configured.
 */

import Icon from "@/components/ui/Icon";
import { shop } from "@/data/shop";
import { useCart } from "./CartProvider";
import styles from "./CartButton.module.css";

export function CartButton({ className }: { className?: string }) {
  const ctx = useCart();
  if (!ctx?.enabled) return null;

  const count = ctx.cart?.totalQuantity ?? 0;
  const c = shop.cart;
  const label = count > 0 ? `${c.open}, ${(count === 1 ? c.count.one : c.count.other).replace("{n}", String(count))}` : c.open;

  return (
    <button
      type="button"
      className={[styles.button, className].filter(Boolean).join(" ")}
      aria-label={label}
      aria-haspopup="dialog"
      aria-expanded={ctx.isOpen}
      onClick={ctx.openCart}
      data-a
    >
      <Icon name="cart" className={styles.icon} />
      {count > 0 && (
        <span className={`${styles.badge} f-cond`} aria-hidden="true">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

export default CartButton;
