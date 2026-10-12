"use client";

/**
 * VIDEO FEED — the full-screen viewer every series opens in (not in the
 * mockups; styled to the brand: black, red glow, the display face).
 *
 * One video at a time. Swipe / scroll up for the next, down for the
 * previous — a snap-scrolling column, Reels style — and the arrow keys,
 * Page Up / Down and Space on a keyboard (the on-screen arrows show only
 * for mouse pointers; touch swipes). Over the video: the R5 logo and
 * the series name at the top with the "3 / 15" counter, the video's title
 * and caption at the foot with "View full series →", a mute toggle and a
 * close. A tap on the video pauses / plays it.
 *
 * ORIENTATION: vertical (9:16) clips fill the stage. Horizontal (16:9)
 * ones — the long-form series — sit centred, the whole picture visible,
 * on a blurred, darkened blow-up of their own poster.
 *
 * LAZY: only the current video and its two neighbours are mounted as
 * <video>; the rest are their posters. Leaving a video pauses it and, two
 * slides away, unmounts it so its buffer is released. The current video
 * autoplays muted (what browsers allow); the toggle unmutes.
 *
 * Every `src` comes from data/videos.ts (Cloudflare R2). BACKEND SEAM.
 *
 * GPU: the sliding column and each video get a standing `translateZ(0)` +
 * `backface-visibility: hidden` (see VideoFeed.module.css). Unlike the
 * page's headlines there is no `background-clip: text` here to break, so
 * the usual promotion caveat (AboutHero.tsx) does not apply; the video
 * surface is the element that benefits.
 *
 * Reduced motion: no entrance tween, instant snaps.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "@/lib/motion/gsap";
import { useMotion } from "@/components/motion/MotionProvider";
import RedButton from "@/components/ui/RedButton";
import Logo from "@/components/ui/Logo";
import type { FeedVideo } from "@/data/videos";
import { videosFeed } from "@/data/videos-page";
import styles from "./VideoFeed.module.css";

/** What the viewer needs of a series, whichever shape the data keeps it in. */
export interface FeedSeries {
  name: string;
  videos: FeedVideo[];
  /** Where "View full series" goes. */
  platformUrl: string;
  /** The button's label; the default is "View full series". */
  platformLabel?: string;
}

export interface VideoFeedProps {
  series: FeedSeries;
  /** Which video opens first. */
  start?: number;
  onClose: () => void;
}

/** How many slides either side of the current one keep a mounted <video>. */
const WINDOW = 1;

