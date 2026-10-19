/**
 * STORE COPY — the words around the Shopify store: the cart drawer, the
 * product page and the merch grid's states. Products themselves (names,
 * prices, photos, sizes, stock) come only from Shopify; nothing here
 * describes one.
 */

export interface StateCopy {
  title: string;
  body: string;
}

export interface ShopCopy {
  /** "{price}" is replaced: "From $30.00". */
  from: string;
  soldOut: string;
  /** The store's env vars aren't set. */
  unconfigured: StateCopy;
  /** Shopify couldn't be reached or refused. */
  error: StateCopy;
  /** The store has no products yet. */
  empty: StateCopy;
  /** While the store is being fetched. */
  loading: StateCopy;
  buy: {
    addToCart: string;
    adding: string;
    soldOut: string;
    /** A combination the store doesn't make. */
    unavailable: string;
    quantity: string;
    decrease: string;
    increase: string;
    /** After the option values that are sold out. */
    soldOutSuffix: string;
    added: string;
  };
  product: {
    back: { label: string; href: string };
    description: string;
    note: string;
    /** "{n} of {total}" for the gallery's slides. */
    slide: string;
    notFound: StateCopy & { cta: { label: string; href: string } };
  };
  cart: {
    title: string;
    open: string;
    close: string;
    /** "{n}" is replaced. */
    count: { one: string; other: string };
    empty: StateCopy & { cta: { label: string; href: string } };
    loading: string;
    subtotal: string;
    note: string;
    checkout: string;
    /** While the latest cart is fetched before leaving for Shopify. */
    checkingOut: string;
    /** Shopify no longer has the cart (expired, or already paid for). */
    checkoutGone: string;
    /** The cart came back without a usable checkout link. */
    checkoutError: string;
    remove: string;
    unavailable: string;
    error: string;
    retry: string;
  };
}

export const shop: ShopCopy = {
  from: "From {price}",
  soldOut: "Sold out",
  unconfigured: {
    title: "The store opens soon",
    body: "The drop is being stocked. Follow @rush5our to hear the moment it’s live.",
  },
  error: {
    title: "The store didn’t load",
    body: "We couldn’t reach the store just now. Refresh the page to try again.",
  },
  empty: {
    title: "Nothing in the store yet",
    body: "The first drop is on its way. Follow @rush5our to hear first.",
  },
  loading: {
    title: "Loading the drop",
    body: "One moment.",
  },
  buy: {
    addToCart: "Add to cart",
    adding: "Adding…",
    soldOut: "Sold out",
    unavailable: "Unavailable",
    quantity: "Quantity",
    decrease: "One fewer",
    increase: "One more",
    soldOutSuffix: "sold out",
    added: "Added to your cart.",
  },
  product: {
    back: { label: "All merch", href: "/merch#shop" },
    description: "Details",
    note: "Secure checkout by Shopify. Shipping and taxes are worked out at checkout.",
    slide: "{n} of {total}",
    notFound: {
      title: "This piece isn’t in the store",
      body: "It may have sold out for good, or moved. The rest of the drop is still here.",
      cta: { label: "Back to merch", href: "/merch#shop" },
    },
  },
  cart: {
    title: "Your cart",
    open: "Open cart",
    close: "Close cart",
    count: { one: "{n} item", other: "{n} items" },
    empty: {
      title: "Your cart is empty",
      body: "Every piece represents the culture. Find yours.",
      cta: { label: "Shop the drop", href: "/merch#shop" },
    },
    loading: "Loading your cart…",
    subtotal: "Subtotal",
    note: "Shipping and taxes calculated at checkout.",
    checkout: "Checkout",
    checkingOut: "Opening checkout…",
    checkoutGone: "This cart has expired. Add your pieces again to check out.",
    checkoutError: "Checkout couldn’t be opened just now. Please try again.",
    remove: "Remove",
    unavailable: "No longer available",
    error: "The cart couldn’t be updated just now. Please try again.",
    retry: "Try again",
  },
};
