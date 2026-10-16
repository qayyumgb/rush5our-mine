/**
 * HUNT MAP — small helpers shared by the list and the map card.
 *
 * STATUS: a hunt's status is never stored — it follows from its start and
 * end times and the clock. Before `startsAt` it is upcoming, until `endsAt`
 * it is active, after that it has ended. HuntsMap.tsx re-reads the clock at
 * each start or end, so a hunt goes live, or ends, on an open page without
 * a reload or a redeploy.
 */

import { huntsMap, type Hunt, type HuntStatus } from "@/data/hunts";

export interface LatLng {
  lat: number;
  lng: number;
}

/** A hunt with its status as of a given moment. */
export type LiveHunt = Hunt & { status: HuntStatus };

/** Great-circle distance in miles (haversine). */
export function milesBetween(a: LatLng, b: LatLng): number {
  const R = 3958.8;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** "0.4 mi", "12 mi", "1,204 mi". */
export function formatMiles(miles: number): string {
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles).toLocaleString("en-US")} mi`;
}

/* --- times and status ---------------------------------------------------- */

/**
 * A date-time with its UTC offset: "2026-10-18T18:00-04:00". The offset is
 * required — without one the server and each visitor's browser would read
 * the same time differently.
 */
const ISO_WITH_OFFSET = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/;

function instant(iso: string): number | null {
  if (!ISO_WITH_OFFSET.test(iso)) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
}

/** The hunt's start and end in epoch ms, or null if either is malformed or
    the hunt ends before it starts. */
export function huntTimes(h: Hunt): { start: number; end: number } | null {
  const start = instant(h.startsAt);
  const end = instant(h.endsAt);
  if (start === null || end === null || end <= start) return null;
  return { start, end };
}

/** The hunt's status at `now` (epoch ms); null for a hunt with bad times. */
export function huntStatus(h: Hunt, now: number): HuntStatus | null {
  const t = huntTimes(h);
  if (!t) return null;
  if (now < t.start) return "upcoming";
  if (now < t.end) return "active";
  return "ended";
}

/** Every hunt with its status at `now`. A hunt with bad times is left out
    (HuntsMap warns about it in development). */
export function withStatus(hunts: Hunt[], now: number): LiveHunt[] {
  const out: LiveHunt[] = [];
  for (const h of hunts) {
    const status = huntStatus(h, now);
    if (status) out.push({ ...h, status });
  }
  return out;
}

/** The next start or end after `now` — when some hunt's status changes —
    or null if every hunt has ended. */
export function nextStatusChange(hunts: Hunt[], now: number): number | null {
  let next: number | null = null;
  for (const h of hunts) {
    const t = huntTimes(h);
    if (!t) continue;
    for (const at of [t.start, t.end]) if (at > now && (next === null || at < next)) next = at;
  }
  return next;
}

/* --- display ------------------------------------------------------------- */

/**
 * The hunt's own local time, read straight from the string: "Nov 7, 8 PM"
 * from "2026-11-07T20:00-05:00", wherever the visitor is — the time on the
 * sticker's street is the one that matters. `withYear` for past hunts:
 * "Sep 27, 2026".
 */
function wallClock(iso: string, withYear: boolean): string {
  const m = ISO_WITH_OFFSET.exec(iso);
  if (!m) return iso;
  const [, y, mo, d, h, mi] = m.map(Number);
  const at = new Date(Date.UTC(y, mo - 1, d, h, mi));
  const date = at.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
  if (withYear) return date;
  const time = at.toLocaleTimeString("en-US", {
    hour: "numeric",
    ...(mi ? { minute: "2-digit" } : {}),
    timeZone: "UTC",
  });
  return `${date}, ${time}`;
}

/** "Starts Nov 7, 8 PM", "Ends Oct 20, 9 PM", "Ended Sep 27, 2026". */
export function describeWhen(h: LiveHunt): string {
  const when = huntsMap.when[h.status];
  if (h.status === "upcoming") return when.replace("{date}", wallClock(h.startsAt, false));
  if (h.status === "active") return when.replace("{date}", wallClock(h.endsAt, false));
  return when.replace("{date}", wallClock(h.endsAt, true));
}

const STATUS_ORDER: Record<HuntStatus, number> = { active: 0, upcoming: 1, ended: 2 };

/**
 * The list's default order: live hunts first (ending soonest first), then
 * what's next (starting soonest first), then the past (most recent first).
 */
export function byStatusThenDate(a: LiveHunt, b: LiveHunt): number {
  if (a.status !== b.status) return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
  const ta = huntTimes(a);
  const tb = huntTimes(b);
  if (!ta || !tb) return 0;
  if (a.status === "active") return ta.end - tb.end;
  if (a.status === "upcoming") return ta.start - tb.start;
  return tb.end - ta.end;
}
