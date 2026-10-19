/**
 * SHOPIFY — display helpers, for server and browser alike.
 */

import type { Money, ShopImage } from "./types";

/** "$35.00". A fixed locale, so the server's render and the browser's agree. */
export function formatMoney(m: Money): string {
  const n = Number(m.amount);
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: m.currencyCode }).format(n);
  } catch {
    return `${n.toFixed(2)} ${m.currencyCode}`;
  }
}

/** "$35.00", or "From $30.00" when the variants differ in price. */
export function formatPriceRange(min: Money, max: Money, from: string): string {
  if (Number(min.amount) === Number(max.amount)) return formatMoney(min);
  return from.replace("{price}", formatMoney(min));
}

/**
 * The image at a given width. Shopify's CDN resizes on the fly from a
 * `width` parameter; any other host's URL is returned as it is.
 */
export function imageAt(url: string, width: number): string {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("cdn.shopify.com") && !u.pathname.includes("/cdn/shop/")) return url;
    u.searchParams.set("width", String(width));
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * True for a Shopify cart checkout link: https, and a cart permalink
 * (/cart/c/<token>) or a checkout (/checkouts/...) — never a bare store
 * domain, which would land the visitor on the store's homepage with an
 * empty cart.
 */
export function isCheckoutUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && /^\/(cart\/c\/|checkouts?\/)/.test(u.pathname);
  } catch {
    return false;
  }
}

/** A srcset of the widths given, for a responsive <img>. */
export function srcSet(image: ShopImage, widths: number[]): string {
  const max = image.width ?? Infinity;
  const fit = widths.filter((w) => w <= max);
  return (fit.length ? fit : [widths[0]]).map((w) => `${imageAt(image.url, w)} ${w}w`).join(", ");
}
