/**
 * CONTACT PAGE — /contact
 *
 * Composed like the About page: one independent section component per
 * mockup, each with its own stylesheet, all reading from data/contact.ts.
 * All five sections of the mockup set are built.
 *
 * No `Preloader` — the branded intro belongs to the homepage's first visit.
 */
import type { Metadata } from "next";
import Nav from "@/components/ui/Nav";
import ContactHero from "@/components/contact/ContactHero";
import ContactWays from "@/components/contact/ContactWays";
import ContactFormSection from "@/components/contact/ContactFormSection";
import ContactCommunity from "@/components/contact/ContactCommunity";
import ContactClosing from "@/components/contact/ContactClosing";
import { contactHero } from "@/data/contact";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description: contactHero.bodyLines.join(" "),
  openGraph: {
    title: `Contact — ${site.name}`,
    description: contactHero.bodyLines.join(" "),
  },
};

export default function ContactPage() {
  return (
    <>
      <Nav />

      <main>
        {/* 1 — CONNECT WITH THE MOVEMENT */}
        <ContactHero />

        {/* 2 — HOW CAN WE CONNECT? */}
        <ContactWays />

        {/* 3 — SEND US A MESSAGE / OTHER WAYS TO REACH US */}
        <ContactFormSection />

        {/* 4 — CONNECT WITH THE COMMUNITY */}
        <ContactCommunity />

        {/* 5 — THIS IS ONLY THE BEGINNING */}
        <ContactClosing />
      </main>
    </>
  );
}
