/**
 * EARLY ACCESS — /early-access, and the whole of https://join.rush5our.com
 * (proxy.ts rewrites that host's "/" to here and keeps its visitors on it).
 *
 * The merch drop's QR destination. It stands apart from the website, which
 * isn't open yet: it lives outside app/(site), so it has no nav, no footer,
 * no cart and no links — a visitor can sign up and see the confirmation,
 * and nothing else. Kept out of search engines until launch (`robots`
 * below, and an X-Robots-Tag header from proxy.ts on the subdomain).
 */

import type { Metadata } from "next";
import EarlyAccess from "@/components/early-access/EarlyAccess";
import { earlyAccess } from "@/data/early-access";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: earlyAccess.meta.title,
  description: earlyAccess.meta.description,
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  openGraph: {
    title: `${earlyAccess.meta.title} — ${site.name}`,
    description: earlyAccess.meta.description,
  },
};

export default function EarlyAccessPage() {
  return <EarlyAccess />;
}
