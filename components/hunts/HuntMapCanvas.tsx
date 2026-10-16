"use client";

/**
 * HUNT MAP — the live map (Mapbox GL JS), loaded only when a token exists.
 *
 * HuntsMap.tsx imports this with `next/dynamic` and `ssr: false`, so Mapbox
 * and its stylesheet are fetched only on pages that actually draw a map.
 *
 *   • style   Mapbox's dark base, recoloured on load to the brand: near-
 *             black land, darker water, grey streets with highways in a
 *             deep red, quiet grey labels
 *   • hunts   one GeoJSON source, clustered: close hunts collapse into a
 *             red counter that zooms in when clicked; single hunts are red
 *             R5 tiles (HTML markers, so they're real, focusable buttons)
 *   • card    one popup at a time, built from DOM nodes with textContent —
 *             never HTML strings — showing the hunt's photo, status, title,
 *             place and date, description and reward
 *   • sync    `selectedId` in → fly there and open its card; a marker click
 *             or the card's close out → `onSelect`
 *
 * If the map can't start — no WebGL, a bad token, the style refusing to
 * load — it calls `onFail` and HuntsMap.tsx shows the fallback artwork; the
 * list keeps working.
 */

import "mapbox-gl/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import type { FeatureCollection, Point } from "geojson";
import type { GeoJSONSource, Map as MapboxMap, Marker, Popup } from "mapbox-gl";
import { huntsMap, type HuntStatus } from "@/data/hunts";
import { describeWhen, type LatLng, type LiveHunt } from "@/lib/hunts";
import styles from "./HuntsMap.module.css";

type MapboxGL = typeof import("mapbox-gl").default;

export interface HuntMapCanvasProps {
  token: string;
  /** The hunts to show — already filtered and ordered by the parent,
      each with its current status. */
  hunts: LiveHunt[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** The visitor, once "Near me" has found them. */
  user: LatLng | null;
  onFail: () => void;
}

const SOURCE = "hunts";
/** Where the map opens before it has fitted itself to the hunts. */
const START: [number, number] = [-81.38, 28.54];
/** Close hunts cluster up to this zoom; a selected hunt flies past it. */
const CLUSTER_MAX_ZOOM = 11;
const FOCUS_ZOOM = 13.5;

const MARKER_CLASS: Record<HuntStatus, string> = {
  active: styles.markerActive,
  upcoming: styles.markerUpcoming,
  ended: styles.markerEnded,
};

const BADGE_CLASS: Record<HuntStatus, string> = {
  active: styles.badgeActive,
  upcoming: styles.badgeUpcoming,
  ended: styles.badgeEnded,
};

function toGeoJSON(hunts: LiveHunt[]): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: hunts.map((h) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [h.lng, h.lat] },
      properties: { id: h.id, status: h.status },
    })),
  };
}

/** Recolours Mapbox's dark base to the brand. Every step is optional: a
    layer this style doesn't have is skipped. */
function brand(map: MapboxMap) {
  const layers = map.getStyle()?.layers ?? [];
  const paint = (id: string, prop: string, value: unknown) => {
    try {
      map.setPaintProperty(id, prop as never, value as never);
    } catch {
      // Not a property this layer has; leave it.
    }
  };
  for (const l of layers) {
    const id = l.id;
    if (l.type === "background") paint(id, "background-color", "#070707");
    else if (l.type === "fill") {
      if (/water/.test(id)) paint(id, "fill-color", "#0e0f11");
      else if (/building/.test(id)) paint(id, "fill-color", "#121214");
      else paint(id, "fill-color", "#0a0a0b");
    } else if (l.type === "line") {
      if (/water/.test(id)) paint(id, "line-color", "#0e0f11");
      else if (/motorway|trunk/.test(id)) paint(id, "line-color", "#4a0b10");
      else if (/admin|boundary/.test(id)) paint(id, "line-color", "#2a2a2d");
      else if (/road|street|bridge|tunnel|path|rail/.test(id)) paint(id, "line-color", "#1d1d20");
    } else if (l.type === "symbol") {
      paint(id, "text-color", "#8a8a8d");
      paint(id, "text-halo-color", "#050505");
    }
  }
}

