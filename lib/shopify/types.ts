/**
 * SHOPIFY — the store's data as the site uses it.
 *
 * The Storefront API's own shapes (edges, nodes, nested connections) are
 * flattened into these by lib/shopify/products.ts and lib/shopify/cart.ts,
 * so components never see GraphQL. Types only: safe to import anywhere,
 * server or browser.
 */

export interface Money {
  /** A decimal string, as Shopify sends it: "35.0". */
  amount: string;
  currencyCode: string;
}

export interface ShopImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface ShopOption {
  name: string;
  values: string[];
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ShopVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  price: Money;
  compareAtPrice: Money | null;
  image: ShopImage | null;
}

/** A product as the grid shows it. */
export interface ShopProductCard {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  minPrice: Money;
  maxPrice: Money;
  /** The first two images: the card shows the second on hover. */
  images: ShopImage[];
}

/** A product with everything the detail page and the featured drop need. */
export interface ShopProduct extends ShopProductCard {
  /** Plain text: the store's description with its formatting stripped. */
  description: string;
  productType: string;
  options: ShopOption[];
  variants: ShopVariant[];
  seo: { title: string | null; description: string | null };
}

export interface CartLine {
  id: string;
  quantity: number;
  /** Price x quantity, after any line discounts. */
  total: Money;
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    selectedOptions: SelectedOption[];
    price: Money;
    image: ShopImage | null;
    product: { handle: string; title: string };
  };
}

export interface ShopCart {
  id: string;
  /** Shopify's hosted checkout for this cart. */
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: Money;
  lines: CartLine[];
}

/** Why a store read came back empty-handed. */
export type ShopFailure = "unconfigured" | "error";

export type ShopResult<T> = { ok: true; data: T } | { ok: false; reason: ShopFailure };

/* --- the cart route's responses (app/api/cart) ---------------------------- */

export type CartResponse =
  | {
      ok: true;
      /** null: no cart (never made, expired, or already checked out). */
      cart: ShopCart | null;
      /** Something Shopify adjusted, e.g. a quantity lowered to the stock. */
      notice?: string;
    }
  | { ok: false; error: string };
