"use client";

/**
 * RUSH HUNTS — section 4, "Hunt map" (mockups/Rush Hunts/4.png; the live
 * map is Phase 2, 2A in RUSH5OUR-Implementation-Plan.md).
 *
 * The mockup's left-set statement — red tracked eyebrow with a rule, the
 * very wide two-colour headline, a tracked subline and three lines of copy —
 * then the hunt explorer:
 *
 *   • a filter row, All / Active / Upcoming / Past, each status chip
 *     carrying the mark its hunts wear on the map (the row is the legend),
 *     and "Near me", which asks for the visitor's location and sorts the
 *     list by distance
 *   • the live map (HuntMapCanvas.tsx, Mapbox) beside the list of hunts on
 *     a wide screen, above it on a phone. Picking a hunt in either one
 *     selects it in both: the map flies to it and opens its card, the list
 *     opens its row
 *   • the mockup's tracked closing line between two rules
 *
 * DATA: every hunt comes from `hunts` in data/hunts.ts — nothing here or in
 * the map knows a hunt of its own. The copy is `huntsMap` beside it.
 *
 * STATUS: worked out from each hunt's start and end (lib/hunts.ts). The
 * first render uses the page's render time, so it matches the server's
 * HTML; then the visitor's clock takes over, and a timer set for the next
 * start or end flips that hunt — badge, marker, filter counts — on the spot.
 *
 * TOKEN: the map needs NEXT_PUBLIC_MAPBOX_TOKEN (a public Mapbox token,
 * read at build time). Without one — or if the map fails to start — the
 * mockup's map artwork stands in, with a short note, and the list still
 * shows every hunt and its details.
 *
 * MOTION:
 *   • the eyebrow decodes as its rule draws, the headline's characters rise,
 *     the subline and copy lift
 *   • the filter chips lift in turn, the map and the list rise, the rows
 *     follow
 *   • the closing rules draw
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import { hunts as allHunts, huntsMap, type Hunt, type HuntFilter, type HuntStatus } from "@/data/hunts";
import {
  byStatusThenDate,
  describeWhen,
  formatMiles,
  huntTimes,
  milesBetween,
  nextStatusChange,
  withStatus,
  type LatLng,
  type LiveHunt,
} from "@/lib/hunts";
import styles from "./HuntsMap.module.css";

/** The live map: only fetched when there's a token to draw it with. */
const HuntMapCanvas = dynamic(() => import("./HuntMapCanvas"), {
  ssr: false,
  loading: () => <span className={styles.mapLoading} aria-hidden="true" />,
});

/** Read at build time; set it in .env.local and on the host. */
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

type Geo =
  | { state: "idle" }
  | { state: "locating" }
  | { state: "located"; at: LatLng }
  | { state: "denied" }
  | { state: "unavailable" };

const MARK_CLASS: Record<HuntStatus, string> = {
  active: styles.markActive,
  upcoming: styles.markUpcoming,
  ended: styles.markEnded,
};

const BADGE_CLASS: Record<HuntStatus, string> = {
  active: styles.badgeActive,
  upcoming: styles.badgeUpcoming,
  ended: styles.badgeEnded,
};

/** Long waits are re-checked hourly: a timer can't be set further out than
    ~24 days, and a sleeping laptop's timers run late. */
const MAX_WAIT = 60 * 60 * 1000;

/**
 * The hunts with their status, kept current: re-read at the next start or
 * end, and whenever the tab comes back into view. A new array only when a
 * status actually changes, so the map doesn't refit for nothing.
 */
