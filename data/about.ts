/**
 * ABOUT PAGE CONTENT
 *
 * Presentation lives in components/about/*; this file holds only the words and
 * the media references, so copy can be edited — or swapped for a CMS fetch —
 * without touching a component. Mirrors the shape of data/hero.ts.
 */

import type { IconName } from "@/components/ui/Icon";

export interface AboutHeroContent {
  eyebrow: string;
  /** Headline, split by colour. Each array entry is its own masked line. */
  titleWhite: string[];
  titleRed: string[];
  /** Handwritten marker note, upper right. One entry per written line. */
  accentLines: string[];
  /** Body paragraph. Each entry is a line in the mockup’s ragged setting. */
  bodyLines: string[];
  primaryCta: { label: string; href: string };
  /** Opens in the shared VideoPlayer. Empty `videoUrl` shows the poster. */
  storyVideo: { title: string; label: string[]; videoUrl: string; poster: string };
  /** Foot of the section — doubles as the scroll cue’s label. */
  cue: { label: string; href: string };
  media: {
    tall: { src: string; width: number; height: number };
    wide: { src: string; width: number; height: number };
    alt: string;
  };
}

export const aboutHero: AboutHeroContent = {
  eyebrow: "Who we are",

  // Four masked lines: two white, then two red. Kept as separate entries
  // rather than one string with <br> so each can be revealed on its own.
  titleWhite: ["We don’t just", "make content."],
  titleRed: ["We create", "moments."],

  accentLines: ["Real people.", "Real experiences.", "Real opportunities."],

  bodyLines: [
    "RUSH 5OUR is a real-world movement",
    "built through content, community,",
    "challenges, rewards, and",
    "unforgettable experiences.",
  ],

  primaryCta: { label: "Discover our story", href: "#story" },

  storyVideo: {
    title: "Our story",
    label: ["Watch", "our story"],
    // BACKEND SEAM: paste a TikTok / YouTube / Vimeo / file URL here. An empty
    // string is handled — the player opens on its poster instead of breaking.
    videoUrl: "",
    poster: "/assets/images/about-hero-tall.webp",
  },

  cue: { label: "Together we go further.", href: "#story" },

  media: {
    /*
     * PHOTO LIFTED FROM THE MOCKUP — ASK THE CLIENT FOR THE ORIGINAL.
     *
     * `about-hero-tall.webp` is the About mockup (mockups/About/1.png) with
     * its text, buttons and nav filled in from the surrounding pixels. It is
     * therefore the exact photograph the design shows, at the mockup’s own
     * 950x1655 size — but it is a screen-resolution copy with the designer’s
     * grading baked in, and it has no landscape version. When the original
     * arrives, replace `tall` with a 950x1655 (or larger, same ratio) crop and
     * `wide` with a landscape crop for desktop; nothing else needs to change.
     *
     * Until then `wide` reuses the tall file, cropped by `object-fit: cover`
     * around the crowd and the skyline.
     */
    tall: { src: "/assets/images/about-hero-tall.webp", width: 950, height: 1655 },
    wide: { src: "/assets/images/about-hero-tall.webp", width: 950, height: 1655 },
    alt: "",
  },
};

/* ------------------------------------------------------------------------ */
/* Section 2 — WHAT WE STAND FOR (mockups/About/2.png)                       */
/* ------------------------------------------------------------------------ */

export interface AboutValue {
  /** Looked up in the shared icon registry (components/ui/Icon.tsx). */
  icon: IconName;
  title: string;
  /** Supporting copy, one entry per line as set in the mockup. */
  body: string[];
}

export interface AboutValuesContent {
  eyebrow: string;
  titleWhite: string[];
  titleRed: string;
  bodyLines: string[];
  /**
   * BACKEND SEAM: rendered three to a row, so the grid grows or shrinks
   * with the array. Six entries make the 3x2 of the mockup.
   */
  values: AboutValue[];
}