export function VideoFeed({ series, start = 0, onClose }: VideoFeedProps) {
  const { reduced, lockScroll, unlockScroll } = useMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const [index, setIndex] = useState(Math.min(Math.max(start, 0), series.videos.length - 1));
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  /** Mirrors `index` for the scroll handler, which must not re-subscribe. */
  const indexRef = useRef(index);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const count = series.videos.length;

  /* Open: lock the page, remember focus, land on the start slide. */
  useEffect(() => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    lockScroll();
    const column = columnRef.current;
    if (column) column.scrollTop = index * column.clientHeight;
    closeRef.current?.focus();
    return () => {
      unlockScroll();
      lastFocus.current?.focus();
    };
    // Runs once, on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Entrance. */
  useEffect(() => {
    if (reduced || !overlayRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
      gsap.fromTo(
        columnRef.current,
        { scale: 0.94, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "expo.out", clearProps: "transform,opacity" },
      );
    });
    return () => ctx.revert();
  }, [reduced]);

  const close = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay || reduced) {
      onClose();
      return;
    }
    gsap.to(overlay, { opacity: 0, duration: 0.25, ease: "power2.in", onComplete: onClose });
  }, [onClose, reduced]);

  const goTo = useCallback(
    (n: number) => {
      const column = columnRef.current;
      if (!column) return;
      const target = Math.min(Math.max(n, 0), count - 1);
      column.scrollTo({ top: target * column.clientHeight, behavior: reduced ? "auto" : "smooth" });
    },
    [count, reduced],
  );

  /* Which slide is in view: the column's scroll position, snapped. */
  useEffect(() => {
    const column = columnRef.current;
    if (!column) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const n = Math.round(column.scrollTop / column.clientHeight);
        if (n === indexRef.current) return;
        setIndex(n);
        setPaused(false);
        setProgress(0);
      });
    };
    column.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      column.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRefs.current[index];
    if (!v) return;
    if (v.paused) {
      const p = v.play();
      if (p) p.catch(() => undefined);
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  }, [index]);

  /* Keys: arrows / page keys move, space pauses, Escape closes. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goTo(index + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goTo(index - 1);
      } else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key.toLowerCase() === "m") setMuted((m) => !m);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  /* Play the current video from its start, pause the others. A refused
     autoplay (no gesture yet) leaves the slide paused, with its mark. */
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index) {
        v.currentTime = 0;
        const p = v.play();
        if (p) p.catch(() => setPaused(true));
      } else {
        v.pause();
      }
    });
  }, [index]);

  return createPortal(
    <div ref={overlayRef} className={styles.overlay} role="dialog" aria-modal="true" aria-label={`${series.name} — videos`}>
      {/* ---- Chrome: top --------------------------------------------- */}
      <div className={styles.top}>
        <div className={styles.brand}>
          <Logo />
          <p className={`${styles.seriesName} f-display caps`}>{series.name}</p>
        </div>
        <p className={`${styles.counter} f-ui`} aria-live="polite">
          {index + 1} / {count}
        </p>
        <button ref={closeRef} type="button" className={styles.close} onClick={close} aria-label={videosFeed.close}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 4l16 16M20 4L4 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* ---- The column ---------------------------------------------- */}
      {/* data-lenis-prevent: the page scroll is locked while the viewer is open, and
          Lenis would otherwise swallow wheel and touch inside this column too. */}
      <div ref={columnRef} className={styles.column} tabIndex={-1} data-lenis-prevent>
        {series.videos.map((video, i) => {
          const near = Math.abs(i - index) <= WINDOW;
          const current = i === index;
          const wide = video.orientation === "horizontal";
          return (
            <section key={video.id} className={styles.slide} aria-label={video.title} aria-hidden={!current}>
              <div className={`${styles.stage} ${wide ? styles.stageWide : ""}`} onClick={current ? togglePlay : undefined}>
                {/* A horizontal video's letterbox is a blurred blow-up of its own poster. */}
                {wide && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={styles.fill} src={video.poster} alt="" decoding="async" aria-hidden="true" />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={styles.poster} src={video.poster} alt="" decoding="async" />
                {near && video.src && (
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                      if (el) {
                        el.muted = muted;
                        el.defaultMuted = true;
                        el.setAttribute("muted", "");
                      }
                    }}
                    className={styles.video}
                    src={video.src}
                    playsInline
                    loop
                    autoPlay={current}
                    muted={muted}
                    preload={current ? "auto" : "metadata"}
                    onTimeUpdate={(e) => {
                      if (!current) return;
                      const v = e.currentTarget;
                      if (v.duration) setProgress(v.currentTime / v.duration);
                    }}
                  />
                )}
                {!video.src && (
                  <span className={`${styles.soon} f-ui caps`} aria-hidden="true">
                    {videosFeed.comingSoon}
                  </span>
                )}
                {current && video.src && paused && (
                  <span className={styles.pausedMark} aria-hidden="true">
                    <svg viewBox="0 0 49 58">
                      <path d="M0 0v58l49-29z" fill="currentColor" />
                    </svg>
                  </span>
                )}
                {/* The red progress line, current slide only. */}
                {current && (
                  <span className={styles.progress} aria-hidden="true">
                    <i style={{ transform: `scaleX(${progress})` }} />
                  </span>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* ---- Chrome: foot -------------------------------------------- */}
      <div className={styles.foot}>
        <div className={styles.captionBox}>
          <p className={`${styles.videoTitle} f-display caps`}>{series.videos[index]?.title}</p>
          <p className={`${styles.caption} f-sans`}>{series.videos[index]?.caption}</p>
          <RedButton label={series.platformLabel ?? videosFeed.viewSeries} href={series.platformUrl} className={styles.viewBtn} arrow="short" magnetStrength={0} />
        </div>
        <div className={styles.controls}>
          <button type="button" className={`${styles.ctl} ${styles.ctlNav}`} onClick={() => goTo(index - 1)} disabled={index === 0} aria-label={videosFeed.previous}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 15l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" className={styles.ctl} onClick={() => setMuted((m) => !m)} aria-label={muted ? videosFeed.unmute : videosFeed.mute} aria-pressed={!muted}>
            {muted ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 9v6h4l5 4V5L8 9H4zM17 8l4 8M21 8l-4 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 9v6h4l5 4V5L8 9H4zM16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <button type="button" className={`${styles.ctl} ${styles.ctlNav}`} onClick={() => goTo(index + 1)} disabled={index === count - 1} aria-label={videosFeed.next}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default VideoFeed;