function useLiveHunts(hunts: Hunt[], renderedAt: number): LiveHunt[] {
  const [state, setState] = useState(() => ({ source: hunts, live: withStatus(hunts, renderedAt) }));
  if (state.source !== hunts) setState({ source: hunts, live: withStatus(hunts, renderedAt) });

  useEffect(() => {
    let timer = 0;
    const tick = () => {
      const now = Date.now();
      const next = withStatus(hunts, now);
      setState((prev) =>
        prev.source === hunts &&
        prev.live.length === next.length &&
        prev.live.every((h, i) => h.id === next[i].id && h.status === next[i].status)
          ? prev
          : { source: hunts, live: next },
      );
      window.clearTimeout(timer);
      const at = nextStatusChange(hunts, now);
      // A beat past the moment, so the change has happened when we look.
      if (at !== null) timer = window.setTimeout(tick, Math.min(at - now + 500, MAX_WAIT));
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    timer = window.setTimeout(tick, 0);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [hunts]);

  return state.source === hunts ? state.live : withStatus(hunts, renderedAt);
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 22" aria-hidden="true">
      <path d="M1.5 11h21M13 2l9.5 9-9.5 9" />
    </svg>
  );
}

export function HuntsMap({ hunts: source = allHunts, renderedAt }: { hunts?: Hunt[]; renderedAt: number }) {
  const rootRef = useRef<HTMLElement>(null);
  const mapColRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const { ready, reduced, scrollTo } = useMotion();

  const [filter, setFilter] = useState<HuntFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [geo, setGeo] = useState<Geo>({ state: "idle" });
  const [mapFailed, setMapFailed] = useState(false);

  const c = huntsMap;
  const hunts = useLiveHunts(source, renderedAt);
  const live = MAPBOX_TOKEN !== "" && !mapFailed;
  const here = geo.state === "located" ? geo.at : null;

  /* --- what the list and the map show --------------------------------- */
  const counts = useMemo(() => {
    const n: Record<HuntFilter, number> = { all: hunts.length, active: 0, upcoming: 0, ended: 0 };
    for (const h of hunts) n[h.status] += 1;
    return n;
  }, [hunts]);

  const visible = useMemo(() => {
    const shown = hunts.filter((h) => filter === "all" || h.status === filter);
    if (here) return [...shown].sort((a, b) => milesBetween(here, a) - milesBetween(here, b));
    return [...shown].sort(byStatusThenDate);
  }, [hunts, filter, here]);

  /** A selection that the filter has hidden is no selection. */
  const selected = selectedId && visible.some((h) => h.id === selectedId) ? selectedId : null;

  useEffect(() => {
    if (!MAPBOX_TOKEN && process.env.NODE_ENV !== "production") {
      console.warn("[hunt map] NEXT_PUBLIC_MAPBOX_TOKEN is not set — showing the map artwork instead of the live map.");
    }
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    for (const h of source) {
      if (!huntTimes(h)) {
        console.warn(
          `[hunt map] "${h.id}" is hidden: startsAt/endsAt must be date-times with a UTC offset, e.g. "2026-11-07T20:00-05:00", and end after they start.`,
        );
      }
    }
  }, [source]);

  /* --- selection, from either side ------------------------------------ */
  /** From the list: select, and bring the map into view if it's off-screen
      (a phone, where the list sits under the map). */
  const selectFromList = (id: string) => {
    const next = selected === id ? null : id;
    setSelectedId(next);
    const col = mapColRef.current;
    if (next && live && col) {
      const r = col.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) scrollTo(col, 96);
    }
  };

  /** From the map: select, and scroll the list — only the list, never the
      page — to the row, where the list is its own scroll box. */
  const selectFromMap = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      const list = listRef.current;
      if (!id || !list || list.scrollHeight <= list.clientHeight + 1) return;
      const row = list.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`);
      if (row) list.scrollTo({ top: row.offsetTop - 8, behavior: reduced ? "auto" : "smooth" });
    },
    [reduced],
  );

  const onMapFail = useCallback(() => setMapFailed(true), []);

  /* --- near me ---------------------------------------------------------- */
  const locate = () => {
    if (!("geolocation" in navigator)) {
      setGeo({ state: "unavailable" });
      return;
    }
    setGeo({ state: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeo({ state: "located", at: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
      (err) => setGeo({ state: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable" }),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  };

  const geoNote =
    geo.state === "locating"
      ? c.near.locating
      : geo.state === "located"
        ? visible[0]
          ? c.near.located.replace("{n}", formatMiles(milesBetween(geo.at, visible[0])))
          : ""
        : geo.state === "denied"
          ? c.near.denied
          : geo.state === "unavailable"
            ? c.near.unavailable
            : "";

  /* --- motion ----------------------------------------------------------- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !ready) return;

    const q = gsap.utils.selector(root);

    if (reduced) {
      gsap.set(q("[data-a]"), { visibility: "visible" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(q("[data-a]"), { visibility: "visible" });

      /* --- statement ---------------------------------------------------- */
      const head = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.head}`)[0], start: "top 80%" },
      });
      head.fromTo(q(`.${styles.eyebrowRule}`), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: EASE_IO }, 0.2);
      const label = q(`.${styles.eyebrowLabel}`)[0] as HTMLElement | undefined;
      if (label) head.add(scramble(label, 0.9), 0.05);
      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(head, splitTitle(title), 0.2, 0.05);
      head.fromTo(
        q(`.${styles.subline}, .${styles.body}`),
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.12 },
        0.8,
      );

      /* --- explorer ----------------------------------------------------- */
      gsap
        .timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: q(`.${styles.explorer}`)[0], start: "top 82%" },
        })
        .fromTo(q(`.${styles.chip}`), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.07, clearProps: "transform" }, 0)
        .fromTo(q(`.${styles.mapCol}`), { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, clearProps: "transform" }, 0.15)
        .fromTo(q(`.${styles.listCol}`), { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, clearProps: "transform" }, 0.3)
        .fromTo(q(`.${styles.item}`), { x: -18, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, stagger: 0.07, clearProps: "transform" }, 0.55);

      /* --- foot --------------------------------------------------------- */
      gsap
        .timeline({ scrollTrigger: { trigger: q(`.${styles.foot}`)[0], start: "top 95%" } })
        .fromTo(q(`.${styles.footRule}`), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: EASE_IO }, 0)
        .fromTo(q(`.${styles.footLabel}`), { opacity: 0 }, { opacity: 1, duration: 1 }, 0.2);
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  const filterName = c.filters.find((f) => f.key === filter)?.label.toLowerCase() ?? "";

  return (
    <section ref={rootRef} id="hunt-map" className={styles.section} aria-labelledby="hunts-map-title">
      <div className={styles.atmos} aria-hidden="true" />

      <div className={`frame ${styles.frame}`}>
        {/* ---------------- Statement ---------------- */}
        <div className={styles.head}>
          <p className={styles.eyebrow}>
            <span className={`${styles.eyebrowLabel} f-sans cz caps`}>{c.eyebrow}</span>
            <span className={styles.eyebrowRule} aria-hidden="true" />
          </p>

          <h2 id="hunts-map-title" className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner">
                <span className={`${styles.word} ${styles.wordWhite} t-white`}>{c.titleWhite}</span>{" "}
                <span className={`${styles.word} ${styles.wordRed} t-red`}>{c.titleRed}</span>
              </span>
            </span>
          </h2>

          <p className={`${styles.subline} f-sans cz caps`} data-a>
            {c.subline}
          </p>

          <p className={`${styles.body} f-sans cz`} data-a>
            {c.body.map((line) => (
              <span key={line.text} className={line.strong ? styles.strong : undefined}>
                {line.text}
              </span>
            ))}
          </p>
        </div>

        {/* ---------------- Explorer ---------------- */}
        <div className={styles.explorer}>
          <div className={styles.controls}>
            {/* One flowing row: on a phone "Near me" sits beside the last filter
                rather than on a line of its own. */}
            <div className={styles.filters} role="group" aria-label="Filter and sort hunts">
              {c.filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`${styles.chip} f-sans caps`}
                  aria-pressed={filter === f.key}
                  onClick={() => setFilter(f.key)}
                  data-a
                >
                  {f.key !== "all" && <span className={`${styles.mark} ${MARK_CLASS[f.key]}`} aria-hidden="true" />}
                  <span>{f.label}</span>
                  <span className={styles.chipCount}>{counts[f.key]}</span>
                </button>
              ))}

              <button
                type="button"
                className={`${styles.chip} ${styles.near} f-sans caps`}
                onClick={locate}
                disabled={geo.state === "locating"}
                aria-pressed={geo.state === "located"}
                data-a
              >
                <svg className={styles.nearIcon} viewBox="0 0 26 26" aria-hidden="true">
                  <path d="M25.5 0.5 0.8 10.6l10.4 3.2 3.4 11.4z" />
                </svg>
                <span>{c.near.label}</span>
              </button>
            </div>
          </div>

          <p className={`${styles.geoNote} f-sans`} role="status" aria-live="polite">
            {geoNote}
          </p>

          <div className={styles.layout}>
            {/* ---- Map ---- */}
            <div ref={mapColRef} className={styles.mapCol} role="region" aria-label="Hunt map" data-a>
              {live ? (
                <HuntMapCanvas
                  token={MAPBOX_TOKEN}
                  hunts={visible}
                  selectedId={selected}
                  onSelect={selectFromMap}
                  user={here}
                  onFail={onMapFail}
                />
              ) : (
                <div className={styles.fallback}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.fallbackImg}
                    src={c.fallback.src}
                    width={c.fallback.width}
                    height={c.fallback.height}
                    alt={c.fallback.alt}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className={styles.fallbackNote}>
                    <strong className="f-display caps">{c.fallback.title}</strong>
                    <span className="f-sans">{c.fallback.body}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ---- List ---- */}
            <div className={styles.listCol} data-a>
              <div className={styles.listHead}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={styles.target} src="/assets/images/hunts-map-target.webp" width={80} height={80} alt="" aria-hidden="true" />
                <h3 className={`${styles.listTitle} f-display cz caps`}>
                  <span className={styles.slant}>
                    {c.list.titleWhite} <span className={styles.red}>{c.list.titleRed}</span>
                  </span>
                </h3>
              </div>

              {visible.length === 0 ? (
                <div className={`${styles.empty} f-sans`}>
                  <p>{hunts.length === 0 ? c.empty.none : c.empty.filtered.replace("{status}", filterName)}</p>
                  {hunts.length > 0 && (
                    <button type="button" className={`${styles.showAll} f-sans caps`} onClick={() => setFilter("all")}>
                      {c.empty.showAll}
                    </button>
                  )}
                </div>
              ) : (
                <ul ref={listRef} className={styles.list} aria-label="Hunts" data-lenis-prevent>
                  {visible.map((h) => {
                    const open = h.id === selected;
                    return (
                      <li key={h.id} id={`hunt-${h.id}`} data-id={h.id} className={`${styles.item} ${open ? styles.itemOpen : ""}`}>
                        <button
                          type="button"
                          className={styles.itemBtn}
                          aria-expanded={open}
                          aria-controls={`hunt-${h.id}-detail`}
                          onClick={() => selectFromList(h.id)}
                        >
                          <span className={`${styles.mark} ${MARK_CLASS[h.status]}`} aria-hidden="true" />
                          <span className={`${styles.itemTitle} f-cond caps`}>{h.title}</span>
                          <span className={`${styles.itemSide} f-sans`}>
                            {here ? formatMiles(milesBetween(here, h)) : <Arrow className={styles.itemArrow} />}
                          </span>
                          <span className={`${styles.itemMeta} f-sans`}>
                            <span className={`${styles.badge} ${BADGE_CLASS[h.status]} caps`}>{c.status[h.status]}</span>
                            {h.city} · {describeWhen(h)}
                          </span>
                        </button>
                        <div id={`hunt-${h.id}-detail`} className={`${styles.itemDetail} f-sans`} hidden={!open}>
                          <p>{h.description}</p>
                          {h.reward && (
                            <p className={styles.itemReward}>
                              <span className="caps">{c.labels.reward}</span> <strong>{h.reward}</strong>
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* ---------------- Foot ---------------- */}
          <p className={styles.foot}>
            <span className={`${styles.footRule} ${styles.footL}`} aria-hidden="true" data-a />
            <span className={`${styles.footLabel} f-sans cz caps`} data-a>
              {c.foot}
            </span>
            <span className={`${styles.footRule} ${styles.footR}`} aria-hidden="true" data-a />
          </p>
        </div>
      </div>
    </section>
  );
}

export default HuntsMap;
