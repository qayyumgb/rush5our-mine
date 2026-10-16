/**
 * RUSH HUNTS PAGE CONTENT — mockups/Rush Hunts/*.png
 *
 * Presentation lives in components/hunts/*; this file holds only the words
 * and links, so copy can be edited — or swapped for a CMS fetch — without
 * touching a component. Mirrors data/about.ts and data/contact.ts.
 *
 * ARTWORK: the hero photograph and the red "Curiosity pays off." script are
 * lifted from mockups/Rush Hunts/1.png — public/assets/images/
 * hunts-hero-tall.webp (the mockup with its type filled in from the
 * surrounding pixels) and hunts-hero-script.webp (an alpha cut). They are
 * screen-resolution copies; when the client supplies the originals, replace
 * those files and nothing else.
 */

/* ------------------------------------------------------------------------ */
/* Section 1 — YOU FOUND A RUSH HUNT STICKER (mockups/Rush Hunts/1.png)      */
/* ------------------------------------------------------------------------ */

export interface HuntsHeroContent {
  /** Headline lines in order; `red` lines are set in the brand red. */
  title: { text: string; red?: boolean }[];
  /** Read out for the script artwork under the headline. */
  script: string;
  bodyLines: string[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  /** The three-beat line at the foot; doubles as the scroll cue. */
  cue: { label: string; href: string };
  media: {
    tall: { src: string; width: number; height: number };
    alt: string;
  };
}

export const huntsHero: HuntsHeroContent = {
  title: [
    { text: "You found a" },
    { text: "Rush Hunt", red: true },
    { text: "sticker." },
  ],
  script: "Curiosity pays off.",
  bodyLines: [
    "RUSH HUNTS are real-world QR scavenger hunts",
    "with real rewards. Find a sticker, scan it, follow",
    "the instructions, and unlock your chance to win.",
  ],
  primaryCta: { label: "Claim your find", href: "/contact#form" },
  secondaryCta: { label: "Watch Rush Hunts", href: "/videos" },
  // BACKEND SEAM: points at the next section of this page once it exists.
  cue: { label: "Find it. Scan it. Claim it.", href: "#how" },
  media: {
    tall: { src: "/assets/images/hunts-hero-tall.webp", width: 950, height: 1655 },
    alt: "",
  },
};

export default huntsHero;

/* ------------------------------------------------------------------------ */
/* Section 2 — HOW RUSH HUNTS WORK (mockups/Rush Hunts/2.png)                */
/* ------------------------------------------------------------------------ */

export interface HuntsStep {
  /** The step's mark, lifted from the mockup as an alpha image. */
  icon: { src: string; width: number; height: number };
  titleWhite: string;
  titleRed: string;
  /** Body copy, one entry per line as the mockup sets it. */
  body: string[];
}

export interface HuntsStepsContent {
  eyebrow: string;
  titleWhite: string;
  titleRed: string;
  subline: string;
  /** BACKEND SEAM: numbered in order; the list takes any number of steps. */
  steps: HuntsStep[];
  /** Read out for the script artwork at the foot. */
  script: string;
}

export const huntsSteps: HuntsStepsContent = {
  eyebrow: "Rush Hunts",
  titleWhite: "How Rush Hunts",
  titleRed: "Work",
  subline: "Four steps. Real rewards.",
  steps: [
    {
      icon: { src: "/assets/images/hunts-steps-find.webp", width: 130, height: 138 },
      titleWhite: "Find a",
      titleRed: "sticker",
      body: ["RUSH HUNT stickers are hidden", "in real places around the city."],
    },
    {
      icon: { src: "/assets/images/hunts-steps-qr.webp", width: 130, height: 138 },
      titleWhite: "Scan the",
      titleRed: "QR code",
      body: ["Scan the code on the sticker to", "unlock the hunt and follow the", "instructions."],
    },
    {
      icon: { src: "/assets/images/hunts-steps-proof.webp", width: 130, height: 138 },
      titleWhite: "Post",
      titleRed: "proof",
      body: ["Complete the challenge and", "post proof. Tag @RUSH5OUR", "and use #RUSHHUNTS."],
    },
    {
      icon: { src: "/assets/images/hunts-steps-win.webp", width: 130, height: 138 },
      titleWhite: "Win",
      titleRed: "rewards",
      body: ["Win cash, merch, mystery gifts,", "features, and exclusive", "opportunities."],
    },
  ],
  script: "Find it. Scan it. Claim it.",
};

/* ------------------------------------------------------------------------ */
/* Section 3 — LIVE REWARDS (mockups/Rush Hunts/3.png)                       */
/* ------------------------------------------------------------------------ */

export interface HuntsReward {
  /** The reward's mark, lifted from the mockup as an alpha image. */
  icon: { src: string; width: number; height: number };
  /** Optional: a title can be red alone, as "Features" is. */
  titleWhite?: string;
  titleRed: string;
  /** Body copy, one entry per line as the mockup sets it. */
  body: string[];
}

export interface HuntsRewardsContent {
  eyebrow: string;
  titleWhite: string;
  titleRed: string;
  subline: string;
  /** BACKEND SEAM: the list takes any number of rewards. */
  rewards: HuntsReward[];
  /** Read out for the script artwork at the foot. */
  script: string;
}

export const huntsRewards: HuntsRewardsContent = {
  eyebrow: "Rush Hunts",
  titleWhite: "Live",
  titleRed: "Rewards",
  subline: "Real hunts. Real rewards.",
  rewards: [
    {
      icon: { src: "/assets/images/hunts-rewards-cash.webp", width: 190, height: 150 },
      titleWhite: "Cash",
      titleRed: "prizes",
      body: ["Real money.", "Real winners."],
    },
    {
      icon: { src: "/assets/images/hunts-rewards-merch.webp", width: 190, height: 150 },
      titleWhite: "Exclusive",
      titleRed: "merch",
      body: ["Limited drops only", "for winners."],
    },
    {
      icon: { src: "/assets/images/hunts-rewards-gift.webp", width: 190, height: 150 },
      titleWhite: "Mystery",
      titleRed: "gifts",
      body: ["You never know", "what you’ll get."],
    },
    {
      icon: { src: "/assets/images/hunts-rewards-star.webp", width: 190, height: 150 },
      titleRed: "Features",
      body: ["Get featured on our", "socials & YouTube."],
    },
    {
      icon: { src: "/assets/images/hunts-rewards-clue.webp", width: 190, height: 150 },
      titleWhite: "Clue",
      titleRed: "drops",
      body: ["Unlock clues to", "find more stickers."],
    },
    {
      icon: { src: "/assets/images/hunts-rewards-events.webp", width: 190, height: 150 },
      titleWhite: "Exclusive",
      titleRed: "events",
      body: ["Invites to private", "events & meetups."],
    },
  ],
  script: "More than rewards. A bigger experience.",
};

/* ------------------------------------------------------------------------ */
/* THE HUNTS — every hunt the site knows about                               */
/*                                                                          */
/* The one source for hunt data: the Hunt Map (section 4) reads this list   */
/* and nothing else. Add or edit a hunt here; no component changes.         */
/*                                                                          */
/* STATUS IS AUTOMATIC: give each hunt a start and an end, and the site     */
/* shows it as Upcoming before the start, Active until the end, and Ended   */
/* after — switching on its own at those moments, even on a page that's     */
/* already open. To end a hunt early (the sticker was found), set its       */
/* `endsAt` to when it was found.                                          */
/* ------------------------------------------------------------------------ */

export type HuntStatus = "active" | "upcoming" | "ended";

export interface Hunt {
  /** Stable key; also the list item's anchor (`/rush-hunts#hunt-<id>`). */
  id: string;
  title: string;
  /** One or two short sentences, shown in the map card and the list. */
  description: string;
  /** Where the hunt is, in decimal degrees (WGS84). */
  lat: number;
  lng: number;
  /**
   * When the hunt goes live and when it ends, in the hunt's own local time
   * WITH its UTC offset: "2026-11-07T20:00-05:00" is 8 PM in Tampa. Florida
   * and Georgia are -04:00 in summer (EDT, Mar–early Nov) and -05:00 in
   * winter (EST). The offset is required; a hunt without one is skipped.
   */
  startsAt: string;
  endsAt: string;
  /** Shown under the title, e.g. "Orlando, FL". */
  city: string;
  /** What finding it wins, e.g. "$100 cash". */
  reward?: string;
  /** A photo for the map card, from /public. */
  image?: string;
}

/**
 * PLACEHOLDER HUNTS — five invented hunts across four cities, so the map,
 * its clustering (the two Orlando hunts sit a few blocks apart) and every
 * status have something to show. Replace them with the real hunts as they
 * are planned; see the implementation plan, section 2C.
 */
export const hunts: Hunt[] = [
  {
    id: "downtown-drop",
    title: "Downtown Drop",
    description: "Three stickers between Church Street and Lake Eola. First scan claims the cash.",
    lat: 28.5421,
    lng: -81.379,
    startsAt: "2026-10-14T18:00-04:00",
    endsAt: "2026-10-19T23:00-04:00",
    city: "Orlando, FL",
    reward: "$100 cash",
    image: "/assets/images/hunts-finds-1.webp",
  },
  {
    id: "lake-eola-loop",
    title: "Lake Eola Loop",
    description: "One sticker somewhere on the loop. Follow the clues we post on the day.",
    lat: 28.5434,
    lng: -81.3727,
    startsAt: "2026-10-16T12:00-04:00",
    endsAt: "2026-10-20T21:00-04:00",
    city: "Orlando, FL",
    reward: "Limited merch drop",
  },
  {
    id: "ybor-night-hunt",
    title: "Ybor Night Hunt",
    description: "After dark on 7th Avenue. Bring a flashlight and a fast phone.",
    lat: 27.96,
    lng: -82.439,
    startsAt: "2026-11-07T20:00-05:00",
    endsAt: "2026-11-08T02:00-05:00",
    city: "Tampa, FL",
    reward: "VIP event pass",
  },
  {
    id: "wynwood-walls",
    title: "Wynwood Walls",
    description: "Hidden in plain sight among the murals. The first city-wide hunt in Miami.",
    lat: 25.801,
    lng: -80.199,
    startsAt: "2026-11-21T10:00-05:00",
    endsAt: "2026-11-22T18:00-05:00",
    city: "Miami, FL",
    reward: "$250 cash",
  },
  {
    id: "beltline-run",
    title: "BeltLine Run",
    description: "Found 41 minutes after the first clue dropped. Atlanta moves fast.",
    lat: 33.769,
    lng: -84.364,
    startsAt: "2026-09-27T09:00-04:00",
    endsAt: "2026-09-27T09:41-04:00",
    city: "Atlanta, GA",
    reward: "$50 + merch",
  },
];

/* ------------------------------------------------------------------------ */
/* Section 4 — HUNT MAP (mockups/Rush Hunts/4.png)                           */
/* ------------------------------------------------------------------------ */

export type HuntFilter = "all" | HuntStatus;

export interface HuntsMapContent {
  eyebrow: string;
  titleWhite: string;
  titleRed: string;
  subline: string;
  /** Body copy, one entry per line; `strong` lines are set in full white. */
  body: { text: string; strong?: boolean }[];
  /** The filter row. Each status chip doubles as the map's legend. */
  filters: { key: HuntFilter; label: string }[];
  /** How a status is named on a badge. */
  status: Record<HuntStatus, string>;
  /** The time beside each hunt, by status; "{date}" is replaced with its
      start (upcoming) or end (active, ended). */
  when: Record<HuntStatus, string>;
  list: { titleWhite: string; titleRed: string };
  /** Labels in the map card and the list. */
  labels: { reward: string; showOnMap: string; you: string };
  near: {
    label: string;
    locating: string;
    /** "{n}" is replaced with the closest hunt's distance. */
    located: string;
    denied: string;
    unavailable: string;
  };
  empty: {
    /** No hunts at all. */
    none: string;
    /** The filter matches nothing; "{status}" is replaced. */
    filtered: string;
    showAll: string;
  };
  /**
   * Without a Mapbox token (NEXT_PUBLIC_MAPBOX_TOKEN), or if the map fails
   * to load, this artwork stands in for the map and the list still works.
   */
  fallback: {
    src: string;
    width: number;
    height: number;
    alt: string;
    title: string;
    body: string;
  };
  foot: string;
}

export const huntsMap: HuntsMapContent = {
  eyebrow: "Rush Hunts",
  titleWhite: "Hunt",
  titleRed: "Map",
  subline: "Real city. Real stickers. Real opportunities.",
  body: [
    { text: "Stickers are hidden all over the city." },
    { text: "New drops happen weekly." },
    { text: "Find a location. Make a move.", strong: true },
  ],
  filters: [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "upcoming", label: "Upcoming" },
    { key: "ended", label: "Past" },
  ],
  status: { active: "Active", upcoming: "Upcoming", ended: "Ended" },
  when: { upcoming: "Starts {date}", active: "Ends {date}", ended: "Ended {date}" },
  list: { titleWhite: "All", titleRed: "hunts" },
  labels: { reward: "Reward", showOnMap: "Show on map", you: "You are here" },
  near: {
    label: "Near me",
    locating: "Finding you…",
    located: "Sorted by distance — the closest hunt is {n} away.",
    denied: "Location is off for this site. Turn it on to sort hunts by distance.",
    unavailable: "We couldn’t find your location. Try again in a moment.",
  },
  empty: {
    none: "No hunts on the map yet. The first drop is coming — follow @rush5our to hear first.",
    filtered: "No {status} hunts right now.",
    showAll: "Show all hunts",
  },
  fallback: {
    src: "/assets/images/hunts-map-city.webp",
    width: 950,
    height: 620,
    alt: "Map of Orlando, Florida",
    title: "Live map coming soon",
    body: "Every hunt is in the list — pick one to see its details.",
  },
  foot: "Explore. Find. Claim. Repeat.",
};