export const aboutValues: AboutValuesContent = {
  eyebrow: "What we stand for",
  titleWhite: ["More than", "content."],
  titleRed: "Real impact.",
  bodyLines: [
    "We stand for action, belief, opportunity,",
    "and a community that shows up — in real life.",
    "RUSH 5OUR is built for the people who want",
    "more out of life, and aren’t afraid to go get it.",
  ],
  values: [
    { icon: "community", title: "Community", body: ["Real people.", "Real connections."] },
    {
      icon: "bolt",
      title: "Opportunity",
      body: ["Turning everyday", "moments into", "life-changing ones."],
    },
    { icon: "target", title: "Challenges", body: ["Step out. Show up.", "Be part of it."] },
    { icon: "gift", title: "Rewards", body: ["More than giveaways.", "Real value."] },
    { icon: "smile", title: "Good energy", body: ["Positivity in", "every city we hit."] },
    {
      icon: "star",
      title: "A bigger purpose",
      body: ["Inspiring people to", "believe in more."],
    },
  ],
};

export default aboutHero;

/* ------------------------------------------------------------------------ */
/* Section 3 — HOW WE’RE MAKING IT REAL (mockups/About/3.png)                */
/* ------------------------------------------------------------------------ */

export interface AboutPillar {
  /** Looked up in the shared icon registry (components/ui/Icon.tsx). */
  icon: IconName;
  titleWhite: string;
  titleRed: string;
  /**
   * Body copy as paragraphs of lines, matching the mockup’s exact wrap and
   * its one paragraph break (the third pillar has two). Rendered as one
   * `<p>` per paragraph.
   */
  body: string[][];
}

export interface AboutPillarsContent {
  eyebrow: string;
  /** BACKEND SEAM: rendered as a numbered list, so a fourth pillar just
   *  adds "04" without a code change. */
  pillars: AboutPillar[];
  /** Closing line, flanked by hairlines. */
  footer: string;
}

export const aboutPillars: AboutPillarsContent = {
  eyebrow: "How we’re making it real",
  pillars: [
    {
      icon: "globe",
      titleWhite: "What we’re",
      titleRed: "Building.",
      body: [
        [
          "We’re building a real-world movement that connects",
          "content, community, challenges, rewards, and experiences",
          "into one. Through RUSH HUNTS, videos, and real-world",
          "activations, supporters don’t just watch — they become",
          "part of the story.",
        ],
      ],
    },
    {
      icon: "scope",
      titleWhite: "The",
      titleRed: "Vision.",
      body: [
        [
          "Our vision is to build RUSH 5OUR into a movement",
          "that reaches schools, cities, communities, creators,",
          "and supporters everywhere. When you see the",
          "RUSH 5OUR name, you’ll know something could",
          "be happening nearby — a hunt, a challenge, a reward,",
          "or a moment worth being part of.",
        ],
      ],
    },
    {
      icon: "community",
      titleWhite: "Why it",
      titleRed: "Matters.",
      body: [
        [
          "The world is full of people scrolling past content every day.",
          "RUSH 5OUR is different — we’re taking content into the",
          "real world. We give everyday people opportunities to",
          "participate, connect, win, be featured, and create moments",
          "they’ll actually remember.",
        ],
        [
          "This movement isn’t just about content — it’s about people.",
          "And people make the biggest impact.",
        ],
      ],
    },
  ],
  footer: "More people. Bigger moments.",
};

/* ------------------------------------------------------------------------ */
/* Section 4 — WHAT WE WILL ACHIEVE (mockups/About/4.png)                    */
/* ------------------------------------------------------------------------ */

export interface AboutAchieveItem {
  /** Condensed caps title; one entry per line as the mockup wraps it. */
  title: string[];
  /** Supporting copy, one entry per line. */
  desc: string[];
}

export interface AboutAchieveContent {
  eyebrow: string;
  titleWhite: string[];
  titleRed: string;
  /** Ghosted marker note to the right of the headline, one line each. */
  noteLines: string[];
  /** BACKEND SEAM: rendered as a checked list, any length. */
  items: AboutAchieveItem[];
  tagline: string;
  closingWhite: string;
  closingRed: string;
}

