/**
 * THE WEBSITE — everything every page of the main site shares: smooth
 * scrolling and motion, the video lightbox, the Shopify cart, the footer
 * and the custom cursor.
 *
 * The `(site)` folder is a route group: it isn't part of any URL. It exists
 * so pages outside it can leave all of this out. The Early Access page
 * (app/early-access) is one: a QR destination that must not lead anywhere
 * else, so it gets no footer, no cart and no links.
 */

import { MotionProvider } from "@/components/motion/MotionProvider";
import Footer from "@/components/ui/Footer";
import { VideoPlayerProvider } from "@/components/ui/VideoPlayer";
import Cursor from "@/components/ui/Cursor";
import CartProvider from "@/components/cart/CartProvider";
import { readShopifyConfig } from "@/lib/shopify/client";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <VideoPlayerProvider>
        {/* The Shopify cart, on every page. Only whether the store is set
            up crosses to the browser — never its domain or token. */}
        <CartProvider enabled={readShopifyConfig() !== null}>
          {children}
          {/* One footer for every page, after its sections. */}
          <Footer />
        </CartProvider>
        <Cursor />
      </VideoPlayerProvider>
    </MotionProvider>
  );
}
