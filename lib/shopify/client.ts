/**
 * SHOPIFY — the Storefront API client. Server-only.
 *
 * CONFIGURATION — environment variables, read on the server at request (or
 * build) time and never hardcoded. None has a NEXT_PUBLIC_ prefix, so none
 * reaches the browser:
 *   SHOPIFY_STORE_DOMAIN       the store's myshopify domain, e.g.
 *                              "rush5our.myshopify.com"
 *   SHOPIFY_STOREFRONT_TOKEN   a Storefront API access token (Shopify admin →
 *                              Settings → Apps → Develop apps, or the
 *                              Headless channel → Storefront API → public
 *                              access token)
 *   SHOPIFY_API_VERSION        optional; the Storefront API version, default
 *                              below. Shopify supports each for a year.
 *
 * Product reads are cached for a minute (see `revalidate`); cart calls are
 * never cached. Every failure is logged here, without the token, and thrown
 * as a ShopifyError for the caller to turn into an error state.
 */

import "server-only";

const DEFAULT_API_VERSION = "2026-07";

/** How long a product read is reused before Shopify is asked again. */
export const PRODUCT_REVALIDATE_SECONDS = 60;

const TIMEOUT_MS = 10_000;

export interface ShopifyConfig {
  endpoint: string;
  token: string;
}

/** The store's API endpoint and token, or null if either is missing. */
export function readShopifyConfig(): ShopifyConfig | null {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN?.trim();
  if (!domain || !token) return null;
  // Accept "store.myshopify.com", "https://store.myshopify.com" or with a
  // trailing slash; only the host is used.
  const host = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const version = process.env.SHOPIFY_API_VERSION?.trim() || DEFAULT_API_VERSION;
  return { endpoint: `https://${host}/api/${version}/graphql.json`, token };
}

export class ShopifyError extends Error {
  constructor(
    message: string,
    readonly kind: "unconfigured" | "error",
  ) {
    super(message);
    this.name = "ShopifyError";
  }
}

let warnedUnconfigured = false;

interface FetchOptions {
  variables?: Record<string, unknown>;
  /** Product reads are cached; cart reads and writes must not be. */
  cache: "products" | "none";
}

export async function shopifyFetch<T>(query: string, { variables, cache }: FetchOptions): Promise<T> {
  const config = readShopifyConfig();
  if (!config) {
    if (!warnedUnconfigured) {
      warnedUnconfigured = true;
      console.warn("[shopify] not configured — set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN.");
    }
    throw new ShopifyError("Shopify is not configured", "unconfigured");
  }

  let res: Response;
  try {
    res = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": config.token,
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      ...(cache === "products"
        ? { next: { revalidate: PRODUCT_REVALIDATE_SECONDS, tags: ["shopify"] } }
        : { cache: "no-store" as const }),
    });
  } catch (error) {
    console.error(`[shopify] request failed: ${(error as Error)?.message ?? error}`);
    throw new ShopifyError("Shopify could not be reached", "error");
  }

  let body: { data?: T; errors?: { message: string }[] } | null = null;
  try {
    body = await res.json();
  } catch {
    // Not JSON: reported below with the status.
  }

  if (!res.ok || !body || body.errors?.length || !body.data) {
    const detail = body?.errors?.map((e) => e.message).join("; ") || "no data";
    // 401/403: the token is wrong or lacks a scope; 404: the domain or the
    // API version is wrong.
    console.error(`[shopify] ${res.status} ${res.statusText} — ${detail}`);
    throw new ShopifyError(`Shopify returned ${res.status}`, "error");
  }

  return body.data;
}
