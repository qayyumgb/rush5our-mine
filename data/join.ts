/**
 * JOIN THE MOVEMENT PAGE CONTENT — mockups/Join The Movement/*.png
 *
 * Presentation lives in components/join/*; this file holds only the words
 * and links, so copy can be edited — or swapped for a CMS fetch — without
 * touching a component. Mirrors data/contact.ts.
 *
 * ARTWORK: the hero's atmosphere (red grunge up both edges, the ghosted R5
 * brush marks over the headline and at the foot) is lifted straight from
 * mockups/Join The Movement/1.png — public/assets/images/join-hero-edge-l,
 * join-hero-edge-r and join-hero-centre.webp — with the type filtered out.
 * They are the designer's marks at screen resolution; when the client
 * supplies the source artwork, replace those files and nothing else.
 */

import type { IconName } from "@/components/ui/Icon";

/* ------------------------------------------------------------------------ */
/* Section 1 — JOIN THE MOVEMENT (mockups/Join The Movement/1.png)           */
/* ------------------------------------------------------------------------ */

export interface JoinPillar {
  icon: IconName;
  title: string;
  /** Body copy, one entry per line as the mockup sets it. */
  body: string[];
}

export interface JoinHeroContent {
  /** Three tracked words across the top, spaced apart. */
  eyebrow: string[];
  titleWhite: string;
  titleRed: string;
  bodyLines: string[];
  /** BACKEND SEAM: rendered three across; the row takes any number. */
  pillars: JoinPillar[];
  cta: { label: string; href: string };
  tagline: string;
}

export const joinHero: JoinHeroContent = {
  eyebrow: ["People.", "Culture.", "Movement."],
  titleWhite: "Join",
  titleRed: "the movement.",
  bodyLines: ["You’re not just following RUSH 5OUR.", "You’re becoming part of what we’re building."],
  pillars: [
    {
      icon: "community",
      title: "Real community",
      body: ["Connect with the people", "building the movement."],
    },
    {
      icon: "gift",
      title: "Exclusive access",
      body: ["Drops, rewards,", "hunts & opportunities."],
    },
    {
      icon: "growth",
      title: "Be part of what’s next",
      body: ["Get in early.", "Grow with us."],
    },
  ],
  // BACKEND SEAM: points at the sign-up further down this page once built.
  cta: { label: "Join the movement", href: "#signup" },
  tagline: "Real people. Real opportunities. Real movement.",
};

export default joinHero;

/* ------------------------------------------------------------------------ */
/* Section 2 — CHOOSE HOW YOU JOIN (mockups/Join The Movement/2.png)         */
/* ------------------------------------------------------------------------ */

export interface JoinWay {
  /** The card's mark, lifted from the mockup as an alpha image. */
  icon: { src: string; width: number; height: number };
  /** Title lines, one per entry as the mockup breaks them. */
  title: string[];
  /** Body copy, one entry per line as the mockup sets it. */
  body: string[];
  cta: { label: string; href: string };
}

export interface JoinWaysContent {
  eyebrow: string[];
  titleWhite: string;
  titleRed: string;
  subline: string;
  /** The free tier: the big card. */
  free: {
    icon: { src: string; width: number; height: number };
    title: string;
    /** Read out for the "FREE" script artwork. */
    badge: string;
    lead: string;
    perks: string[];
    cta: { label: string; href: string };
  };
  furtherWhite: string;
  furtherRed: string;
  furtherSub: string;
  /** BACKEND SEAM: rendered three across; the row takes any number. */
  ways: JoinWay[];
  tagline: string;
}

