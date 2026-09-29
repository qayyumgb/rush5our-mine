"use client";

/**
 * RUSH HUNTS — section 4, "Hunt map" (mockups/Rush Hunts/4.png, a
 * 950 x 1655 phone frame).
 *
 * A left-set statement — red tracked eyebrow with a rule, a very wide
 * two-colour headline, a tracked subline and three lines of copy — then a
 * legend of three pills over a dark map of the city. The map carries glowing
 * pins, two crowned special drops, the city's name, a brush-script note,
 * zoom buttons and a "use my location" button. A red-framed card of nearby
 * hunts overlaps its foot, and a tracked line between two rules closes it.
 *
 * The map, the edge grunge, the script, the crown and the target mark are
 * lifted from the mockup file (see data/hunts.ts). The map is a picture, not
 * a live map: the zoom buttons scale that picture, and the pins sit on it by
 * pixel.
 *
 * MOTION:
 *   • the eyebrow decodes as its rule draws, the headline's characters rise,
 *     the subline and copy lift
 *   • the legend pills lift in turn, the map fades up, its pins drop in one
 *     after another and then breathe; the script writes on
 *   • the card rises, its rows slide in, the button lifts
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn, pauseWhenOffscreen } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import RedButton from "@/components/ui/RedButton";
import { huntsMap, type HuntPinKind } from "@/data/hunts";
import styles from "./HuntsMap.module.css";

/** Zoom steps for the map picture. */
const ZOOMS = [1, 1.25, 1.5, 1.8];

const CROWN = "/assets/images/hunts-map-crown.webp";

function LegendMark({ kind }: { kind: HuntPinKind }) {
  if (kind === "special") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={styles.legendCrown} src={CROWN} width={54} height={48} alt="" aria-hidden="true" />;
  }
  return <span className={`${styles.legendDot} ${kind === "recent" ? styles.legendDotRecent : ""}`} aria-hidden="true" />;
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 22" aria-hidden="true">
      <path d="M1.5 11h21M13 2l9.5 9-9.5 9" />
    </svg>
  );
}

