"use client";

/**
 * FEATURED VIDEOS — section 3 (mockup 3.png).
 *
 * The homepage's window onto the Videos page: the mockup's heading (eyebrow,
 * FEATURED VIDEOS, the subline, the hand-written "press play"), then a
 * curated handful of videos as clean tiles, and one CTA to the full page.
 *
 * CONTENT comes from data/videos.ts — the same series the Videos page shows.
 * The homepage shows the videos flagged `featured` there (`homeFeatured`);
 * it keeps no list of its own.
 *
 * TILES respect each video's orientation: a horizontal (long-form) pick
 * leads at 16:9 across the column; the vertical picks sit beneath as 9:16
 * Reels tiles — five across from 640px, a swipeable shelf on a phone. Only
 * posters, lazy-loaded; nothing plays until a tile is tapped.
 *
 * PLAYBACK reuses the site's two players. A vertical tile opens the Videos
 * page's swipe feed (components/videos/VideoFeed.tsx) with just that clip —
 * the homepage plays what was tapped, and the viewer's "View full series"
 * goes to the series on the Videos page. The horizontal tile opens the shared landscape lightbox
 * (components/ui/VideoPlayer.tsx) with the browser's own controls — long-
 * form stays out of the swipe feed, as on the Videos page. One video at a
 * time, and sound only after a tap.
 *
 * ▸ BACKEND SEAM: the set arrives as a prop (defaulted to `homeFeatured`),
 *   so a server component can fetch it and pass it straight in.
 *
 * MOTION:
 *   • the heading reveals as the site's other section headings do
 *   • the lead tile opens out of an inset while a red trace runs round it
 *   • the Reels tiles rise in turn, their posters settling out of a zoom;
 *     every tile lifts on hover
 *   • the CTA opens from the centre
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, headReveal, injectTrace, lift, runTrace } from "@/lib/motion/helpers";
import { useMotion } from "@/components/motion/MotionProvider";
import { useVideoPlayer } from "@/components/ui/VideoPlayer";
import Eyebrow from "@/components/ui/Eyebrow";
import HandAccent from "@/components/ui/HandAccent";
import RedButton from "@/components/ui/RedButton";
import VideoFeed from "@/components/videos/VideoFeed";
import { homeFeatured, videosContent, type HomeFeatured } from "@/data/videos";
import styles from "./VideosSection.module.css";

export interface VideosSectionProps {
  featured?: HomeFeatured[];
}

export function VideosSection({ featured = homeFeatured }: VideosSectionProps) {
  const rootRef = useRef<HTMLElement>(null);
  const { ready, reduced } = useMotion();
  const { open: openVideo } = useVideoPlayer();
  /** The vertical pick open in the swipe feed, if any. */
  const [feed, setFeed] = useState<HomeFeatured | null>(null);

  const lead = featured.find((f) => f.video.orientation === "horizontal");
  const reels = featured.filter((f) => f.video.orientation === "vertical");

  const play = (item: HomeFeatured) => {
    const { video } = item;
    if (video.orientation === "horizontal") openVideo({ url: video.src, poster: video.poster, title: video.title });
    else setFeed(item);
  };

  /* --- entrance --------------------------------------------------------- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !ready) return;

    const q = gsap.utils.selector(root);

    if (reduced) {
      gsap.set(q("[data-a]"), { visibility: "visible" });
      return;
    }

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      gsap.set(q("[data-a]"), { visibility: "visible" });

      const head = q(`.${styles.head}`)[0] as HTMLElement | undefined;
      const leadTile = q(`.${styles.lead}`)[0] as HTMLElement | undefined;
      if (leadTile) injectTrace(leadTile);

      if (head) {
        const tl = headReveal(head, { copy: q(`.${styles.sub}`) });
        if (leadTile) {
          tl.fromTo(
            leadTile,
            { y: 60, opacity: 0, clipPath: "inset(8% 6% 8% 6% round 14px)" },
            { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0% round 14px)", duration: 1.5, ease: EASE, clearProps: "clipPath" },
            0.3,
          )
            .fromTo(leadTile.querySelector("img"), { scale: 1.25 }, { scale: 1, duration: 2, ease: EASE, clearProps: "transform" }, 0.3)
            .fromTo(
              leadTile.querySelectorAll(`.${styles.tileKicker}, .${styles.tileTitle}`),
              { yPercent: 110, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 1, stagger: 0.08 },
              1.0,
            );
          runTrace(tl, leadTile.querySelector(".card-trace"), 0.9, 2);
        }
      }

      /* reels */
      gsap
        .timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: q(`.${styles.reels}`)[0], start: "top 88%" },
        })
        .fromTo(q(`.${styles.reel}`), { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, clearProps: "transform" }, 0)
        .fromTo(q(`.${styles.reel} img`), { scale: 1.3 }, { scale: 1, duration: 1.7, stagger: 0.1, clearProps: "transform" }, 0);

      /* the CTA — opens from the centre outward */
      gsap.fromTo(
        q(`.${styles.btnWrap}`),
        { clipPath: "inset(0% 50% 0% 50%)", opacity: 0 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          opacity: 1,
          duration: 1.2,
          ease: EASE_IO,
          clearProps: "clipPath",
          scrollTrigger: { trigger: q(`.${styles.btnWrap}`)[0], start: "top 94%" },
        },
      );

      /* hover */
      (q(`.${styles.tile}`) as HTMLElement[]).forEach((tile) => cleanups.push(lift(tile, 8)));
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [ready, reduced]);

  /** One tile. The poster is the clip's own frame; if it hasn't been
      uploaded yet the tile shows its dark ground rather than a broken image. */
  const tile = (item: HomeFeatured) => {
    const { video, series } = item;
    const duration = "duration" in video ? (video as { duration: string }).duration : null;
    return (
      <button
        type="button"
        className={styles.tileBtn}
        onClick={() => play(item)}
        data-cursor="PLAY"
        aria-label={`Play ${video.title} — ${series.name}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.poster}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.style.visibility = "hidden";
          }}
        />
        <span className={styles.scrim} aria-hidden="true" />
        <span className={styles.vplay} aria-hidden="true">
          <svg viewBox="0 0 12 14">
            <path d="M0 0v14l12-7z" fill="#fff" />
          </svg>
        </span>
        {duration && (
          <span className={`${styles.dur} f-sans`} aria-hidden="true">
            {duration}
          </span>
        )}
        <span className={styles.tileText} aria-hidden="true">
          {/* The series as a red tag, the clip's own title under it. */}
          <span className={`${styles.tileKicker} f-sans caps`}>{series.name}</span>
          <span className={`${styles.tileTitle} f-display caps`}>{video.title}</span>
        </span>
      </button>
    );
  };

  return (
    <section ref={rootRef} id="videos" className={styles.videos} aria-labelledby="videos-title">
      <div className="frame">
        {/* ---------------- Heading ---------------- */}
        <div className={styles.head}>
          <Eyebrow
            label={videosContent.eyebrow}
            className={styles.eyebrow}
            labelClassName={styles.eyebrowLabel}
            ruleClassName={styles.eyebrowRule}
          />

          <h2 id="videos-title" className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner t-white">{videosContent.titleWhite}</span>
            </span>
            <span className="line f-display cz glow-text">
              <span className="line-inner t-red">{videosContent.titleRed}</span>
            </span>
          </h2>

          <p className={`${styles.sub} f-sans cz caps`}>{videosContent.subtitle}</p>

          <HandAccent
            lines={videosContent.accent.lines}
            className={styles.accentPress}
            underline="medium"
            underlineClassName={styles.accentPressUnderline}
          />
        </div>

        {/* ---------------- The featured set ---------------- */}
        {lead && (
          <div className={`${styles.tile} ${styles.lead}`} data-a>
            {tile(lead)}
          </div>
        )}

        {reels.length > 0 && (
          <ul className={styles.reels} aria-label="Featured clips" data-a>
            {reels.map((item) => (
              <li key={item.video.id} className={`${styles.tile} ${styles.reel}`}>
                {tile(item)}
              </li>
            ))}
          </ul>
        )}

        {/* ---------------- View all ---------------- */}
        <div className={styles.btnWrap} data-a>
          <RedButton
            label={videosContent.viewAll.label}
            href={videosContent.viewAll.href}
            className={styles.btn}
            arrow="long"
            magnetStrength={0.08}
          />
        </div>
      </div>

      {feed && (
        <VideoFeed
          series={{ name: feed.series.name, videos: [feed.video], platformUrl: `/videos#series-${feed.series.id}` }}
          onClose={() => setFeed(null)}
        />
      )}
    </section>
  );
}

export default VideosSection;
