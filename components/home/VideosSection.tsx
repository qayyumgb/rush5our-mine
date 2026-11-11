"use client";

/**
 * FEATURED VIDEOS — section 3 (mockup 3.png, and the client's reference,
 * "2b Featured Videos").
 *
 * The heading (eyebrow, FEATURED VIDEOS, the subline, the hand-written
 * "press play"), then:
 *   • the FEATURED card — a large 16:9 tile: play button, category pill,
 *     title, duration
 *   • the CATEGORY tabs — All, then one per series, scrolling sideways on a
 *     phone. A tab filters both the featured card and the row below.
 *   • a swipeable ROW of 9:16 cards (thumbnail, pill, title, duration, play)
 *     — a native swipe on touch; on a desktop, drag with the mouse or use
 *     the arrows
 *   • "View all videos" → the Videos page
 *
 * CONTENT comes from data/videos.ts — the same videos the Videos page
 * plays (`homeVideos`). Each carries its `category` (a tab,
 * `videoCategories`), its `duration` and a `thumbnail` (the client's art;
 * the clip's own frame until it arrives). "All" is the curated mix — the
 * videos flagged `featured`, the categories taken in turn; a category tab
 * shows its whole series, the featured ones first. A tab's featured card is
 * its first horizontal video, or else its first video.
 *
 * Pictures keep their shape: a vertical clip in the 16:9 featured card, or
 * a horizontal one in a 9:16 card, sits whole on a blurred fill of itself
 * rather than being cropped.
 *
 * PLAYBACK reuses the site's two players: a horizontal video opens the
 * landscape lightbox (components/ui/VideoPlayer.tsx), a vertical one the
 * Videos page's swipe viewer (components/videos/VideoFeed.tsx) with just
 * that clip. One video at a time; sound only after a tap.
 *
 * MOTION:
 *   • the heading reveals as the site's other section headings do
 *   • the featured card opens out of an inset while a red trace runs round
 *   • the tabs and the row rise; a tab change fades the new set in
 *   • the CTA opens from the centre
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, headReveal, injectTrace, runTrace } from "@/lib/motion/helpers";
import { useMotion } from "@/components/motion/MotionProvider";
import { useVideoPlayer } from "@/components/ui/VideoPlayer";
import Eyebrow from "@/components/ui/Eyebrow";
import HandAccent from "@/components/ui/HandAccent";
import RedButton from "@/components/ui/RedButton";
import VideoFeed from "@/components/videos/VideoFeed";
import { homeVideos, videoCategories, videosContent, type HomeFeatured, type VideoCategoryId } from "@/data/videos";
import styles from "./VideosSection.module.css";

const CATEGORY_LABEL = Object.fromEntries(videoCategories.map((c) => [c.id, c.label])) as Record<VideoCategoryId, string>;

/** "All": the categories' videos taken in turn, so the row mixes series. */
function interleave(lists: HomeFeatured[][]): HomeFeatured[] {
  const out: HomeFeatured[] = [];
  const longest = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < longest; i++) for (const list of lists) if (list[i]) out.push(list[i]);
  return out;
}

/** The featured card and the row for one tab: "All" mixes the featured
    picks; a category shows its whole series, the featured ones first. */
function pick(videos: HomeFeatured[], category: VideoCategoryId) {
  const featured = videos.filter((f) => f.video.featured);
  const inCategory = (list: HomeFeatured[], id: VideoCategoryId) => list.filter((f) => f.video.category === id);
  const list =
    category === "all"
      ? interleave(videoCategories.filter((c) => c.id !== "all").map((c) => inCategory(featured, c.id)))
      : [...inCategory(featured, category), ...inCategory(videos, category).filter((f) => !f.video.featured)];
  const leadAt = Math.max(0, list.findIndex((f) => f.video.orientation === "horizontal"));
  return { lead: list[leadAt] ?? null, row: list.filter((_, i) => i !== leadAt) };
}

/**
 * Drag-to-scroll for a mouse (touch already swipes natively): press and
 * drag the row sideways. A drag doesn't count as a click on the card it
 * started on.
 */
function useDragScroll() {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startX = 0;
    let startLeft = 0;
    let down = false;
    let moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) {
        moved = true;
        el.classList.add(styles.dragging);
      }
      if (moved) el.scrollLeft = startLeft - dx;
    };
    /* Letting go: glide to the nearest card, then hand back to snapping.
       (Turning snapping straight back on makes Chrome return to the card
       it last snapped to — the drag would spring back.) */
    let settle = 0;
    const onUp = () => {
      if (!down) return;
      down = false;
      if (!moved) return;
      const card = el.firstElementChild as HTMLElement | null;
      const step = card ? card.offsetWidth + (parseFloat(getComputedStyle(el).columnGap) || 0) : 0;
      const max = el.scrollWidth - el.clientWidth;
      const target = step ? Math.min(max, Math.round(el.scrollLeft / step) * step) : el.scrollLeft;
      el.scrollTo({ left: target, behavior: "smooth" });
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        el.classList.remove(styles.dragging);
        el.scrollLeft = target;
      }, 500);
    };
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      window.clearTimeout(settle);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);
  return ref;
}

export interface VideosSectionProps {
  /** Every video that can show; the `featured` ones make up "All". */
  videos?: HomeFeatured[];
}