export const joinWays: JoinWaysContent = {
  eyebrow: ["People.", "Culture.", "Movement."],
  titleWhite: "Choose",
  titleRed: "how you join",
  subline: "One movement. Different ways to be part of it.",
  free: {
    icon: { src: "/assets/images/join-ways-people.webp", width: 186, height: 132 },
    title: "Join the community",
    badge: "Free",
    lead: "Start here. Be part of RUSH 5OUR.",
    perks: ["Movement updates", "Rush Hunt updates", "New content & drops", "Community opportunities"],
    // BACKEND SEAM: points at the sign-up further down this page once built.
    cta: { label: "Join free", href: "#signup" },
  },
  furtherWhite: "Want to",
  furtherRed: "go further?",
  furtherSub: "More ways to get involved.",
  ways: [
    {
      icon: { src: "/assets/images/join-ways-cart.webp", width: 96, height: 88 },
      title: ["Rep the", "movement"],
      body: ["Wear the merch.", "Support what we’re", "building."],
      cta: { label: "Shop merch", href: "/#merch" },
    },
    {
      icon: { src: "/assets/images/join-ways-scope.webp", width: 92, height: 90 },
      title: ["Join", "the hunts"],
      body: ["Find stickers.", "Complete challenges.", "Win prizes."],
      cta: { label: "Learn more", href: "/rush-hunts" },
    },
    {
      icon: { src: "/assets/images/join-ways-camera.webp", width: 102, height: 84 },
      title: ["Create", "with us"],
      body: ["Creators, brands and", "supporters can become", "part of what we", "build next."],
      cta: { label: "Work with us", href: "/contact#form" },
    },
  ],
  tagline: "Real people. Real opportunities. Real movement.",
};

/* ------------------------------------------------------------------------ */
/* Section 3 — READY? MAKE IT OFFICIAL. (mockups/Join The Movement/3.png)    */
/* ------------------------------------------------------------------------ */

export interface JoinPerk {
  icon: IconName;
  title: string;
  /** Body copy, one entry per line as the mockup sets it. */
  body: string[];
}

export interface JoinSignupContent {
  eyebrow: string[];
  titleWhite: string;
  titleRed: string;
  /** "Create your RUSH 5OUR account", with the brand run in red. */
  createLead: string;
  createBrand: string;
  createTail: string;
  lead: string;
  fields: { name: string; email: string; username: string; password: string };
  updatesLabel: string;
  /** "I agree to the Terms & Privacy Policy." in runs; links carry hrefs. */
  agree: { text: string; href?: string }[];
  submit: string;
  sending: string;
  sentTitle: string;
  sent: string;
  failedTitle: string;
  failed: string;
  onceWhite: string;
  onceRed: string;
  /** BACKEND SEAM: rendered four across; the row takes any number. */
  perks: JoinPerk[];
  closeWhite: string;
  closeRed: string;
}

export const joinSignup: JoinSignupContent = {
  eyebrow: ["People.", "Culture.", "Movement."],
  titleWhite: "Ready?",
  titleRed: "Make it official.",
  createLead: "Create your",
  createBrand: "RUSH 5OUR",
  createTail: "account",
  lead: "It’s free. Join the movement and stay connected to what’s next.",
  fields: { name: "Full Name", email: "Email Address", username: "Username", password: "Password" },
  updatesLabel: "Send me updates about hunts, drops & opportunities.",
  // BACKEND SEAM: the Terms and Privacy pages do not exist yet (the footer's
  // links point at "#" too); give these real hrefs when they do.
  agree: [{ text: "I agree to the " }, { text: "Terms", href: "#" }, { text: " & " }, { text: "Privacy Policy", href: "#" }, { text: "." }],
  submit: "Join the movement",
  sending: "Joining…",
  sentTitle: "You’re in.",
  sent: "Welcome to RUSH 5OUR. Watch your inbox — the next move is coming.",
  failedTitle: "Not quite.",
  failed: "Something went wrong. Try again in a moment.",
  onceWhite: "Once",
  onceRed: "you’re in…",
  perks: [
    { icon: "envelope", title: "Stay connected", body: ["Get movement", "updates."] },
    { icon: "target", title: "Follow the hunts", body: ["Know what’s", "happening with", "RUSH HUNTS."] },
    { icon: "gift", title: "Get access", body: ["Hear about drops,", "rewards &", "opportunities."] },
    { icon: "bolt", title: "Be early", body: ["See what", "RUSH 5OUR", "is building next."] },
  ],
  closeWhite: "Free to join.",
  closeRed: "Built to grow.",
};
