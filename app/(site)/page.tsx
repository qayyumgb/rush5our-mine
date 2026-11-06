/**
 * HOMEPAGE — composes the six sections from the client mockups.
 *
 * Each section is an independent component with its own data file and
 * stylesheet, so they can be reviewed, replaced or reordered without
 * touching each other.
 */
import Nav from "@/components/ui/Nav";
import Preloader from "@/components/ui/Preloader";
import HeroSection from "@/components/home/HeroSection";
import ConceptSection from "@/components/home/ConceptSection";
import VideosSection from "@/components/home/VideosSection";
import MerchSection from "@/components/home/MerchSection";
import CultureSection from "@/components/home/CultureSection";
import FaqSection from "@/components/home/FaqSection";

export default function HomePage() {
  return (
    <>
      {/* Set `enabled={false}` to ship without the branded intro loader. */}
      <Preloader />
      <Nav />

      <main>
        {/* 1 — HERO */}
        <HeroSection />

        {/* 2 — WHAT IS RUSH 5OUR */}
        <ConceptSection />

        {/* 3 — FEATURED VIDEOS */}
        <VideosSection />

        {/* 4 — MERCH */}
        <MerchSection />

        {/* 5 — MORE THAN CONTENT / THIS IS A CULTURE */}
        <CultureSection />

        {/* 6 — FAQ + FOOTER */}
        <FaqSection />
      </main>
    </>
  );
}