export function VideosSection({ videos = homeVideos }: VideosSectionProps) {
  const rootRef = useRef<HTMLElement>(null);
  const { ready, reduced } = useMotion();
  const { open: openVideo } = useVideoPlayer();
  /** The vertical pick open in the swipe feed, if any. */
  const [feed, setFeed] = useState<HomeFeatured | null>(null);
  const [category, setCategory] = useState<VideoCategoryId>("all");
  const rowRef = useDragScroll();
  const [ends, setEnds] = useState({ start: true, end: false });

  /** Only the tabs that have something to show. */
  const tabs = useMemo(
    () => videoCategories.filter((c) => c.id === "all" || videos.some((f) => f.video.category === c.id)),
    [videos],
  );
  const { lead, row } = useMemo(() => pick(videos, category), [videos, category]);

  const play = (item: HomeFeatured) => {
    const { video } = item;
    if (video.orientation === "horizontal") openVideo({ url: video.src, poster: video.thumbnail || video.poster, title: video.title });
    else setFeed(item);
  };

  /* --- the row: where it is, and paging with the arrows ----------------- */
  const measure = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEnds({ start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2 });
  }, [rowRef]);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    onScroll();
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
    };
  }, [rowRef, measure, category]);

  /** As many cards as fit, in the arrow's direction. */
  const page = (dir: 1 | -1) => {
    const el = rowRef.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const style = getComputedStyle(el);
    const gap = parseFloat(style.columnGap) || 0;
    const view = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const step = card.offsetWidth + gap;
    const perView = Math.max(1, Math.floor((view + gap + 1) / step));
    el.scrollBy({ left: dir * perView * step, behavior: reduced ? "auto" : "smooth" });
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
          ).fromTo(
            leadTile.querySelectorAll(`.${styles.tileKicker}, .${styles.tileTitle}`),
            { yPercent: 110, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1, stagger: 0.08 },
            1.0,
          );
          runTrace(tl, leadTile.querySelector(".card-trace"), 0.9, 2);
        }
      }

      gsap
        .timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: q(`.${styles.tabs}`)[0], start: "top 90%" },
        })
        .fromTo(q(`.${styles.tab}`), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, clearProps: "transform" }, 0)
        .fromTo(q(`.${styles.reel}`), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, clearProps: "transform,opacity" }, 0.15);

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
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  /** One card. A picture of the other shape than its frame sits whole on a
      blurred fill of itself; a missing picture leaves the dark ground. */
  const tile = (item: HomeFeatured, frame: "wide" | "tall") => {
    const { video } = item;
    const src = video.thumbnail || video.poster;
    const fits = (frame === "wide") === (video.orientation === "horizontal");
    const label = CATEGORY_LABEL[video.category];
    const hide = (e: React.SyntheticEvent<HTMLImageElement>) => {
      e.currentTarget.style.visibility = "hidden";
    };
    return (
      <button
        type="button"
        className={styles.tileBtn}
        onClick={() => play(item)}
        data-cursor="PLAY"
        aria-label={`Play ${video.title} — ${label}${video.duration ? `, ${video.duration}` : ""}`}
      >
        {!fits && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.fill} src={src} alt="" loading="lazy" decoding="async" onError={hide} />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={fits ? styles.cover : styles.contain}
          src={src}
          alt=""
          loading={frame === "wide" ? "eager" : "lazy"}
          decoding="async"
          onError={hide}
        />
        <span className={styles.scrim} aria-hidden="true" />
        <span className={styles.vplay} aria-hidden="true">
          <svg viewBox="0 0 12 14">
            <path d="M0 0v14l12-7z" fill="#fff" />
          </svg>
        </span>
        {video.duration && (
          <span className={`${styles.dur} f-sans`} aria-hidden="true">
            {video.duration}
          </span>
        )}
        <span className={styles.tileText} aria-hidden="true">
          <span className={`${styles.tileKicker} f-sans caps`}>{label}</span>
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

        {/* ---------------- Featured ---------------- */}
        {lead && (
          <div className={`${styles.tile} ${styles.lead}`} data-a>
            {/* Keyed by the tab, so a change fades the new card in. */}
            <div key={`${category}-${lead.video.id}`} className={styles.swap}>
              {tile(lead, "wide")}
            </div>
          </div>
        )}

        {/* ---------------- Categories ---------------- */}
        <div className={styles.tabs} role="group" aria-label="Filter videos by category" data-a>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.tab} f-cond caps`}
              aria-pressed={category === t.id}
              onClick={() => setCategory(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ---------------- The row ---------------- */}
        <div className={styles.carousel} data-a>
          <ul
            ref={rowRef}
            key={category}
            className={styles.reels}
            aria-label={`${CATEGORY_LABEL[category]} videos`}
            aria-live="polite"
          >
            {row.map((item) => (
              <li key={item.video.id} className={`${styles.tile} ${styles.reel}`}>
                {tile(item, "tall")}
              </li>
            ))}
          </ul>

          {row.length > 1 && (
            <>
              <button
                type="button"
                className={`${styles.arrow} ${styles.arrowL}`}
                aria-label="Previous videos"
                onClick={() => page(-1)}
                disabled={ends.start}
              >
                <svg viewBox="0 0 11 23" aria-hidden="true">
                  <path d="M9.5 1.5 1.5 11.5l8 10" />
                </svg>
              </button>
              <button
                type="button"
                className={`${styles.arrow} ${styles.arrowR}`}
                aria-label="More videos"
                onClick={() => page(1)}
                disabled={ends.end}
              >
                <svg viewBox="0 0 11 23" aria-hidden="true">
                  <path d="m1.5 1.5 8 10-8 10" />
                </svg>
              </button>
            </>
          )}
        </div>

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
