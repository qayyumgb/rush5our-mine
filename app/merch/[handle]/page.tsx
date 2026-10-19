/**
 * PRODUCT PAGE — /merch/[handle]
 *
 * One Shopify product by its handle (the URL name Shopify gives it, under
 * the product's "Search engine listing"). Fetched on the server; the
 * Storefront token never leaves it.
 *
 *   • a handle the store doesn't have      → not-found.tsx beside this
 *   • the store not set up, or unreachable → a short note in place
 *
 * Every product the store has at build time is prerendered; one added
 * later is rendered on its first visit. Each is regenerated at most every
 * minute, so price, stock and photos follow the Shopify admin.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/ui/Nav";
import ProductDetail from "@/components/merch/ProductDetail";
import { ProductState } from "@/components/merch/ProductState";
import { getProduct, getProducts } from "@/lib/shopify/products";
import { imageAt } from "@/lib/shopify/format";
import { shop } from "@/data/shop";
import { site } from "@/data/site";

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.ok ? products.data.map((p) => ({ handle: p.handle })) : [];
}

export async function generateMetadata({ params }: PageProps<"/merch/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const result = await getProduct(handle);
  const product = result.ok ? result.data : null;
  if (!product) return { title: "Merch" };

  const description = (product.seo.description || product.description).slice(0, 160);
  const image = product.images[0];
  return {
    title: product.seo.title || product.title,
    description,
    openGraph: {
      title: `${product.title} — ${site.name}`,
      description,
      ...(image ? { images: [{ url: imageAt(image.url, 1200), width: 1200, alt: image.altText ?? product.title }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/merch/[handle]">) {
  const { handle } = await params;
  const result = await getProduct(handle);
  if (result.ok && !result.data) notFound();

  return (
    <>
      <Nav />
      <main>
        {result.ok && result.data ? (
          <ProductDetail product={result.data} />
        ) : (
          <ProductState
            copy={!result.ok && result.reason === "unconfigured" ? shop.unconfigured : shop.error}
            alert={!result.ok && result.reason === "error"}
          />
        )}
      </main>
    </>
  );
}
