"use client";

/**
 * PRODUCT OPTIONS — one group per Shopify option (Size, Color…), each value
 * a box as the mockup draws the sizes.
 *
 * Native radios under the boxes, so the arrow keys, a screen reader's
 * "1 of 5" and the form semantics come for free. A value that's sold out
 * with the other options as chosen is struck through but still selectable,
 * so the visitor can see it's sold out rather than wonder why it won't
 * pick; a combination the store doesn't make is dimmed.
 *
 * Sized by CSS variables with px defaults (ProductOptions.module.css); the
 * featured drop sets them in its own mockup units.
 */

import { hasChoices, valueState, type Selection } from "@/lib/shopify/variants";
import type { ShopProduct } from "@/lib/shopify/types";
import { shop } from "@/data/shop";
import styles from "./ProductOptions.module.css";

interface ProductOptionsProps {
  product: ShopProduct;
  selection: Selection;
  choose: (name: string, value: string) => void;
  /** Keeps radio names unique when two pickers share a page. */
  idPrefix: string;
  className?: string;
  /** Shown when the product has nothing to choose (one variant): a single
      chosen box, e.g. Size: One size. Without it, nothing is shown. */
  single?: { name: string; value: string };
}

export function ProductOptions({ product, selection, choose, idPrefix, className, single }: ProductOptionsProps) {
  if (!hasChoices(product)) {
    if (!single) return null;
    return (
      <div className={[styles.groups, className].filter(Boolean).join(" ")}>
        <fieldset className={styles.group}>
          <legend className={`${styles.legend} f-sans caps`}>{single.name}</legend>
          <div className={styles.values}>
            <label className={styles.value} data-state={product.availableForSale ? "available" : "soldout"}>
              <input className={styles.input} type="radio" name={`${idPrefix}-single`} checked readOnly />
              <span className={`${styles.box} f-sans`}>{single.value}</span>
            </label>
          </div>
        </fieldset>
      </div>
    );
  }

  return (
    <div className={[styles.groups, className].filter(Boolean).join(" ")}>
      {product.options.map((option) => (
        <fieldset key={option.name} className={styles.group}>
          <legend className={`${styles.legend} f-sans caps`}>
            {option.name}
            {selection[option.name] && <span className="sr-only">: {selection[option.name]}</span>}
          </legend>
          <div className={styles.values}>
            {option.values.map((value) => {
              const state = valueState(product, selection, option.name, value);
              const id = `${idPrefix}-${option.name}-${value}`.replace(/\s+/g, "-");
              return (
                <label key={value} className={styles.value} data-state={state} htmlFor={id}>
                  <input
                    id={id}
                    className={styles.input}
                    type="radio"
                    name={`${idPrefix}-${option.name}`}
                    value={value}
                    checked={selection[option.name] === value}
                    onChange={() => choose(option.name, value)}
                  />
                  <span className={`${styles.box} f-sans`}>
                    {value}
                    {state === "soldout" && <span className="sr-only">, {shop.buy.soldOutSuffix}</span>}
                    {state === "missing" && <span className="sr-only">, {shop.buy.unavailable.toLowerCase()}</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export default ProductOptions;
