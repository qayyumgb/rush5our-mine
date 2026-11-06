/**
 * A product handle the store doesn't have (removed, renamed, or a typo).
 */

import Nav from "@/components/ui/Nav";
import { ProductState } from "@/components/merch/ProductState";
import { shop } from "@/data/shop";

export default function ProductNotFound() {
  return (
    <>
      <Nav />
      <main>
        <ProductState copy={shop.product.notFound} />
      </main>
    </>
  );
}
