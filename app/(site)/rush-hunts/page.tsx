/**
 * RUSH HUNTS PAGE — /rush-hunts
 *
 * Composed like the About and Contact pages: one independent section
 * component per mockup, each with its own stylesheet, all reading from
 * data/hunts.ts. All six sections are built.
 *
 * No `Preloader` — the branded intro belongs to the homepage's first visit.
 * The shared footer follows from the root layout.
 */
import type { Metadata } from "next";
import Nav from "@/components/ui/Nav";
import HuntsHero from "@/components/hunts/HuntsHero";
import HuntsSteps from "@/components/hunts/HuntsSteps";
import HuntsRewards from "@/components/hunts/HuntsRewards";
import HuntsMap from "@/components/hunts/HuntsMap";
import HuntsFinds from "@/components/hunts/HuntsFinds";
import HuntsClosing from "@/components/hunts/HuntsClosing";
import { huntsHero } from "@/data/hunts";
import { site } from "@/data/site";

/**
 * Regenerated at most every five minutes, so the Hunt Map's server-rendered
 * statuses stay close to the clock; in the browser the map keeps them exact.
 */
export const revalidate = 300;

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

        {/* 4 — HUNT MAP */}
        {/* The render time, so the map's first paint in the browser agrees
            with the server's; it moves to the visitor's clock straight after.
            A server component renders once per regeneration and the value
            travels to the browser as data, so this read is stable. */}
        {/* eslint-disable-next-line react-hooks/purity */}
        <HuntsMap renderedAt={Date.now()} />

        {/* 5 — FOUND IN THE WILD */}
        <HuntsFinds />

        {/* 6 — THE HUNT HAS STARTED */}
        <HuntsClosing />
      </main>
    </>
  );
}
