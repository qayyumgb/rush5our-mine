/**
 * ABOUT PAGE — /about
 *
 * Composed the same way as the homepage: one independent section component
 * per mockup, each with its own data file and stylesheet. Only section 1 is
 * built so far; the remaining sections drop in below it.
 *
 * No `Preloader` here — the branded intro belongs to the first visit on the
 * homepage, and replaying it on an internal navigation would sit in front of
 * content the visitor has already asked for.
 */
import type { Metadata } from "next";
import Nav from "@/components/ui/Nav";
import AboutHero from "@/components/about/AboutHero";
import AboutValues from "@/components/about/AboutValues";
import AboutPillars from "@/components/about/AboutPillars";
import AboutAchieve from "@/components/about/AboutAchieve";
import AboutMission from "@/components/about/AboutMission";
import { aboutHero } from "@/data/about";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description: aboutHero.bodyLines.join(" "),
  openGraph: {
    title: `About — ${site.name}`,
    description: aboutHero.bodyLines.join(" "),
  },
};

export default function AboutPage() {
  return (
    <>
      <Nav />

      <main>
        {/* 1 — WE CREATE MOMENTS */}
        <AboutHero />

        {/* 2 — WHAT WE STAND FOR */}
        <AboutValues />

        {/* 3 — HOW WE'RE MAKING IT REAL */}
        <AboutPillars />

        {/* 4 — WHAT WE WILL ACHIEVE */}
        <AboutAchieve />

        {/* 5 — THE MISSION IS SIMPLE / WELCOME TO THE CULTURE */}
        <AboutMission />
      </main>
    </>
  );
}