export function HuntsMap() {
  const rootRef = useRef<HTMLElement>(null);
  const { ready, reduced } = useMotion();
  const [zoom, setZoom] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !ready) return;

    const q = gsap.utils.selector(root);

    if (reduced) {
      gsap.set(q("[data-a]"), { visibility: "visible" });
      return;
    }

    let stopWatching = () => {};

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

      /* --- map ---------------------------------------------------------- */
      const map = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.stage}`)[0], start: "top 78%" },
      });
      map
        .fromTo(q(`.${styles.pill}`), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, 0)
        .fromTo(q(`.${styles.viewport}`), { opacity: 0 }, { opacity: 1, duration: 1.4, ease: "power1.out" }, 0.1)
        .fromTo(q(`.${styles.city}`), { opacity: 0 }, { opacity: 1, duration: 1 }, 0.6)
        .fromTo(
          q(`.${styles.pin}`),
          { y: -26, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.09, ease: "back.out(2)" },
          0.5,
        )
        .fromTo(
          q(`.${styles.script}`),
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 1.2, ease: EASE_IO, clearProps: "clipPath" },
          0.7,
        )
        .fromTo(
          q(`.${styles.zoom}, .${styles.locate}`),
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
          1,
        );

      // The pins breathe: a ring swells out of each and fades.
      const pulse = gsap.fromTo(
        q(`.${styles.ring}`),
        { scale: 0.6, opacity: 0.7 },
        { scale: 2.1, opacity: 0, duration: 2.2, ease: "power1.out", repeat: -1, stagger: { each: 0.35, repeat: -1 } },
      );
      stopWatching = pauseWhenOffscreen(root, [pulse]);

      /* --- nearby ------------------------------------------------------- */
      gsap
        .timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: q(`.${styles.card}`)[0], start: "top 86%" },
        })
        .fromTo(q(`.${styles.card}`), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, 0)
        .fromTo(
          q(`.${styles.target}`),
          { scale: 0.5, opacity: 0, rotate: -90 },
          { scale: 1, opacity: 1, rotate: 0, duration: 1, ease: "back.out(1.6)" },
          0.2,
        )
        .fromTo(
          q(`.${styles.cardTitle}, .${styles.viewAll}`),
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 },
          0.3,
        )
        .fromTo(
          q(`.${styles.row}`),
          { x: -24, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, stagger: 0.1 },
          0.45,
        )
        .fromTo(q(`.${styles.ctaWrap}`), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0.75);

      /* --- foot --------------------------------------------------------- */
      gsap
        .timeline({ scrollTrigger: { trigger: q(`.${styles.foot}`)[0], start: "top 95%" } })
        .fromTo(q(`.${styles.footRule}`), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: EASE_IO }, 0)
        .fromTo(q(`.${styles.footLabel}`), { opacity: 0 }, { opacity: 1, duration: 1 }, 0.2);
    }, root);

    return () => {
      stopWatching();
      ctx.revert();
    };
  }, [ready, reduced]);

  const c = huntsMap;

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

        {/* ---------------- Map ---------------- */}
        <div className={styles.stage}>
          <div className={styles.viewport} data-a>
            <div className={styles.mapInner} style={{ "--z": ZOOMS[zoom] } as CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.mapImg}
                src={c.map.src}
                width={c.map.width}
                height={c.map.height}
                alt={c.map.alt}
                decoding="async"
              />

              <span className={`${styles.city} f-cond caps`}>{c.map.city}</span>

              <ul className={styles.pins}>
                {c.map.pins.map((pin) => (
                  <li
                    key={`${pin.x}-${pin.y}`}
                    className={`${styles.pin} ${styles[pin.kind]}`}
                    style={{ "--x": pin.x, "--y": pin.y } as CSSProperties}
                  >
                    <span className="sr-only">{pin.label}</span>
                    <span className={styles.ring} aria-hidden="true" />
                    {pin.kind === "special" ? (
                      <span className={styles.crownBox} aria-hidden="true">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={CROWN} width={54} height={48} alt="" />
                      </span>
                    ) : (
                      <span className={styles.dot} aria-hidden="true" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ul className={styles.legend}>
            {c.legend.map((item) => (
              <li key={item.kind} className={`${styles.pill} f-sans caps`} data-a>
                <LegendMark kind={item.kind} />
                <span className={styles.pillLabel}>{item.label}</span>
              </li>
            ))}
          </ul>

          {/* The brush-script note and its stroke, lifted from the mockup as
              an alpha image: hand-painted, not a font. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.script}
            src="/assets/images/hunts-map-script.webp"
            width={170}
            height={228}
            alt={c.script}
            decoding="async"
            data-a
          />

          <div className={styles.zoom} role="group" aria-label="Map zoom" data-a>
            <button
              type="button"
              className={styles.zoomBtn}
              aria-label="Zoom in"
              disabled={zoom === ZOOMS.length - 1}
              onClick={() => setZoom((z) => Math.min(ZOOMS.length - 1, z + 1))}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0v24M0 12h24" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.zoomBtn}
              aria-label="Zoom out"
              disabled={zoom === 0}
              onClick={() => setZoom((z) => Math.max(0, z - 1))}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M0 12h24" />
              </svg>
            </button>
          </div>

          <a className={`${styles.locate} f-sans`} href={c.locate.href} data-a>
            <svg className={styles.locateIcon} viewBox="0 0 26 26" aria-hidden="true">
              <path d="M25.5 0.5 0.8 10.6l10.4 3.2 3.4 11.4z" />
            </svg>
            <span>{c.locate.label}</span>
          </a>

          {/* ---------------- Nearby hunts ---------------- */}
          <div className={styles.card} data-a>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.target}
              src="/assets/images/hunts-map-target.webp"
              width={80}
              height={80}
              alt=""
              aria-hidden="true"
            />
            <h3 className={`${styles.cardTitle} f-display cz caps`}>
              <span className={styles.slant}>
                {c.nearby.titleWhite} <span className={styles.red}>{c.nearby.titleRed}</span>
              </span>
            </h3>
            <a className={`${styles.viewAll} f-cond caps`} href={c.nearby.viewAll.href}>
              <span>{c.nearby.viewAll.label}</span>
              <Arrow className={styles.viewAllArrow} />
            </a>

            <ul className={styles.rows}>
              {c.nearby.hunts.map((hunt) => (
                <li key={hunt.name} className={styles.row}>
                  <a className={`${styles.rowLink} f-sans`} href={hunt.href}>
                    <span className={styles.rowDot} aria-hidden="true" />
                    <span className={styles.rowName}>{hunt.name}</span>
                    <span className={styles.rowDist}>{hunt.distance}</span>
                    <Arrow className={styles.rowArrow} />
                  </a>
                </li>
              ))}
            </ul>

            <div className={styles.ctaWrap}>
              <RedButton
                label={c.nearby.cta.label}
                href={c.nearby.cta.href}
                className={styles.cta}
                wrapperClassName={styles.ctaMagnet}
                arrow="long"
                magnetStrength={0.12}
              />
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
