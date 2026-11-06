/**
 * EARLY ACCESS PAGE — the merch drop's QR landing page (app/early-access,
 * served at https://join.rush5our.com).
 *
 * The copy is the client's, word for word. Sign-ups go through the Join
 * the Movement backend (app/api/subscribe) tagged "Early Access / Merch
 * Drop".
 */

export interface EarlyAccessContent {
  kicker: string;
  /** The headline in three lines; `red` lines are set in the brand red. */
  title: { text: string; red?: boolean }[];
  body: string;
  fields: { name: string; email: string };
  button: { label: string; busy: string };
  tagline: string;
  success: { title: string; body: string };
  /** For search engines and link previews only; the page itself is noindex. */
  meta: { title: string; description: string };
}

export const earlyAccess: EarlyAccessContent = {
  kicker: "Early access",
  title: [{ text: "Our first ever" }, { text: "merch drop", red: true }, { text: "is coming!" }],
  body:
    "Be part of the movement from day one. We’re getting ready to release our first-ever RUSH 5OUR merch collection, including our exclusive Mr. Crossland shirt. Join our Early Access List to be among the first to know when the collection officially drops!",
  fields: { name: "Name", email: "Email" },
  button: { label: "Join the early access list", busy: "Joining…" },
  tagline: "Be First. Stay Exclusive. Build the Movement.",
  success: {
    title: "You’re on the list!",
    body: "Welcome to the movement. We’ll notify you when RUSH 5OUR merch officially drops!",
  },
  meta: {
    title: "Early Access",
    description: "Our first ever merch drop is coming. Join the RUSH 5OUR Early Access List to be among the first to know.",
  },
};
