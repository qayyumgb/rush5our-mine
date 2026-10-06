/**
 * JOIN THE MOVEMENT PAGE — /join
 *
 * Composed like the Contact page: one independent section component per
 * mockup, each with its own stylesheet, all reading from data/join.ts.
 * All three sections of the mockup set are built.
 *
 * No `Preloader` — the branded intro belongs to the homepage's first visit.
 * The shared footer follows from the root layout.
 */
import type { Metadata } from "next";
import Nav from "@/components/ui/Nav";
import JoinHero from "@/components/join/JoinHero";
import JoinWays from "@/components/join/JoinWays";
import JoinSignup from "@/components/join/JoinSignup";
import { joinHero } from "@/data/join";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Join the Movement",
  description: joinHero.bodyLines.join(" "),
  openGraph: {
    title: `Join the Movement — ${site.name}`,
    description: joinHero.bodyLines.join(" "),
  },
};

export default function JoinPage() {
  return (
    <>
      <Nav />

      <main>
        {/* 1 — JOIN THE MOVEMENT */}
        <JoinHero />

        {/* 2 — CHOOSE HOW YOU JOIN */}
        <JoinWays />

        {/* 3 — READY? MAKE IT OFFICIAL. */}
        <JoinSignup />
      </main>
    </>
  );
}
