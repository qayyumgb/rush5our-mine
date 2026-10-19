/**
 * ADD TO CART — what the featured drop and the product page share: the
 * chosen variant, the quantity, the button's state and its message.
 */

import { useState } from "react";
import { useVariant } from "@/lib/shopify/variants";
import type { ShopProduct } from "@/lib/shopify/types";
import { shop } from "@/data/shop";
import { useCart } from "./CartProvider";

export const MAX_QUANTITY = 10;

export function useAddToCart(product: ShopProduct) {
  const cart = useCart();
  const { selection, variant, choose } = useVariant(product);
  const [quantity, setQuantityState] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const soldOut = !product.availableForSale || (variant !== null && !variant.availableForSale);
  const unavailable = variant === null;
  const canAdd = !!cart?.enabled && !soldOut && !unavailable && !adding;

  const b = shop.buy;
  const label = adding ? b.adding : unavailable ? b.unavailable : soldOut ? b.soldOut : b.addToCart;

  const setQuantity = (n: number) => setQuantityState(Math.min(MAX_QUANTITY, Math.max(1, Math.round(n) || 1)));

  const submit = async () => {
    if (!cart || !variant || !canAdd) return;
    setAdding(true);
    setError(null);
    // On success the drawer opens and shows the cart.
    setError(await cart.add(variant.id, quantity));
    setAdding(false);
  };

  return {
    selection,
    variant,
    choose: (name: string, value: string) => {
      setError(null);
      choose(name, value);
    },
    quantity,
    setQuantity,
    adding,
    soldOut,
    unavailable,
    canAdd,
    label,
    submit,
    /** Why the last add failed, in the cart's (or Shopify's) words. */
    error,
    price: variant?.price ?? product.minPrice,
    compareAt: variant?.compareAtPrice ?? null,
  };
}
