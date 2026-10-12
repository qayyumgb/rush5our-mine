"use client";

/**
 * VIDEOS — section 3, "Watch Rush 5our" (mockups/Videos/3.png, a 941 x
 * 1671 phone frame).
 *
 * A tracked "WATCH" over the leaning RUSH 5OUR headline,
 * the handwritten "more than content." at its right, a tracked subline;
 * the featured player; the PICKING UP GIRLS series head with its brush,
 * a tracked "SERIES", a rule and three short lines; four episode cards —
 * poster with a runtime chip, two-line title, copy, a "watch this series"
 * button and a ghost numeral; then the "browse all videos on YouTube"
 * button and a tracked tagline.
 *
 * PICKING UP GIRLS is the long-form HORIZONTAL series, self-hosted like
 * the rest but played the way the mockup draws it: the featured 16:9
 * player (its poster until a click) plays episodes from R2 with the
 * browser's own controls — play / pause, seek, volume, time, fullscreen —
 * and tapping an episode card loads it into that player and scrolls the
 * player into view. A "View full series on YouTube" pill over the poster
 * and "Browse all videos on YouTube" keep the catalogue reachable. (The
 * swipe feed is for the five short vertical series only.) Everything
 * comes from data/videos.ts (`pickingUpGirls`) — BACKEND SEAM.
 *
 * LAYOUT: at the frame's width and above every block sits where the
 * mockup puts it; under 640px the type floors outgrow the cards, so each
 * grows to fit and its button drops beneath the copy (as section 2 does).
 *
 * MOTION (scroll-triggered):
 *   • the eyebrow decodes, the headline's characters
 *     rise, the handwriting fades in, the subline lifts
 *   • the player opens from its centre
 *   • the series head: characters rise, the brush sweeps on, the label
 *     decodes, the rule draws, the aside lines lift
 *   • each card rises as it arrives; the YouTube button wipes open and the
 *     tagline decodes
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import RedButton from "@/components/ui/RedButton";
import { pickingUpGirls, type TitleRun } from "@/data/videos";
import { videosWatch } from "@/data/videos-page";
import styles from "./VideosWatch.module.css";

function Runs({ runs }: { runs: TitleRun[] }) {
  return (
    <>
      {runs.map((r, i) => (
        <span key={i} className={r.red ? "t-red" : "t-white"}>
          {r.text}
        </span>
      ))}
    </>
  );
}

export function VideosWatch() {
  const rootRef = useRef<HTMLElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const { ready, reduced, scrollTo } = useMotion();
  /** Which episode the featured player holds (the series' featured one
      until an episode card is tapped), and whether it has been started. */
  const [currentId, setCurrentId] = useState(pickingUpGirls.featuredId);
  const [playing, setPlaying] = useState(false);

  const c = videosWatch;
  const series = pickingUpGirls;
  const featured = series.videos.find((v) => v.id === currentId) ?? series.videos[0];

  /** An episode card: load it into the featured player and bring that into view. */
  const playEpisode = (id: string) => {
    setCurrentId(id);
    setPlaying(true);
    if (playerRef.current) scrollTo(playerRef.current, 96);
  };

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

      const head = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.top}`)[0], start: "top 80%" },
      });
      const eyebrow = q(`.${styles.eyebrow}`)[0] as HTMLElement | undefined;
      if (eyebrow) head.add(scramble(eyebrow, 0.9), 0.1);
      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(head, splitTitle(title), 0.2, 0.05);
      head
        .fromTo(q(`.${styles.more}`), { opacity: 0, rotate: -4, y: 10 }, { opacity: 1, rotate: 0, y: 0, duration: 0.9 }, 0.8)
        .fromTo(q(`.${styles.sub}`), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 1);

      gsap.fromTo(
        q(`.${styles.player}`),
        { clipPath: "inset(0% 50% 0% 50% round 10px)", opacity: 0 },
        {
          clipPath: "inset(0% 0% 0% 0% round 10px)",
          opacity: 1,
          duration: 1.2,
          ease: EASE_IO,
          clearProps: "clipPath",
          scrollTrigger: { trigger: q(`.${styles.player}`)[0], start: "top 85%" },
        },
      );

      const seriesTl = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.seriesHead}`)[0], start: "top 85%" },
      });
      const seriesTitle = q(`.${styles.seriesTitle}`)[0] as HTMLElement | undefined;
      if (seriesTitle) charsIn(seriesTl, splitTitle(seriesTitle), 0, 0.035);
      const label = q(`.${styles.seriesLabel}`)[0] as HTMLElement | undefined;
      if (label) seriesTl.add(scramble(label, 0.9), 0.4);
      seriesTl
        .fromTo(
          q(`.${styles.seriesBrush}`),
          { clipPath: "inset(-10% 100% -10% 0)" },
          { clipPath: "inset(-10% 0% -10% 0)", duration: 0.8, ease: EASE_IO, clearProps: "clipPath" },
          0.6,
        )
        .fromTo(q(`.${styles.rule}`), { scaleY: 0 }, { scaleY: 1, duration: 0.7, ease: EASE_IO }, 0.4)
        .fromTo(q(`.${styles.aside} span`), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 }, 0.5);

      q(`.${styles.card}`).forEach((card) => {
        gsap
          .timeline({
            defaults: { ease: EASE },
            scrollTrigger: { trigger: card, start: "top 92%" },
          })
          .fromTo(card, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0)
          .fromTo(card.querySelector("img"), { scale: 1.08 }, { scale: 1, duration: 1.4, ease: EASE_IO }, 0);
      });

      const foot = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.foot}`)[0], start: "top 92%" },
      });
      foot.fromTo(
        q(`.${styles.ytWrap}`),
        { y: 20, opacity: 0, clipPath: "inset(0% 50% 0% 50%)" },
        { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: EASE_IO, clearProps: "clipPath" },
        0,
      );
      const tagline = q(`.${styles.tagline}`)[0] as HTMLElement | undefined;
      if (tagline) foot.add(scramble(tagline, 0.9), 0.4);
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);


  return (
    <section ref={rootRef} id="watch" className={styles.section} aria-labelledby="videos-watch-title">
      {/* The mockup's own grunge, everything else removed. */}
      <div className={styles.atmos} aria-hidden="true" />

      <div className={styles.frame}>
        {/* ---- Head ------------------------------------------------------ */}
        <div className={styles.top}>
          <p className={`${styles.eyebrow} f-sans cz caps`}>{c.eyebrow}</p>

          <h2 id="videos-watch-title" className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner">
                <Runs runs={c.title} />
              </span>
            </span>
          </h2>

          {/* The handwritten note and its brush, lifted from the mockup as
              an alpha image. A fixed 165px asset. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.more} src="/assets/images/videos-watch-more.webp" width={165} height={167} alt={c.more} decoding="async" data-a />

          <p className={`${styles.sub} f-sans cz caps`} data-a>
            {c.sub}
          </p>
        </div>

        {/* ---- Featured player ------------------------------------------- */}
        <div ref={playerRef} className={styles.player} data-a>
          {playing ? (
            <video key={featured.id} className={styles.embed} src={featured.src} poster={featured.poster} controls autoPlay playsInline preload="auto" aria-label={featured.title} />
          ) : (
            <button type="button" className={styles.poster} onClick={() => setPlaying(true)} aria-label={`Play: ${featured.title} (${featured.duration})`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featured.poster} width={881} height={433} alt="" decoding="async" />
              <span className={styles.posterHit} aria-hidden="true">
                <svg viewBox="0 0 49 58" aria-hidden="true">
                  <path d="M0 0v58l49-29z" fill="currentColor" />
                </svg>
              </span>
            </button>
          )}
          {!playing && (
            <a className={`${styles.ytLink} f-ui caps`} href={series.platformUrl} target="_blank" rel="noopener noreferrer">
              {c.fullSeries} →
            </a>
          )}
        </div>

        {/* ---- Series head ----------------------------------------------- */}
        <div className={styles.seriesHead}>
          <h3 className={styles.seriesTitle}>
            <span className="line f-display cz">
              <span className="line-inner">
                <Runs runs={series.title} />
              </span>
            </span>
          </h3>
          <p className={`${styles.seriesLabel} f-sans cz caps`}>{series.label}</p>
          {/* The brush after the label, lifted from the mockup as an alpha
              image. A fixed 366px asset. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.seriesBrush} src="/assets/images/videos-watch-brush.webp" width={366} height={22} alt="" aria-hidden="true" decoding="async" data-a />
          <span className={styles.rule} aria-hidden="true" data-a />
          <p className={`${styles.aside} f-sans cz caps`}>
            {series.aside.map((l) => (
              <span key={l} data-a>
                {l}
              </span>
            ))}
          </p>
        </div>

        {/* ---- Episodes -------------------------------------------------- */}
        <ul className={styles.list}>
          {series.videos.slice(0, series.cards).map((e) => {
            const titleText = e.title;
            const play = () => playEpisode(e.id);
            return (
              <li key={e.id} id={`episode-${e.id}`} className={styles.card} data-a>
                <button type="button" className={styles.thumb} onClick={play} aria-label={`Play: ${titleText} (${e.duration})`} tabIndex={-1}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.thumbnail} width={389} height={146} alt={e.thumbnailAlt} loading="lazy" decoding="async" />
                  <span className={`${styles.chip} f-sans`} aria-hidden="true">
                    {e.duration}
                  </span>
                </button>

                <div className={styles.body}>
                  <h4 className={`${styles.cardTitle} f-display cz caps`}>
                    {e.cardTitle.map((line, i) => (
                      <span key={i} className={styles.cardLine}>
                        <Runs runs={line} />
                      </span>
                    ))}
                  </h4>
                  <p className={`${styles.desc} f-sans cz`}>
                    {e.description.map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </p>
                </div>

                <span className={`${styles.num} f-display cz`} aria-hidden="true">
                  {e.number}
                </span>

                <div className={styles.btnWrap}>
                  <RedButton label={c.cta} onClick={play} className={styles.btn} wrapperClassName={styles.btnMagnet} arrow="short" magnetStrength={0.1} />
                </div>
              </li>
            );
          })}
        </ul>

        {/* ---- Foot ------------------------------------------------------ */}
        <div className={styles.foot}>
          <div className={styles.ytWrap} data-a>
            <RedButton label={c.youtube.label} href={c.youtube.href} className={styles.yt} wrapperClassName={styles.ytMagnet} arrow="long" magnetStrength={0.12}>
              <svg className={styles.ytIcon} viewBox="0 0 63 45" aria-hidden="true">
                <rect width="63" height="45" rx="10" fill="#fff" />
                <path d="M25 13v19l16-9.5z" fill="#e3000f" />
              </svg>
            </RedButton>
          </div>
          <p className={`${styles.tagline} f-sans cz caps`}>{c.tagline}</p>
        </div>
      </div>

    </section>
  );
}

export default VideosWatch;
