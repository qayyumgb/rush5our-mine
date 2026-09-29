/**
 * CONTACT PAGE CONTENT — mockups/Contact/*.png
 *
 * Presentation lives in components/contact/*; this file holds only the words
 * and links, so copy can be edited — or swapped for a CMS fetch — without
 * touching a component. Mirrors data/about.ts.
 *
 * ARTWORK: the hero's atmosphere (red grunge up both edges, the ghosted R5
 * brush mark at the foot) and the dry-brush stroke under the headline are
 * lifted straight from mockups/Contact/1.png — public/assets/images/
 * contact-hero-bg.webp and contact-hero-brush.webp — with the type filtered
 * out. They are the designer's marks at screen resolution; when the client
 * supplies the source artwork, replace those two files and nothing else.
 */

import type { IconName } from "@/components/ui/Icon";

/* ------------------------------------------------------------------------ */
/* Section 1 — CONNECT WITH THE MOVEMENT (mockups/Contact/1.png)             */
/* ------------------------------------------------------------------------ */

export interface ContactHeroContent {
  /** Three tracked words across the top, spaced apart. */
  eyebrow: string[];
  titleWhite: string[];
  titleRed: string;
  bodyLines: string[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  /** Closing line, in runs; `accent` runs are set in white. */
  tagline: { text: string; accent?: boolean }[];
}

export const contactHero: ContactHeroContent = {
  eyebrow: ["People.", "Culture.", "Movement."],
  titleWhite: ["Connect", "with the"],
  titleRed: "Movement.",
  bodyLines: [
    "Questions, collaborations, sticker finds,",
    "submissions, and opportunities start here.",
    "We hear every message.",
    "We see every move.",
    "We appreciate every one of you.",
  ],
  primaryCta: { label: "Join the movement", href: "/#culture" },
  // BACKEND SEAM: points at the form further down this page once it exists.
  secondaryCta: { label: "Submit a find", href: "#form" },
  tagline: [{ text: "Real people. " }, { text: "Real", accent: true }, { text: " opportunities." }],
};

export default contactHero;

/* ------------------------------------------------------------------------ */
/* Section 2 — HOW CAN WE CONNECT? (mockups/Contact/2.png)                   */
/* ------------------------------------------------------------------------ */

export interface ContactWay {
  /** A registry icon, or a mark lifted from the mockup as an alpha image. */
  icon: IconName | { src: string; width: number; height: number };
  title: string;
  /** Body copy, one entry per line as the mockup sets it. */
  body: string[];
  /** The red script line under the copy. */
  script: string;
  cta: { label: string; href: string };
}

export interface ContactWaysContent {
  eyebrow: string[];
  titleWhite: string;
  titleRed: string;
  subline: string;
  /** BACKEND SEAM: rendered two to a row, any length. */
  ways: ContactWay[];
  tagline: string;
}

export const contactWays: ContactWaysContent = {
  eyebrow: ["People.", "Culture.", "Movement."],
  titleWhite: "How can we",
  titleRed: "connect?",
  subline: "Different ways. Same mission.",
  ways: [
    {
      icon: "envelope",
      title: "General contact",
      body: ["Questions, feedback, or just", "want to say what’s up?"],
      script: "We’re here.",
      cta: { label: "Send a message", href: "#form" },
    },
    {
      icon: "handshake",
      title: "Collaborations",
      body: ["Brands, creators, and businesses", "looking to work with RUSH 5OUR."],
      script: "Let’s build.",
      cta: { label: "Work with us", href: "#form" },
    },
    {
      icon: { src: "/assets/images/contact-ways-qr.webp", width: 100, height: 100 },
      title: "Claim your find",
      body: ["Found a sticker?", "Submit your proof and", "claim your reward."],
      script: "Evidence wins.",
      cta: { label: "Submit your find", href: "#form" },
    },
    {
      icon: "cloudUp",
      title: "Submit content",
      body: ["Send us your videos, edits,", "photos, or reactions.", "You might get featured."],
      script: "Let’s see it.",
      cta: { label: "Submit content", href: "#form" },
    },
  ],
  tagline: "Real people. Real opportunities.",
};

/* ------------------------------------------------------------------------ */
/* Section 3 — SEND US A MESSAGE / OTHER WAYS TO REACH US                    */
/* (mockups/Contact/3.png)                                                   */
/* ------------------------------------------------------------------------ */

export interface ContactChannel {
  icon: IconName;
  label: string;
  value: string;
  href: string;
}

export interface ContactFormContent {
  eyebrow: string[];
  form: {
    titleWhite: string;
    titleRed: string;
    subline: string;
    fields: {
      name: string;
      email: string;
      subject: string;
      message: string;
    };
    submit: string;
    /** Shown in place of the button once a message has gone. */
    sent: string;
    failed: string;
  };
  reach: {
    titleWhite: string;
    titleRed: string;
    titleTail: string;
    subline: string;
    /** BACKEND SEAM: the list renders any number of channels. */
    channels: ContactChannel[];
    response: { label: string; lines: string[] };
    /** The ghosted brush note, one entry per written line. */
    noteLines: string[];
    tagline: string[];
  };
}

export const contactForm: ContactFormContent = {
  eyebrow: ["People.", "Culture.", "Movement."],
  form: {
    titleWhite: "Send us a",
    titleRed: "message",
    subline: "We hear every message.",
    fields: {
      name: "Your Name",
      email: "Email Address",
      subject: "Subject",
      message: "Your Message",
    },
    submit: "Send message",
    sent: "Message sent. We’ll be in touch.",
    failed: "Something went wrong. Try again in a moment.",
  },
  reach: {
    titleWhite: "Other ways to",
    titleRed: "reach",
    titleTail: "us",
    subline: "More ways. Same conversation.",
    channels: [
      { icon: "envelope", label: "Email", value: "info@rush5our.com", href: "mailto:info@rush5our.com" },
      { icon: "instagram", label: "Instagram", value: "@rush5our", href: "https://www.instagram.com/rush5our" },
      { icon: "tiktok", label: "TikTok", value: "@rush5our", href: "https://www.tiktok.com/@rush5our" },
      { icon: "youtubeSolid", label: "YouTube", value: "RUSH 5OUR", href: "https://www.youtube.com/@RUSH5OUR" },
    ],
    response: {
      label: "Response Time",
      lines: ["We respond to every message.", "Give us 24–48 hours."],
    },
    noteLines: ["Real", "people.", "Real", "opportunities."],
    tagline: ["Built by the culture.", "For what’s next."],
  },
};

/* ------------------------------------------------------------------------ */
/* Section 4 — CONNECT WITH THE COMMUNITY (mockups/Contact/4.png)            */
/* ------------------------------------------------------------------------ */

export interface ContactNetwork {
  /** Brand mark, lifted from the mockup (public/assets/images/logo-*.webp). */
  logo: { src: string; width: number; height: number };
  name: string;
  handle: string;
  cta: { label: string; href: string };
}

export interface ContactCommunityContent {
  eyebrow: string[];
  titleLine1: string;
  titleLine2White: string;
  titleLine2Red: string;
  subline: string;
  /** BACKEND SEAM: three to a row; the grid takes any number. */
  networks: ContactNetwork[];
  panel: {
    titleWhite: string;
    titleRed: string;
    bodyLines: string[];
    /** The red script sign-off; artwork lifted from the mockup. */
    thanks: string;
  };
}

export const contactCommunity: ContactCommunityContent = {
  eyebrow: ["People.", "Culture.", "Movement."],
  titleLine1: "Connect with",
  titleLine2White: "the",
  titleLine2Red: "community",
  subline: "Real people. Real conversations.",
  networks: [
    {
      logo: { src: "/assets/images/logo-tiktok.webp", width: 134, height: 150 },
      name: "TikTok",
      handle: "@rush5our",
      cta: { label: "Follow us", href: "https://www.tiktok.com/@rush5our" },
    },
    {
      logo: { src: "/assets/images/logo-youtube.webp", width: 165, height: 125 },
      name: "YouTube",
      handle: "RUSH 5OUR",
      cta: { label: "Subscribe", href: "https://www.youtube.com/@RUSH5OUR" },
    },
    {
      logo: { src: "/assets/images/logo-instagram.webp", width: 150, height: 150 },
      name: "Instagram",
      handle: "@rush5our",
      cta: { label: "Follow us", href: "https://www.instagram.com/rush5our" },
    },
  ],
  panel: {
    titleWhite: "Be part of",
    titleRed: "What’s next.",
    bodyLines: ["Follow. Watch. Engage.", "Share. Support.", "This is how the culture grows."],
    thanks: "Thank you.",
  },
};

/* ------------------------------------------------------------------------ */
/* Section 5 — THIS IS ONLY THE BEGINNING (mockups/Contact/5.png)            */
/* ------------------------------------------------------------------------ */

export interface ContactClosingContent {
  eyebrow: string[];
  /** Read out for the brush artwork (R5 mark and the scripted name). */
  markLabel: string;
  titleWhite: string;
  titleRed: string;
  bodyLines: string[];
  cta: { label: string; href: string };
  /** BACKEND SEAM: four across; the strip takes any number. */
  pillars: { icon: IconName; label: string[] }[];
  /** Footer runs, joined by dots. */
  footer: string[];
}

export const contactClosing: ContactClosingContent = {
  eyebrow: ["People.", "Culture.", "Movement."],
  markLabel: "R5 — RUSH 5OUR.",
  titleWhite: "This is only",
  titleRed: "The beginning.",
  bodyLines: [
    "Every message. Every connection. Every supporter.",
    "You are the reason this movement exists.",
    "Let’s keep building something unforgettable.",
  ],
  cta: { label: "Join the movement", href: "/#culture" },
  pillars: [
    { icon: "globe", label: ["Real world", "movement"] },
    { icon: "community", label: ["Loyal", "community"] },
    { icon: "gift", label: ["Exclusive", "rewards"] },
    { icon: "bolt", label: ["Unforgettable", "moments"] },
  ],
  footer: ["Rush 5our.", "Build the movement.", "Live it.", "Represent it."],
};
