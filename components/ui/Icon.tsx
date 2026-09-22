/**
 * ICON SET — every line icon used across the page, in one registry.
 *
 * Paths carry the `i-stroke` class, which does two jobs: it applies the red
 * stroke styling, and it marks the path for `prepareStrokes`, so the motion
 * system can draw each icon on rather than fading it in.
 *
 * Adding an icon: add an entry here with its own viewBox. Nothing else needs
 * to change — cards and feature grids look icons up by name from their data
 * files, so a content change can introduce one without a code change.
 */

export type IconName =
  | "play"
  | "qr"
  | "community"
  | "globe"
  | "diamond"
  | "gift"
  | "bolt"
  | "envelope"
  | "eye"
  | "lock"
  | "chevronRight"
  | "arrowRight"
  | "kebab";

interface IconSpec {
  viewBox: string;
  render: React.ReactNode;
}

const S = "i-stroke";

export const ICONS: Record<IconName, IconSpec> = {
  /** Solid triangle — the only filled icon; play needs the weight. */
  play: {
    viewBox: "0 0 24 24",
    render: <path d="M8.5 5.8v12.4l9.8-6.2z" fill="currentColor" />,
  },

  qr: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <path
          className={S}
          d="M2.5 7.5V4a1.5 1.5 0 0 1 1.5-1.5h3.5M16.5 2.5H20A1.5 1.5 0 0 1 21.5 4v3.5M21.5 16.5V20a1.5 1.5 0 0 1-1.5 1.5h-3.5M7.5 21.5H4A1.5 1.5 0 0 1 2.5 20v-3.5"
        />
        <rect className={S} x="7" y="7" width="4" height="4" rx=".6" />
        <rect className={S} x="13" y="7" width="4" height="4" rx=".6" />
        <rect className={S} x="7" y="13" width="4" height="4" rx=".6" />
        <rect className={S} x="13" y="13" width="4" height="4" rx=".6" />
      </>
    ),
  },

  /** A trio of figures — one forward, two behind. */
  community: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <circle className={S} cx="12" cy="8.5" r="3" />
        <path className={S} d="M6.5 19c0-3.2 2.5-5.4 5.5-5.4s5.5 2.2 5.5 5.4z" />
        <path className={S} d="M6.3 7.6a2.2 2.2 0 1 0 0 4.3M1.2 17.5c0-2.3 1.6-4 3.8-4" />
        <path className={S} d="M17.7 7.6a2.2 2.2 0 1 1 0 4.3M22.8 17.5c0-2.3-1.6-4-3.8-4" />
      </>
    ),
  },

  globe: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <circle className={S} cx="12" cy="12" r="9.5" />
        <ellipse className={S} cx="12" cy="12" rx="4.2" ry="9.5" />
        <path className={S} d="M2.5 12h19M4.2 6.6h15.6M4.2 17.4h15.6" />
      </>
    ),
  },

  diamond: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <path className={S} d="M6.2 2.5h11.6l4.7 6-10.5 13L1.5 8.5z" />
        <path className={S} d="M1.5 8.5h21M9.5 2.5 7.3 8.5 12 21.5l4.7-13-2.2-6" />
      </>
    ),
  },

  gift: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <rect className={S} x="2.5" y="8.5" width="19" height="5" rx="1" />
        <path className={S} d="M4.2 13.5v8h15.6v-8M12 8.5v13" />
        <path
          className={S}
          d="M12 8.5S10.6 2.5 7.8 2.5a2.6 2.6 0 0 0 0 6zM12 8.5s1.4-6 4.2-6a2.6 2.6 0 0 1 0 6z"
        />
      </>
    ),
  },

  bolt: {
    viewBox: "0 0 24 24",
    render: <path className={S} d="M14.5 1.8 4.6 13.4h6.1l-1.2 8.8 9.9-11.6h-6.1z" />,
  },

  envelope: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <rect className={S} x="1.8" y="4.5" width="20.4" height="15" rx="1.6" />
        <path className={S} d="m2.4 5.6 9.6 7.6 9.6-7.6" />
      </>
    ),
  },

  eye: {
    viewBox: "0 0 28 19",
    render: (
      <>
        <path
          className={S}
          d="M1.5 9.5C5 3.8 9.2 1.5 14 1.5s9 2.3 12.5 8c-3.5 5.7-7.7 8-12.5 8s-9-2.3-12.5-8z"
        />
        <circle className={S} cx="14" cy="9.5" r="4" />
      </>
    ),
  },

  lock: {
    viewBox: "0 0 26 32",
    render: (
      <>
        <path className={S} d="M6 14V9a7 7 0 0 1 14 0v5" />
        <rect className={S} x="1.5" y="14" width="23" height="16.5" rx="2.5" />
      </>
    ),
  },

  chevronRight: {
    viewBox: "0 0 11 25",
    render: <path className={S} d="M1.5 1.5l8 11-8 11" />,
  },

  arrowRight: {
    viewBox: "0 0 22 18",
    render: <path className={S} d="M1 9h19M12 1.5l8 7.5-8 7.5" />,
  },

  /** Three dots — the "more options" affordance on video cards. */
  kebab: {
    viewBox: "0 0 5 24",
    render: (
      <>
        <circle cx="2.5" cy="2.5" r="2.3" fill="currentColor" />
        <circle cx="2.5" cy="12" r="2.3" fill="currentColor" />
        <circle cx="2.5" cy="21.5" r="2.3" fill="currentColor" />
      </>
    ),
  },
};

export interface IconProps {
  name: IconName;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  const spec = ICONS[name];
  return (
    <svg className={className} viewBox={spec.viewBox} aria-hidden="true">
      {spec.render}
    </svg>
  );
}

export default Icon;
