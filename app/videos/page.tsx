/**
 * VIDEOS PAGE — /videos
 *
 * Composed like the Merch page: one independent section component per
 * mockup, each with its own stylesheet, all reading from data/videos-page.ts.
 * Five sections, one per mockup.
 *
 * No `Preloader` — the branded intro belongs to the homepage's first visit.
 * The shared footer follows from the root layout.
 */
import type { Metadata } from "next";
import Nav from "@/components/ui/Nav";
import VideosHero from "@/components/videos/VideosHero";
import VideosSeries from "@/components/videos/VideosSeries";
import VideosWatch from "@/components/videos/VideosWatch";
import VideosTalk from "@/components/videos/VideosTalk";
import VideosPart from "@/components/videos/VideosPart";
import { videosHero } from "@/data/videos-page";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Videos",
  description: videosHero.sublines.join(" "),
  openGraph: {
    title: `Videos — ${site.name}`,
    description: videosHero.sublines.join(" "),
  },
};

export default function VideosPage() {
  return (
    <>
      <Nav />

      <main>
        {/* 1 — WATCH THE MOVEMENT. */}
        <VideosHero />

        {/* 2 — VIDEO SERIES */}
        <VideosSeries />

        {/* 3 — WATCH RUSH 5OUR */}
        <VideosWatch />

        {/* 4 — THE COMMUNITY IS TALKING */}
        <VideosTalk />

        {/* 5 — YOU'RE PART OF IT. */}
        <VideosPart />
      </main>
    </>
  );
}
