/**
 * SITE-WIDE CONTENT — brand strings, navigation, socials, footer.
 *
 * ▸ BACKEND SEAM
 *   Everything here is a plain object so it can be swapped for a CMS/API
 *   response without touching a component. When that happens, replace the
 *   exported constants with an async loader (e.g. `getSiteContent()`) and
 *   pass the result down as props — the components are already prop-driven.
 */

export interface NavLink {
  label: string;
  /** In-page anchor or a route. */
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  /** Key matched against the icon map in components/ui/SocialIcon.tsx */
  icon: "instagram" | "tiktok" | "youtube" | "x";
}

export const site = {
  name: "RUSH 5OUR",
  /** Split for the two-tone wordmark: white "RUSH" + red "5OUR". */
  wordmark: { light: "RUSH", accent: "5OUR" },
  mark: "R5",
  tagline: "More than merch. A culture.",
  description:
    "RUSH 5OUR — a movement built through content, community, challenges, prizes and unforgettable moments.",
  url: "https://rush5our.com",
} as const;

/** Drawer navigation. Anchors match the section ids rendered on the homepage. */
export const navLinks: NavLink[] = [
  { label: "The concept", href: "#concept" },
  { label: "Merch", href: "#merch" },
  { label: "Videos", href: "#videos" },
  { label: "The movement", href: "#culture" },
  { label: "FAQ", href: "#faq" },
];

/**
 * SOCIALS — rendered in both the footer and the nav drawer, in this order
 * (which matches mockup 6).
 *
 * URLs are stored canonically, with the share-tracking parameters stripped:
 * `?si=`, `?igsh=`, `?_r=&_t=`, `?s=`. Those identify the device and session
 * of whoever copied the link, so they do not belong in the repository — and
 * every profile resolves without them.
 */
export const socialLinks: SocialLink[] = [
  { label: "Instagram", href: "https://www.instagram.com/rush5our", icon: "instagram" },
  { label: "TikTok", href: "https://www.tiktok.com/@rush5our", icon: "tiktok" },
  { label: "YouTube", href: "https://www.youtube.com/@RUSH5OUR", icon: "youtube" },
  { label: "X", href: "https://x.com/RUSH5OUR", icon: "x" },
];

/** Footer utility links. */
export const footerLinks: NavLink[] = [
  { label: "Shop", href: "#merch" },
  { label: "Contact", href: "#contact" },
  { label: "Terms", href: "#" },
  { label: "Privacy", href: "#" },
];