/* ------------------------------------------------------------------------ */
/* Section 5 — FOUND IN THE WILD (mockups/Rush Hunts/5.png)                  */
/* ------------------------------------------------------------------------ */

export interface CommunityFind {
  /** The find's number, as printed: "#038". */
  number: string;
  status: string;
  /** Where it was found, under the number. */
  place: string;
  /** The chip over the photograph. */
  location: string;
  reward: string;
  photo: { src: string; width: number; height: number; alt: string };
  href: string;
}

export interface HuntsFindsContent {
  eyebrow: string;
  titleWhite: string;
  titleRed: string;
  subline: string;
  rewardLabel: string;
  /**
   * BACKEND SEAM: the carousel takes any number of finds. The first is the
   * mockup's own; the mockup shows only the edge of the second, so its
   * reward, and the three after it, are stand-ins. Their photographs are
   * crops of the hero picture. Replace with real finds.
   */
  finds: CommunityFind[];
  swipe: string;
  cta: { label: string; href: string };
  foot: string;
}

export const huntsFinds: HuntsFindsContent = {
  eyebrow: "Community finds",
  titleWhite: "Found in",
  titleRed: "the wild.",
  subline: "Real people. Real finds. Real winners.",
  rewardLabel: "Reward",
  finds: [
    {
      number: "#038",
      status: "Found",
      place: "Downtown Orlando",
      location: "Orlando, FL",
      reward: "$100",
      photo: {
        src: "/assets/images/hunts-finds-1.webp",
        width: 634,
        height: 476,
        alt: "A Rush Hunt sticker on a pole in downtown Orlando at night",
      },
      href: "#finds",
    },
    {
      number: "#037",
      status: "Found",
      place: "Found near Park Ave",
      location: "Winter Park",
      reward: "$50",
      photo: {
        src: "/assets/images/hunts-finds-2.webp",
        width: 634,
        height: 476,
        alt: "A Rush Hunt sticker on a pole beside a dark street",
      },
      href: "#finds",
    },
    {
      number: "#036",
      status: "Found",
      place: "Lake Eola Park",
      location: "Orlando, FL",
      reward: "$75",
      photo: {
        src: "/assets/images/hunts-finds-3.webp",
        width: 634,
        height: 476,
        alt: "Red light reflected on a wet street at night",
      },
      href: "#finds",
    },
    {
      number: "#035",
      status: "Found",
      place: "Mall at Millenia",
      location: "Millenia",
      reward: "Merch",
      photo: {
        src: "/assets/images/hunts-finds-4.webp",
        width: 634,
        height: 476,
        alt: "A Rush Hunt sticker on a pole at night",
      },
      href: "#finds",
    },
    {
      number: "#034",
      status: "Found",
      place: "Mills 50 District",
      location: "Orlando, FL",
      reward: "$100",
      photo: {
        src: "/assets/images/hunts-finds-5.webp",
        width: 634,
        height: 476,
        alt: "A Rush Hunt sticker, close up",
      },
      href: "#finds",
    },
  ],
  swipe: "Swipe the finds",
  // BACKEND SEAM: points at the community gallery once that page exists.
  cta: { label: "See all community finds", href: "#finds" },
  foot: "Found one? Your story could be next.",
};

