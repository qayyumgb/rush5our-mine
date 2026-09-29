/**
 * RUSH HUNTS PAGE — /rush-hunts
 *
 * Composed like the About and Contact pages: one independent section
 * component per mockup, each with its own stylesheet, all reading from
 * data/hunts.ts. Sections 1-3 are built so far; the rest drop in below them.
 *
 * No `Preloader` — the branded intro belongs to the homepage's first visit.
 * The shared footer follows from the root layout.
 */
import type { Metadata } from "next";
import Nav from "@/components/ui/Nav";
import HuntsHero from "@/components/hunts/HuntsHero";
import HuntsSteps from "@/components/hunts/HuntsSteps";
import HuntsRewards from "@/components/hunts/HuntsRewards";
import { huntsHero } from "@/data/hunts";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Rush Hunts",
  description: huntsHero.bodyLines.join(" "),
  openGraph: {
    title: `Rush Hunts — ${site.name}`,
    description: huntsHero.bodyLines.join(" "),
  },
};

export default function RushHuntsPage() {
  return (
    <>
      <Nav />

      <main>
        {/* 1 — YOU FOUND A RUSH HUNT STICKER */}
        <HuntsHero />

        {/* 2 — HOW RUSH HUNTS WORK */}
        <HuntsSteps />

        {/* 3 — LIVE REWARDS */}
        <HuntsRewards />
      </main>
    </>
  );
}
