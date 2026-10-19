"use client";

/**
 * CART — the Shopify cart, for every page.
 *
 * The cart itself lives at Shopify; this keeps only its id, in
 * localStorage, so it survives a refresh, a new tab or a return visit. On
 * load the id is read back and the cart fetched through /api/cart (the
 * route holds the Storefront token — the browser never sees it). If
 * Shopify no longer has the cart (checked out, or expired), the id is
 * dropped and the next "add to cart" starts a new one.
 *
 * Changes are made one at a time, in order, so quick taps on + and −
 * can't overtake each other. The drawer (CartDrawer.tsx) renders here, once.
 *
 * CHECKOUT goes to the cart's own `checkoutUrl`, as the Storefront API
 * returns it (Shopify's cart permalink, /cart/c/<token>?key=…), never the
 * store's domain: only that link carries this cart's lines into Shopify's
 * checkout. `checkout()` waits for any change still in flight, fetches the
 * cart once more for its latest link, checks it has items and that the
 * link is a cart link, and only then leaves the site.
 *
 * `enabled` is false when the store isn't configured: there is then no
 * cart, no drawer and no cart button.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { isCheckoutUrl } from "@/lib/shopify/format";
import type { CartResponse, ShopCart } from "@/lib/shopify/types";
import { shop } from "@/data/shop";
import CartDrawer from "./CartDrawer";

const STORAGE_KEY = "rush5our.cartId";

function readId(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeId(id: string | null) {
  try {
    if (id) window.localStorage.setItem(STORAGE_KEY, id);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode or blocked storage: the cart lasts as long as the page.
  }
}

async function request(method: "GET" | "POST" | "PATCH" | "DELETE", body?: object, id?: string): Promise<CartResponse> {
  try {
    const res = await fetch(id ? `/api/cart?id=${encodeURIComponent(id)}` : "/api/cart", {
      method,
      cache: "no-store",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    return (await res.json()) as CartResponse;
  } catch {
    return { ok: false, error: shop.cart.error };
  }
}

export interface CartContextValue {
  enabled: boolean;
  cart: ShopCart | null;
  /** "loading" until a stored cart has been fetched. */
  status: "loading" | "ready";
  /** The line being changed, "add" while adding, "checkout" while leaving
      for Shopify's checkout. */
  pending: string | null;
  error: string | null;
  notice: string | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  /** Adds a variant and opens the drawer; resolves to null, or to why it
      failed. */
  add: (merchandiseId: string, quantity: number) => Promise<string | null>;
  setQuantity: (lineId: string, quantity: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
  /** Sends the visitor to this cart's Shopify checkout. */
  checkout: () => Promise<void>;
  retry: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue | null {
  return useContext(CartContext);
}

export function CartProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const [cart, setCart] = useState<ShopCart | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isOpen, setOpen] = useState(false);

  const cartRef = useRef<ShopCart | null>(null);
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const apply = useCallback((next: ShopCart | null) => {
    cartRef.current = next;
    setCart(next);
    writeId(next?.id ?? null);
  }, []);

  /* --- load the stored cart ---------------------------------------------- */
  const load = useCallback(async () => {
    const id = readId();
    if (!id) {
      apply(null);
      setStatus("ready");
      return;
    }
    setStatus("loading");
    const res = await request("GET", undefined, id);
    if (res.ok) {
      apply(res.cart);
      setError(null);
    } else {
      // Keep the id: the cart is probably fine and Shopify just didn't answer.
      setError(res.error);
    }
    setStatus("ready");
  }, [apply]);

  useEffect(() => {
    if (!enabled) return;
    const first = window.setTimeout(load, 0);
    // Another tab changed the cart.
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) load();
    };
    // Back from Shopify's checkout via the back button: the page may be
    // restored from memory, holding a cart that has since been paid for.
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      setPending(null);
      load();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("pageshow", onShow);
    return () => {
      window.clearTimeout(first);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pageshow", onShow);
    };
  }, [enabled, load]);

  /* --- changes, one at a time ---------------------------------------------- */
  const run = useCallback(<T,>(task: () => Promise<T>): Promise<T> => {
    const next = queue.current.then(task, task);
    queue.current = next.catch(() => undefined);
    return next;
  }, []);

  const mutate = useCallback(
    async (key: string, method: "POST" | "PATCH" | "DELETE", body: object): Promise<string | null> => {
      setPending(key);
      setError(null);
      setNotice(null);
      const res = await request(method, body);
      setPending(null);
      if (!res.ok) {
        setError(res.error);
        return res.error;
      }
      apply(res.cart);
      if (res.notice) setNotice(res.notice);
      return null;
    },
    [apply],
  );

  const add = useCallback(
    (merchandiseId: string, quantity: number) =>
      run(async () => {
        const failed = await mutate("add", "POST", { cartId: cartRef.current?.id ?? readId(), merchandiseId, quantity });
        if (!failed) setOpen(true);
        return failed;
      }),
    [run, mutate],
  );

  const setQuantity = useCallback(
    (lineId: string, quantity: number) =>
      run(async () => {
        const id = cartRef.current?.id;
        if (id) await mutate(lineId, "PATCH", { cartId: id, lineId, quantity });
      }),
    [run, mutate],
  );

  const remove = useCallback(
    (lineId: string) =>
      run(async () => {
        const id = cartRef.current?.id;
        if (id) await mutate(lineId, "DELETE", { cartId: id, lineId });
      }),
    [run, mutate],
  );

  const checkout = useCallback(
    () =>
      run(async () => {
        const id = cartRef.current?.id ?? readId();
        if (!id) return;
        setPending("checkout");
        setError(null);
        setNotice(null);
        const res = await request("GET", undefined, id);
        if (!res.ok) {
          setPending(null);
          setError(res.error);
          return;
        }
        apply(res.cart);
        if (!res.cart || res.cart.totalQuantity === 0) {
          setPending(null);
          setError(shop.cart.checkoutGone);
          return;
        }
        if (!isCheckoutUrl(res.cart.checkoutUrl)) {
          console.error("[cart] Shopify returned no usable checkoutUrl:", res.cart.checkoutUrl);
          setPending(null);
          setError(shop.cart.checkoutError);
          return;
        }
        // Left "pending" on purpose: the button stays busy until the page goes.
        window.location.assign(res.cart.checkoutUrl);
      }),
    [run, apply],
  );

  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);
  const retry = useCallback(() => {
    setError(null);
    load();
  }, [load]);

  const value = useMemo<CartContextValue>(
    () => ({ enabled, cart, status, pending, error, notice, isOpen, openCart, closeCart, add, setQuantity, remove, checkout, retry }),
    [enabled, cart, status, pending, error, notice, isOpen, openCart, closeCart, add, setQuantity, remove, checkout, retry],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {enabled && <CartDrawer />}
    </CartContext.Provider>
  );
}

export default CartProvider;