/** The map card. DOM nodes and textContent only: hunt text is data, never markup. */
function card(hunt: LiveHunt): HTMLElement {
  const el = (tag: string, className?: string, text?: string) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const root = el("div", styles.popupCard);
  if (hunt.image) {
    const img = el("img", styles.popupImg) as HTMLImageElement;
    img.src = hunt.image;
    img.alt = "";
    img.decoding = "async";
    root.append(img);
  }
  const body = el("div", styles.popupBody);
  body.append(
    el("span", `${styles.badge} ${BADGE_CLASS[hunt.status]} f-sans caps`, huntsMap.status[hunt.status]),
    el("h3", `${styles.popupTitle} f-display caps`, hunt.title),
    el("p", `${styles.popupMeta} f-sans`, `${hunt.city} · ${describeWhen(hunt)}`),
    el("p", `${styles.popupDesc} f-sans`, hunt.description),
  );
  if (hunt.reward) {
    const reward = el("p", `${styles.popupReward} f-sans`);
    reward.append(el("span", "caps", huntsMap.labels.reward), el("strong", undefined, hunt.reward));
    body.append(reward);
  }
  root.append(body);
  return root;
}

export default function HuntMapCanvas({ token, hunts, selectedId, onSelect, user, onFail }: HuntMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const glRef = useRef<MapboxGL | null>(null);
  const markersRef = useRef(new Map<string, Marker>());
  const shownRef = useRef(new Set<string>());
  const popupRef = useRef<Popup | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);
  /** Set while the code (not the visitor) closes the card. */
  const closingRef = useRef(false);
  const [loaded, setLoaded] = useState(false);

  // The latest props, for map callbacks registered once.
  const huntsRef = useRef(hunts);
  const onSelectRef = useRef(onSelect);
  const onFailRef = useRef(onFail);
  const selectedRef = useRef(selectedId);
  useEffect(() => {
    huntsRef.current = hunts;
    onSelectRef.current = onSelect;
    onFailRef.current = onFail;
    selectedRef.current = selectedId;
  });

  /* --- start the map, once ------------------------------------------- */
  useEffect(() => {
    let cancelled = false;
    const markers = markersRef.current;
    const shown = shownRef.current;

    const fit = (map: MapboxMap, gl: MapboxGL, points: [number, number][]) => {
      if (points.length === 0) return;
      if (points.length === 1) {
        map.easeTo({ center: points[0], zoom: 12, duration: 800 });
        return;
      }
      const bounds = new gl.LngLatBounds(points[0], points[0]);
      for (const p of points) bounds.extend(p);
      map.fitBounds(bounds, { padding: 64, maxZoom: 12, duration: 800 });
    };

    /** Adds a marker for every single (unclustered) hunt in view, and
        removes the ones that are clustered or gone. */
    const syncMarkers = (map: MapboxMap, gl: MapboxGL) => {
      if (!map.getSource(SOURCE) || !map.isSourceLoaded(SOURCE)) return;
      const seen = new Set<string>();
      for (const f of map.querySourceFeatures(SOURCE)) {
        const p = f.properties as { id?: string; cluster?: boolean } | null;
        if (!p || p.cluster || !p.id || seen.has(p.id)) continue;
        seen.add(p.id);
        const hunt = huntsRef.current.find((h) => h.id === p.id);
        if (!hunt) continue;
        let marker = markers.get(p.id);
        if (!marker) {
          const el = document.createElement("button");
          el.type = "button";
          el.className = styles.marker;
          const tile = document.createElement("span");
          tile.className = `${styles.markerTile} f-display`;
          tile.textContent = "R5";
          el.append(tile);
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            onSelectRef.current(hunt.id);
          });
          marker = new gl.Marker({ element: el, anchor: "bottom" }).setLngLat([hunt.lng, hunt.lat]);
          markers.set(p.id, marker);
        }
        // The status can change while the page is open (a hunt goes live),
        // so its mark and label are set every time, not only at creation.
        const el = marker.getElement();
        for (const s of Object.keys(MARKER_CLASS) as HuntStatus[]) el.classList.toggle(MARKER_CLASS[s], s === hunt.status);
        el.setAttribute("aria-label", `${hunt.title} — ${huntsMap.status[hunt.status]}`);
        el.classList.toggle(styles.markerSelected, selectedRef.current === p.id);
        if (!shown.has(p.id)) {
          marker.addTo(map);
          shown.add(p.id);
        }
      }
      for (const id of [...shown]) {
        if (!seen.has(id)) {
          markers.get(id)?.remove();
          shown.delete(id);
        }
      }
    };

    (async () => {
      let gl: MapboxGL;
      try {
        gl = (await import("mapbox-gl")).default;
      } catch {
        if (!cancelled) onFailRef.current();
        return;
      }
      const container = containerRef.current;
      if (cancelled || !container) return;

      let map: MapboxMap;
      try {
        map = new gl.Map({
          container,
          accessToken: token,
          style: "mapbox://styles/mapbox/dark-v11",
          center: START,
          zoom: 9,
          projection: "mercator",
          // One finger / a plain wheel scrolls the page; two fingers or
          // Ctrl + wheel move the map — the map never traps the scroll.
          cooperativeGestures: true,
          dragRotate: false,
          pitchWithRotate: false,
          attributionControl: false,
        });
      } catch {
        onFailRef.current();
        return;
      }
      glRef.current = gl;
      mapRef.current = map;

      map.touchZoomRotate.disableRotation();
      // Bottom right, so an open card (which rises above its marker) never sits
      // over the zoom buttons.
      map.addControl(new gl.NavigationControl({ showCompass: false }), "bottom-right");
      // Mapbox's terms require the attribution; kept, but compact.
      map.addControl(new gl.AttributionControl({ compact: true }), "bottom-right");

      // An error before the map has loaded (a bad token, a blocked style)
      // means there's no map to show. After that, a missed tile is just
      // logged.
      let ready = false;
      map.on("error", (e) => {
        if (ready) {
          console.warn("[hunt map]", e.error?.message ?? e);
          return;
        }
        console.error("[hunt map] could not load:", e.error?.message ?? e);
        if (!cancelled) onFailRef.current();
      });

      map.on("load", () => {
        if (cancelled) return;
        ready = true;
        brand(map);

        map.addSource(SOURCE, {
          type: "geojson",
          data: toGeoJSON(huntsRef.current),
          cluster: true,
          clusterMaxZoom: CLUSTER_MAX_ZOOM,
          clusterRadius: 48,
        });
        map.addLayer({
          id: "hunt-clusters",
          type: "circle",
          source: SOURCE,
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#eb151f",
            "circle-radius": ["step", ["get", "point_count"], 17, 4, 21, 10, 25],
            "circle-stroke-width": 7,
            "circle-stroke-color": "rgba(235, 21, 31, 0.28)",
          },
        });
        try {
          map.addLayer({
            id: "hunt-cluster-count",
            type: "symbol",
            source: SOURCE,
            filter: ["has", "point_count"],
            layout: {
              "text-field": ["get", "point_count_abbreviated"],
              "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
              "text-size": 13,
              "text-allow-overlap": true,
            },
            paint: { "text-color": "#ffffff" },
          });
        } catch {
          // A style without glyphs: the clusters still show, just unnumbered.
        }

        map.on("click", "hunt-clusters", (e) => {
          const f = e.features?.[0];
          const clusterId = f?.properties?.cluster_id as number | undefined;
          if (!f || clusterId === undefined) return;
          const center = (f.geometry as Point).coordinates as [number, number];
          (map.getSource(SOURCE) as GeoJSONSource).getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || zoom == null) return;
            map.easeTo({ center, zoom: zoom + 0.5 });
          });
        });
        map.on("mouseenter", "hunt-clusters", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "hunt-clusters", () => (map.getCanvas().style.cursor = ""));

        map.on("render", () => syncMarkers(map, gl));
        fit(map, gl, huntsRef.current.map((h) => [h.lng, h.lat]));
        setLoaded(true);
      });
    })();

    return () => {
      cancelled = true;
      popupRef.current?.remove();
      userMarkerRef.current?.remove();
      for (const m of markers.values()) m.remove();
      markers.clear();
      shown.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [token]);

  /* --- the hunts changed (a filter): new data, and fit to it ---------- */
  useEffect(() => {
    const map = mapRef.current;
    const gl = glRef.current;
    if (!map || !gl || !loaded) return;
    (map.getSource(SOURCE) as GeoJSONSource | undefined)?.setData(toGeoJSON(hunts));
    if (selectedRef.current) return;
    const points = hunts.map((h) => [h.lng, h.lat] as [number, number]);
    if (points.length === 1) map.easeTo({ center: points[0], zoom: 12, duration: 800 });
    else if (points.length > 1) {
      const bounds = new gl.LngLatBounds(points[0], points[0]);
      for (const p of points) bounds.extend(p);
      map.fitBounds(bounds, { padding: 64, maxZoom: 12, duration: 800 });
    }
  }, [hunts, loaded]);

  /* --- the selection: fly there, then open its card ------------------- */
  useEffect(() => {
    const map = mapRef.current;
    const gl = glRef.current;
    if (!map || !gl || !loaded) return;

    for (const [id, m] of markersRef.current) m.getElement().classList.toggle(styles.markerSelected, id === selectedId);

    if (popupRef.current) {
      closingRef.current = true;
      popupRef.current.remove();
      popupRef.current = null;
      closingRef.current = false;
    }
    const hunt = selectedId ? hunts.find((h) => h.id === selectedId) : undefined;
    if (!hunt) return;

    let opened = false;
    const open = () => {
      if (opened || selectedRef.current !== hunt.id) return;
      opened = true;
      const popup = new gl.Popup({
        anchor: "bottom",
        offset: 40,
        maxWidth: "300px",
        focusAfterOpen: false,
        className: styles.popupShell,
      })
        .setLngLat([hunt.lng, hunt.lat])
        .setDOMContent(card(hunt))
        .addTo(map);
      popup.on("close", () => {
        if (popupRef.current === popup) popupRef.current = null;
        if (!closingRef.current) onSelectRef.current(null);
      });
      popupRef.current = popup;
    };

    // Land the hunt a little below centre, so its card has room above it.
    map.once("moveend", open);
    map.flyTo({ center: [hunt.lng, hunt.lat], zoom: Math.max(map.getZoom(), FOCUS_ZOOM), offset: [0, 110], duration: 1400 });
    // A fly that has nowhere to go may not report an end.
    const fallback = window.setTimeout(open, 1600);
    return () => {
      window.clearTimeout(fallback);
      map.off("moveend", open);
    };
  }, [selectedId, hunts, loaded]);

  /* --- "Near me": mark the visitor, frame them with the closest hunt -- */
  useEffect(() => {
    const map = mapRef.current;
    const gl = glRef.current;
    if (!map || !gl || !loaded || !user) return;
    if (!userMarkerRef.current) {
      const el = document.createElement("span");
      el.className = styles.userDot;
      el.setAttribute("role", "img");
      el.setAttribute("aria-label", huntsMap.labels.you);
      userMarkerRef.current = new gl.Marker({ element: el }).setLngLat([user.lng, user.lat]).addTo(map);
    } else userMarkerRef.current.setLngLat([user.lng, user.lat]);

    if (selectedRef.current) return;
    const nearest = huntsRef.current[0];
    if (!nearest) {
      map.easeTo({ center: [user.lng, user.lat], zoom: 10, duration: 900 });
      return;
    }
    const bounds = new gl.LngLatBounds([user.lng, user.lat], [user.lng, user.lat]).extend([nearest.lng, nearest.lat]);
    map.fitBounds(bounds, { padding: 80, maxZoom: 13, duration: 1000 });
  }, [user, loaded]);

  // Mapbox wants its container empty: the loading shimmer sits beside it.
  return (
    <>
      <div ref={containerRef} className={styles.map} />
      {!loaded && <span className={styles.mapLoading} aria-hidden="true" />}
    </>
  );
}
