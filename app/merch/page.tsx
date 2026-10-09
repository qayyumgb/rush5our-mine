/**
 * MERCH PAGE — /merch
 *
 * Composed like the Rush Hunts page: one independent section component per
 * mockup, each with its own stylesheet, all reading from data/merch.ts.
 * All five sections of the mockup set are built.
 *
 * No `Preloader` — the branded intro belongs to the homepage's first visit.
 * The shared footer follows from the root layout.
 */
import type { Metadata } from "next";
import Nav from "@/components/ui/Nav";
import MerchHero from "@/components/merch/MerchHero";
import MerchDrop from "@/components/merch/MerchDrop";
import MerchLocked from "@/components/merch/MerchLocked";
import MerchWhy from "@/components/merch/MerchWhy";
import MerchClose from "@/components/merch/MerchClose";
import { merchHero } from "@/data/merch";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Merch",
  description: merchHero.bodyLines.join(" "),
  openGraph: {
    title: `Merch — ${site.name}`,
    description: merchHero.bodyLines.join(" "),
  },
};

export default function MerchPage() {
  return (
    <>
      <Nav />

      <main>
        {/* 1 — BUILD THE MOVEMENT. */}
        <MerchHero />

        {/* 2 — FEATURED DROP: LEVEL 1: ESSENTIALS */}
        <MerchDrop />

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
