/**
 * SHOPIFY — product reads. Server-only; called from server components.
 *
 * Everything the store shows comes from here — there are no products in
 * the codebase. Each read returns a ShopResult, never throws, so a page can
 * render "not configured" or "couldn't load" in place instead of failing.
 *
 * WHAT SHOWS WHERE (all managed in the Shopify admin):
 *   • the grid      every product published to the storefront's sales
 *                   channel, newest first
 *   • the featured  the first product in a collection with the handle
 *     drop          "featured" (Products → Collections → create "Featured");
 *                   without one, the newest product that's in stock
 */

import "server-only";
import { ShopifyError, shopifyFetch } from "./client";
import type { ShopImage, ShopProduct, ShopProductCard, ShopResult } from "./types";

const FEATURED_COLLECTION = "featured";

/* --- GraphQL -------------------------------------------------------------- */

const IMAGE = /* GraphQL */ `
  fragment Img on Image {
    url
    altText
    width
    height
  }
`;

const CARD = /* GraphQL */ `
  fragment Card on Product {
    id
    handle
    title
    availableForSale
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    images(first: 2) { nodes { ...Img } }
  }
`;

const FULL = /* GraphQL */ `
  fragment Full on Product {
    ...Card
    description
    productType
    seo { title description }
    # Aliased: Card already asks for the first two as "images".
    gallery: images(first: 20) { nodes { ...Img } }
    options { name optionValues { name } }
    variants(first: 100) {
      nodes {
        id
        title
        availableForSale
        selectedOptions { name value }
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        image { ...Img }
      }
    }
  }
`;

const PRODUCTS_QUERY = /* GraphQL */ `
  query Products {
    products(first: 60, sortKey: CREATED_AT, reverse: true) {
      nodes { ...Card }
    }
  }
  ${CARD}
  ${IMAGE}
`;

const PRODUCT_QUERY = /* GraphQL */ `
  query Product($handle: String!) {
    product(handle: $handle) { ...Full }
  }
  ${FULL}
  ${CARD}
  ${IMAGE}
`;

const FEATURED_QUERY = /* GraphQL */ `
  query Featured($collection: String!) {
    collection(handle: $collection) {
      products(first: 1) { nodes { handle } }
    }
  }
`;

/* --- raw shapes ------------------------------------------------------------ */

type Nodes<T> = { nodes: T[] };

interface RawCard {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  priceRange: { minVariantPrice: ShopProductCard["minPrice"]; maxVariantPrice: ShopProductCard["maxPrice"] };
  images: Nodes<ShopImage>;
}

interface RawFull extends RawCard {
  description: string;
  productType: string;
  seo: { title: string | null; description: string | null };
  gallery: Nodes<ShopImage>;
  options: { name: string; optionValues: { name: string }[] }[];
  variants: Nodes<ShopProduct["variants"][number]>;
}

function toCard(p: RawCard): ShopProductCard {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    availableForSale: p.availableForSale,
    minPrice: p.priceRange.minVariantPrice,
    maxPrice: p.priceRange.maxVariantPrice,
    images: p.images.nodes.slice(0, 2),
  };
}

function toProduct(p: RawFull): ShopProduct {
  return {
    ...toCard(p),
    images: p.gallery.nodes,
    description: p.description,
    productType: p.productType,
    seo: p.seo,
    options: p.options.map((o) => ({ name: o.name, values: o.optionValues.map((v) => v.name) })),
    variants: p.variants.nodes,
  };
}

function fail(error: unknown): { ok: false; reason: "unconfigured" | "error" } {
  return { ok: false, reason: error instanceof ShopifyError ? error.kind : "error" };
}

/* --- reads ------------------------------------------------------------------ */

export async function getProducts(): Promise<ShopResult<ShopProductCard[]>> {
  try {
    const data = await shopifyFetch<{ products: Nodes<RawCard> }>(PRODUCTS_QUERY, { cache: "products" });
    return { ok: true, data: data.products.nodes.map(toCard) };
  } catch (error) {
    return fail(error);
  }
}

/** One product by its handle; `data` is null when there's no such product. */
export async function getProduct(handle: string): Promise<ShopResult<ShopProduct | null>> {
  try {
    const data = await shopifyFetch<{ product: RawFull | null }>(PRODUCT_QUERY, {
      variables: { handle },
      cache: "products",
    });
    return { ok: true, data: data.product ? toProduct(data.product) : null };
  } catch (error) {
    return fail(error);
  }
}

/**
 * The featured drop: the first product of the "featured" collection, else
 * the newest in-stock product of `products`, else the newest of all. Null
 * when the store has no products.
 */
export async function getFeaturedProduct(products: ShopProductCard[]): Promise<ShopResult<ShopProduct | null>> {
  let handle: string | undefined;
  try {
    const data = await shopifyFetch<{ collection: { products: Nodes<{ handle: string }> } | null }>(FEATURED_QUERY, {
      variables: { collection: FEATURED_COLLECTION },
      cache: "products",
    });
    handle = data.collection?.products.nodes[0]?.handle;
  } catch (error) {
    return fail(error);
  }
  handle ??= (products.find((p) => p.availableForSale) ?? products[0])?.handle;
  if (!handle) return { ok: true, data: null };
  return getProduct(handle);
}