export const aboutAchieve: AboutAchieveContent = {
  eyebrow: "What we will achieve",
  titleWhite: ["More than", "a name."],
  titleRed: "A movement.",
  noteLines: ["Built", "by people", "for a", "bigger", "tomorrow."],
  items: [
    {
      title: ["Rush 5our will become more than a name."],
      desc: ["It will become a recognizable movement."],
    },
    {
      title: ["A brand people talk about."],
      desc: ["A name that represents real experiences,", "opportunities, and impact."],
    },
    {
      title: ["A logo people look for."],
      desc: ["Something that sparks curiosity and", "lets people know something is happening."],
    },
    {
      title: ["A community people want to join."],
      desc: [
        "A space for everyday people, creators,",
        "and supporters to connect and be part of something bigger.",
      ],
    },
    {
      title: ["A platform that gives regular people", "unforgettable moments."],
      desc: ["Through challenges, rewards, and real-world experiences."],
    },
    {
      title: ["A movement that started from the ground", "and grew because the people believed in it."],
      desc: ["And this is just the beginning."],
    },
  ],
  tagline: "Same people. Bigger places.",
  closingWhite: "The best is",
  closingRed: "yet to come.",
};

/* ------------------------------------------------------------------------ */
/* Section 5 — THE MISSION IS SIMPLE / WELCOME TO THE CULTURE               */
/* (mockups/About/5.png)                                                     */
/* ------------------------------------------------------------------------ */

export interface AboutMissionItem {
  icon: IconName;
  /** Title in two colours: the white lead and the red payoff. */
  titleWhite: string;
  titleRed: string;
  desc: string;
}

export interface AboutMissionStat {
  icon: IconName;
  top: string;
  bottom: string;
}

export interface AboutMissionContent {
  eyebrow: string;
  /** BACKEND SEAM: rendered as a list, any length. */
  items: AboutMissionItem[];
  welcomeWhite: string;
  welcomeRed: string;
  copyLines: string[];
  copyRed: string;
  cta: { label: string; href: string };
  stats: AboutMissionStat[];
  /** Handwritten sign-off. */
  signature: string;
  tagline: string;
}

export const aboutMission: AboutMissionContent = {
  eyebrow: "The mission is simple.",
  items: [
    {
      icon: "trophy",
      titleWhite: "Create unforgettable",
      titleRed: "moments.",
      desc: "Real experiences. Real people. Real impact.",
    },
    {
      icon: "community",
      titleWhite: "Build a",
      titleRed: "loyal community.",
      desc: "A place where everyone feels seen, included, and valued.",
    },
    {
      icon: "gift",
      titleWhite: "Give everyday people",
      titleRed: "opportunities.",
      desc: "A chance to be a part of something bigger.",
    },
    {
      icon: "video",
      titleWhite: "Turn real life into",
      titleRed: "content.",
      desc: "Take the culture off the screen and into the real world.",
    },
    {
      icon: "heart",
      titleWhite: "Turn supporters into",
      titleRed: "participants.",
      desc: "More than viewers — you’re part of the story.",
    },
    {
      icon: "globe",
      titleWhite: "Build something",
      titleRed: "the world can’t ignore.",
      desc: "A movement that creates change, opportunity, and lasting impact.",
    },
  ],
  welcomeWhite: "Welcome to",
  welcomeRed: "The culture.",
  copyLines: ["If you’re here, you’re early.", "You’re not just watching RUSH 5OUR grow."],
  copyRed: "You’re part of the reason it will.",
  cta: { label: "Join the movement", href: "/#faq" },
  stats: [
    { icon: "bolt", top: "More than", bottom: "Content." },
    { icon: "community", top: "More than", bottom: "A brand." },
    { icon: "growth", top: "Built for", bottom: "Real people." },
  ],
  signature: "Rush 5our.",
  tagline: "Welcome to the movement.",
};
