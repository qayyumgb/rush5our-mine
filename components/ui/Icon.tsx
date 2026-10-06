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
  | "kebab"
  | "target"
  | "smile"
  | "star"
  | "scope"
  | "check"
  | "trophy"
  | "video"
  | "heart"
  | "growth"
  | "send"
  | "handshake"
  | "cloudUp"
  | "user"
  | "at"
  | "tag"
  | "pencil"
  | "clockGear"
  | "instagram"
  | "tiktok"
  | "youtubeSolid";

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

  /** A QR code: three finder squares and a scatter of modules. */
  qr: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <rect className={S} x="2" y="2" width="8" height="8" rx=".8" />
        <rect x="4.5" y="4.5" width="3" height="3" fill="currentColor" />
        <rect className={S} x="14" y="2" width="8" height="8" rx=".8" />
        <rect x="16.5" y="4.5" width="3" height="3" fill="currentColor" />
        <rect className={S} x="2" y="14" width="8" height="8" rx=".8" />
        <rect x="4.5" y="16.5" width="3" height="3" fill="currentColor" />
        <path
          d="M13 13h2v2h-2zM17 13h2v2h-2zM20 15h2v2h-2zM14 17h2v2h-2zM17 19h3v3h-3zM12 20h2v2h-2z"
          fill="currentColor"
        />
        <path className={S} d="M12 2v7M12 16v2M2.5 12h3M9 12h2" />
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

  /** Bullseye with an arrow landing from the upper right — "challenges". */
  target: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <path className={S} d="M20.9 9.8a9.5 9.5 0 1 1-6.7-6.7" />
        <path className={S} d="M17.3 11.2a5.5 5.5 0 1 1-4.5-4.5" />
        <circle className={S} cx="12" cy="12" r="1.4" />
        <path className={S} d="M12 12l7.3-7.3M19.3 4.7V1.6M19.3 4.7h3.1" />
      </>
    ),
  },

  /** Round face — "good energy". */
  smile: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <circle className={S} cx="12" cy="12" r="9.5" />
        <path className={S} d="M8.6 9.2v.5M15.4 9.2v.5" />
        <path className={S} d="M7.6 14.2c1.1 1.9 2.6 2.9 4.4 2.9s3.3-1 4.4-2.9" />
      </>
    ),
  },

  /** Five-point outline — "a bigger purpose". */
  star: {
    viewBox: "0 0 24 24",
    render: (
      <path
        className={S}
        d="M12 2.3l2.7 6.78 7.29.48-5.62 4.66 1.8 7.07L12 17.4l-6.17 3.89 1.8-7.07L2.01 9.56l7.29-.48z"
      />
    ),
  },

  /** Circle-in-circle reticle with crosshairs past the ring — "the vision". */
  scope: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <circle className={S} cx="12" cy="12" r="9" />
        <circle className={S} cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.3" fill="currentColor" />
        <path className={S} d="M12 0v2.4M12 21.6V24M0 12h2.4M21.6 12H24" />
      </>
    ),
  },

  /** Heavy tick — the checked list on the About page. */
  check: {
    viewBox: "0 0 24 24",
    render: <path className={S} d="M5.5 12.6l4.3 4.3L18.6 7.4" />,
  },

  /** Cup on a plinth — "unforgettable moments". */
  trophy: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <path className={S} d="M7 3.5h10v6.5a5 5 0 0 1-10 0z" />
        <path className={S} d="M7 5H4.2a.7.7 0 0 0-.7.7c0 2.6 1.5 4.3 3.5 4.3M17 5h2.8a.7.7 0 0 1 .7.7c0 2.6-1.5 4.3-3.5 4.3" />
        <path className={S} d="M12 15v3.5M8.5 21h7M9.5 18.5h5v2.5h-5z" />
      </>
    ),
  },

  /** Rounded frame with a play glyph — "content". */
  video: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <rect className={S} x="2.5" y="4.5" width="19" height="15" rx="2.2" />
        <path d="M10 8.6v6.8l5.6-3.4z" fill="currentColor" />
      </>
    ),
  },

  heart: {
    viewBox: "0 0 24 24",
    render: (
      <path
        className={S}
        d="M12 20.2S3.2 14.6 3.2 8.9A4.4 4.4 0 0 1 12 6.8a4.4 4.4 0 0 1 8.8 2.1c0 5.7-8.8 11.3-8.8 11.3z"
      />
    ),
  },

  /** Three rising bars with an arrow over them — "built for real people". */
  growth: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <path className={S} d="M3.5 21.5v-5.5h4v5.5zM10 21.5v-9h4v9zM16.5 21.5V9h4v12.5z" />
        <path className={S} d="M3.5 11.5l6-5.5 4.5 3.5L21 3.5M17 3.5h4v4" />
      </>
    ),
  },

  /** Paper plane — "submit a find". */
  send: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <path className={S} d="M2.5 12.2 21.5 3.4 15.6 21.5l-3.9-6.4z" />
        <path className={S} d="M11.7 15.1 21.5 3.4" />
      </>
    ),
  },

  /** Two clasped hands — "collaborations". */
  handshake: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <path className={S} d="m11 17 2 2a1 1 0 1 0 3-3" />
        <path
          className={S}
          d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"
        />
        <path className={S} d="m21 3 1 11h-2M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3M3 4h8" />
      </>
    ),
  },

  /** Cloud with an upward arrow — "submit content". */
  cloudUp: {
    viewBox: "0 0 32 28",
    render: (
      <>
        <path className={S} d="M9 22.5H8a5.5 5.5 0 0 1-.6-11 7.5 7.5 0 0 1 14.4-1.6A5.5 5.5 0 0 1 24 22.5h-1" />
        <path className={S} d="M16 26.5V12.5M11 17.5l5-5 5 5" />
      </>
    ),
  },

  /** Head and shoulders — the name field. */
  user: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <circle className={S} cx="12" cy="7.5" r="4.5" />
        <path className={S} d="M3.5 21.5c0-4.7 3.8-7.5 8.5-7.5s8.5 2.8 8.5 7.5z" />
      </>
    ),
  },

  /** Price tag on a tilt — the subject field. */
  /** Commercial at — the username field. */
  at: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <circle className={S} cx="12" cy="12" r="4.3" />
        <path className={S} d="M16.3 12v1.7a2.7 2.7 0 0 0 5.4 0V12a9.7 9.7 0 1 0-3.9 7.8" />
      </>
    ),
  },

  tag: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <path className={S} d="M2.5 12.6V4a1.5 1.5 0 0 1 1.5-1.5h8.6a2 2 0 0 1 1.4.6l7.4 7.4a2 2 0 0 1 0 2.8l-7.2 7.2a2 2 0 0 1-2.8 0L3.1 14a2 2 0 0 1-.6-1.4z" />
        <circle cx="7.3" cy="7.3" r="1.5" fill="currentColor" />
      </>
    ),
  },

  /** Pencil — the message field. */
  pencil: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <path className={S} d="M4 20l1-4.5L16.6 3.9a2 2 0 0 1 2.8 0l.7.7a2 2 0 0 1 0 2.8L8.5 19z" />
        <path className={S} d="M14.6 5.9l3.5 3.5M5 15.5l3.5 3.5" />
      </>
    ),
  },

  /** Clock face inside a cog — "response time". */
  clockGear: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <path
          className={S}
          d="M12 2.5l1.6 1.9 2.4-.7.8 2.3 2.4.8-.7 2.4 1.9 1.6-1.9 1.6.7 2.4-2.4.8-.8 2.3-2.4-.7L12 21.5l-1.6-1.9-2.4.7-.8-2.3-2.4-.8.7-2.4L3.6 12l1.9-1.6-.7-2.4 2.4-.8.8-2.3 2.4.7z"
        />
        <circle className={S} cx="12" cy="12" r="4.6" />
        <path className={S} d="M12 9.6V12l1.7 1.2" />
      </>
    ),
  },

  instagram: {
    viewBox: "0 0 24 24",
    render: (
      <>
        <rect className={S} x="2.5" y="2.5" width="19" height="19" rx="5.5" />
        <circle className={S} cx="12" cy="12" r="4.4" />
        <circle cx="17.6" cy="6.4" r="1.25" fill="currentColor" />
      </>
    ),
  },

  /** Filled, unlike the stroked set: the mark is a solid shape. */
  tiktok: {
    viewBox: "4 1.5 17 20",
    render: (
      <path
        fill="currentColor"
        d="M16.5 2h-3v13.2a2.6 2.6 0 1 1-2.1-2.55V9.5a5.7 5.7 0 1 0 5.1 5.67V8.9a6.9 6.9 0 0 0 4 1.28V7.1a4 4 0 0 1-4-4.1z"
      />
    ),
  },

  /** Filled tile with a cut-out play triangle. */
  youtubeSolid: {
    viewBox: "1 4 22 16",
    render: (
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M2 9.2A4.2 4.2 0 0 1 6.2 5h11.6A4.2 4.2 0 0 1 22 9.2v5.6a4.2 4.2 0 0 1-4.2 4.2H6.2A4.2 4.2 0 0 1 2 14.8zm8.2-.3v6.2l5.4-3.1z"
      />
    ),
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
