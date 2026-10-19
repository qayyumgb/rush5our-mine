/**
 * SHOPIFY — choosing a variant (size, colour…) on the featured drop and the
 * product page.
 *
 * The visitor picks one value per option; the variant is the one whose
 * options all match. Each value is marked by what picking it would give,
 * with the other options as they stand: in stock, sold out, or a
 * combination the store doesn't make. The hook is for client components.
 */

import { useState } from "react";
import type { ShopProduct, ShopVariant } from "./types";

export type Selection = Record<string, string>;

export type ValueState = "available" | "soldout" | "missing";

function matches(v: ShopVariant, selection: Selection): boolean {
  return v.selectedOptions.every((o) => selection[o.name] === o.value);
}

function selectionOf(v: ShopVariant): Selection {
  return Object.fromEntries(v.selectedOptions.map((o) => [o.name, o.value]));
}

/** A product with one variant and Shopify's placeholder option ("Title" /
    "Default Title") has nothing to choose. */
export function hasChoices(product: ShopProduct): boolean {
  return !(product.variants.length <= 1 && product.options.every((o) => o.values.length <= 1));
}

export function valueState(product: ShopProduct, selection: Selection, name: string, value: string): ValueState {
  const next = { ...selection, [name]: value };
  const v = product.variants.find((x) => matches(x, next));
  if (!v) return "missing";
  return v.availableForSale ? "available" : "soldout";
}

export function useVariant(product: ShopProduct) {
  // Opens on the first variant in stock, or the first of all.
  const [selection, setSelection] = useState<Selection>(() => {
    const first = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
    return first ? selectionOf(first) : {};
  });

  const variant = product.variants.find((v) => matches(v, selection)) ?? null;

  /** Picks a value. If the store doesn't make that combination, moves the
      other options to a variant that has it — in stock if there is one. */
  const choose = (name: string, value: string) => {
    const next = { ...selection, [name]: value };
    if (product.variants.some((v) => matches(v, next))) {
      setSelection(next);
      return;
    }
    const withValue = product.variants.filter((v) => v.selectedOptions.some((o) => o.name === name && o.value === value));
    const pick = withValue.find((v) => v.availableForSale) ?? withValue[0];
    setSelection(pick ? selectionOf(pick) : next);
  };

  return { selection, variant, choose };
}
