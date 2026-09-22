/**
 * SOCIAL ICONS — inline SVG so they inherit `currentColor` and cost no
 * requests. Keyed by the `icon` field on `socialLinks` in data/site.ts.
 */

import type { SocialLink } from "@/data/site";

type IconName = SocialLink["icon"];

const ICONS: Record<IconName, React.ReactNode> = {
  instagram: (
    <>
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.6" cy="6.4" r="1.25" fill="currentColor" />
    </>
  ),
  tiktok: (
    <path
      fill="currentColor"
      d="M16.5 2h-3v13.2a2.6 2.6 0 1 1-2.1-2.55V9.5a5.7 5.7 0 1 0 5.1 5.67V8.9a6.9 6.9 0 0 0 4 1.28V7.1a4 4 0 0 1-4-4.1z"
    />
  ),
  youtube: (
    <>
      <rect
        x="2"
        y="4.8"
        width="20"
        height="14.4"
        rx="4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path fill="currentColor" d="M10.2 8.9v6.2l5.4-3.1z" />
    </>
  ),
  x: (
    <path
      fill="currentColor"
      d="M17.2 2.5h3.3l-7.2 8.2 8.5 10.8h-6.7l-5.2-6.6-6 6.6H.6l7.7-8.8L.2 2.5h6.9l4.7 6.1zm-1.2 17.1h1.8L7.9 4.3H6z"
    />
  ),
};

export interface SocialIconProps {
  name: IconName;
  className?: string;
}

export function SocialIcon({ name, className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

export default SocialIcon;