/* ------------------------------------------------------------------------ */
/* Section 6 — THE HUNT HAS STARTED (mockups/Rush Hunts/6.png)               */
/* ------------------------------------------------------------------------ */

export interface HuntsClosingContent {
  eyebrow: string;
  /** Headline lines in order; the `red` line is italic, over a brush stroke. */
  title: { text: string; red?: boolean }[];
  /** The four-beat line; the `red` run closes it. */
  strap: { text: string; red?: boolean }[];
  bodyLines: string[];
  shout: string;
  cta: { label: string; href: string };
  /** Read out for the wordmark artwork at the foot. */
  mark: string;
  tag: string;
}

export const huntsClosing: HuntsClosingContent = {
  eyebrow: "Rush Hunts",
  title: [
    { text: "The hunt" },
    { text: "has started." },
    { text: "Are you in?", red: true },
  ],
  strap: [
    { text: "Find it." },
    { text: "Scan it." },
    { text: "Prove it." },
    { text: "Win it.", red: true },
  ],
  bodyLines: [
    "This is more than a game.",
    "This is a movement.",
    "You’re not just watching RUSH HUNTS.",
  ],
  shout: "You can be part of the next one.",
  cta: { label: "Join the movement", href: "/join" },
  mark: "RUSH 5OUR",
  tag: "The hunt is real.",
};
