/**
 * While a product page that wasn't prerendered is fetched from Shopify:
 * the nav, and grey blocks where the photo and details will be.
 */

import Nav from "@/components/ui/Nav";
import { ProductSkeleton } from "@/components/merch/ProductState";

export default function Loading() {
  return (
    <>
      <Nav />
      <main>
        <ProductSkeleton />
      </main>
    </>
  );
}
