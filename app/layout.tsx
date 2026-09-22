import type { Metadata, Viewport } from "next";
import { fontVariables } from "./fonts";
import { site } from "@/data/site";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { VideoPlayerProvider } from "@/components/ui/VideoPlayer";
import Cursor from "@/components/ui/Cursor";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — You Found It.`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.name} — You Found It.`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
    // OG IMAGE: swap for a dedicated 1200x630 share card when one exists.
    images: [{ url: "/assets/images/hero-wide.webp", width: 1487, height: 1058 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — You Found It.`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#040404",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * MOTION GATE — runs before first paint.
 *
 * Adds `.motion` to <html> only when motion is allowed, which is what hides
 * `[data-a]` elements until GSAP has set their entrance state (no flash of
 * un-animated content). The timeout is a failsafe: if the animation system
 * never reports ready — a chunk failed, JS threw — the class is removed and
 * everything becomes visible. Content can never be permanently hidden by a
 * script that didn't run.
 */
const MOTION_GATE = `(function(){var d=document.documentElement;
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
d.classList.add('motion');
setTimeout(function(){if(!d.classList.contains('motion-ready'))d.classList.remove('motion');},4000);})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `suppressHydrationWarning` is required, not cosmetic: the MOTION_GATE
    // script adds `.motion` to <html> before React hydrates, so the server and
    // client className legitimately differ. It scopes the exemption to this
    // one element's own attributes — children still hydrate strictly.
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      {/* No manual <head>: the App Router builds it from `metadata` and
          injects stylesheet links and font preloads itself. Rendering our own
          <head> alongside that gives React two sources reconciling the same
          subtree, which shows up as a hydration mismatch. */}
      {/* `suppressHydrationWarning` on <body> covers browser extensions that
          stamp attributes onto it before React hydrates — ColorZilla adds
          cz-shortcut-listen="true", Grammarly adds data-gr-* , and there are
          others. The page itself renders no dynamic attributes here, so
          nothing of ours is being hidden, and the exemption covers only
          <body>'s own attributes: everything inside still hydrates strictly. */}
      <body suppressHydrationWarning>
        {/* The motion gate runs here, as the first thing in <body>. The
            stylesheet is already parsed, and no [data-a] element exists yet,
            so `.motion` is on <html> before anything could paint un-animated. */}
        <script dangerouslySetInnerHTML={{ __html: MOTION_GATE }} />

        {/* Film grain over the entire page — purely atmospheric. */}
        <div className="grain" aria-hidden="true" />

        <MotionProvider>
          <VideoPlayerProvider>
            {children}
            <Cursor />
          </VideoPlayerProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
