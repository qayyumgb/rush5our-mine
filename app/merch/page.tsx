/**
 * MERCH PAGE — /merch
 *
 * Composed like the Rush Hunts page: one independent section component per
 * mockup, each with its own stylesheet, reading its words from
 * data/merch.ts. The store between them is Shopify's (Phase 2, 2B):
 *
 *   1  BUILD THE MOVEMENT.         the hero
 *   2  FEATURED DROP               Shopify's featured product, buyable
 *   2b THE STORE                   every Shopify product → /merch/[handle]
 *   3  LOCKED FUTURE DROPS
 *   4  WHY OUR MERCH MATTERS
 *   5  WEAR THE MOVEMENT.
 *
 * DATA: products are fetched here, on the server (lib/shopify/products.ts),
 * with the Storefront token from the server's environment; none is in the
 * code. The store streams in behind a Suspense boundary, so the hero never
 * waits on Shopify, and the page is regenerated at most every minute, so a
 * change in the Shopify admin shows within a minute or so.
 *
 * No `Preloader` — the branded intro belongs to the homepage's first visit.
 * The shared footer follows from the root layout.
 */
import { Suspense } from "react";
import type { Metadata } from "next";
import Nav from "@/components/ui/Nav";
import MerchHero from "@/components/merch/MerchHero";
import MerchDrop from "@/components/merch/MerchDrop";
import MerchShop from "@/components/merch/MerchShop";
import MerchLocked from "@/components/merch/MerchLocked";
import MerchWhy from "@/components/merch/MerchWhy";
import MerchClose from "@/components/merch/MerchClose";
import { getFeaturedProduct, getProducts } from "@/lib/shopify/products";
import { merchHero } from "@/data/merch";
import { site } from "@/data/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Merch",
  description: merchHero.bodyLines.join(" "),
  openGraph: {
    title: `Merch — ${site.name}`,
    description: merchHero.bodyLines.join(" "),
  },
};

/** The featured drop and the grid, once Shopify has answered. Without
    products the featured drop says why, and the grid is left out. */
async function Store() {
  const products = await getProducts();
  if (!products.ok) return <MerchDrop product={null} failure={products.reason} />;
  if (products.data.length === 0) return <MerchDrop product={null} failure="empty" />;

  const featured = await getFeaturedProduct(products.data);
  return (
    <>
      <MerchDrop product={featured.ok ? featured.data : null} failure={featured.ok ? "empty" : featured.reason} />
      <MerchShop products={products.data} />
    </>
  );
}

export default function MerchPage() {
  return (
    <>
      <Nav />

      <main>
        {/* 1 — BUILD THE MOVEMENT. */}
        <MerchHero />

        {/* 2 — FEATURED DROP: LEVEL 1: ESSENTIALS, and 2b — THE STORE */}
        <Suspense fallback={<MerchDrop product={null} failure="loading" />}>
          <Store />
        </Suspense>

        {/* 3 — LOCKED FUTURE DROPS */}
        <MerchLocked />

        {/* 4 — WHY OUR MERCH MATTERS / BIGGER THAN A SHIRT */}
        <MerchWhy />

        {/* 5 — WEAR THE MOVEMENT. REP THE CULTURE. */}
        <MerchClose />
      </main>
    </>
  );
}
