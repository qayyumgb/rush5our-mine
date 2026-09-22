/**
 * FAQ CONTENT — section 6, "Questions? Answered." (mockup 6.png).
 *
 * ▸ BACKEND SEAM: `faqItems` is an ordered array; numbering is derived at
 *   render time, so adding or reordering entries needs no other change.
 *   Swap it for a CMS collection and pass into <FaqSection items={...} />.
 */

export interface FaqItem {
  id: string;
  question: string;
  /** Answer lines — one entry per line, matching the mockup's breaks. */
  answer: string[];
}

export interface FaqContent {
  eyebrow: string;
  titleWhite: string;
  titleRed: string;
  subLines: string[];
  reachOut: {
    kicker: string;
    label: string;
  };
}

export const faqContent: FaqContent = {
  eyebrow: "Good to know",
  titleWhite: "Questions?",
  titleRed: "Answered.",
  subLines: [
    "Everything you need to know, all in one place.",
    "Still have a question? We got you.",
  ],
  reachOut: {
    kicker: "Still have a question?",
    label: "Reach out.",
  },
};

export const faqItems: FaqItem[] = [
  {
    id: "join-hunt",
    question: "How do I join a Rush hunt?",
    answer: [
      "Follow our socials, watch for the drop announcement,",
      "and be first to scan the QR sticker when it appears.",
      "Locations and times will always be announced on Instagram.",
    ],
  },
  {
    id: "scanned-first",
    question: "What if someone scans it before me?",
    answer: [
      "Every sticker has one winner — the first scan takes the prize.",
      "New stickers drop regularly, so there is always another shot.",
    ],
  },
  {
    id: "entry-fee",
    question: "Is there an entry fee?",
    answer: [
      "Never. Rush hunts are free to join.",
      "All you need is to be in the right place at the right time.",
    ],
  },
  {
    id: "claim-prize",
    question: "How do I claim my prize?",
    answer: [
      "Scanning the winning sticker opens a claim form.",
      "Fill it in and we will be in touch within 48 hours to arrange handover.",
    ],
  },
  {
    id: "where-operate",
    question: "Where does Rush 5our operate?",
    answer: [
      "We are running hunts across Orlando right now,",
      "with new cities opening up as the movement grows.",
    ],
  },
];
