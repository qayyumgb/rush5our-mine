"use client";

/**
 * FEATURED VIDEOS — section 3, rebuilt to the client's reference (their
 * "Featured Videos" mockup, 950-wide frame like the rest of the homepage).
 *
 * The heading (eyebrow, FEATURED VIDEOS, the subline, the hand-written
 * "press play"), then:
 *   • FEATURED SLIDES — four long-form videos at 16:9, swiped through (or
 *     dragged with a mouse) and chosen with the dots below. Each: the play
 *     button, category pill, title, short line, runtime; the first carries
 *     "LATEST".
 *   • the dots, and "VIEW ALL VIDEOS" → the long-form videos (Videos page)
 *   • CATEGORY tabs — All, then one per series; they filter the cards.
 *   • the CARDS — three across: a square thumbnail with its runtime, the
 *     title and a short line under it. No view counts, menus or play icons:
 *     the whole card plays. More than three swipe sideways.
 *   • the red "WATCH ALL VIDEOS" button → the short-form series
 *
 * CONTENT is data/videos.ts — the Videos page's own list. The slides are
 * the featured videos with a `featuredOrder`, in that order. The cards' "All" tab is the videos flagged
 * `featured`, the series taken in turn; a category tab shows its whole
 * series, the flagged ones first. A card's picture is its `cardThumbnail`
 * (1:1), else its own frame cropped square; a slide's is its `thumbnail`
 * (16:9). The short line is the video's `caption`, else its series'
 * `tagline`.
 *
 * PLAYBACK stays on the site, in its two players: a horizontal video opens
 * the landscape lightbox (components/ui/VideoPlayer.tsx), a vertical one
 * the Videos page's swipe viewer (components/videos/VideoFeed.tsx).
 *
 * MOTION: the heading reveals as the other section headings do; the slides
 * open out of an inset while a red trace runs round them; the dots, tabs
 * and cards rise; a tab change fades the new cards in; the button opens
 * from the centre.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, headReveal, injectTrace, runTrace } from "@/lib/motion/helpers";
import { useMotion } from "@/components/motion/MotionProvider";
import { useVideoPlayer } from "@/components/ui/VideoPlayer";
import Eyebrow from "@/components/ui/Eyebrow";
import HandAccent from "@/components/ui/HandAccent";
import RedButton from "@/components/ui/RedButton";
import VideoFeed from "@/components/videos/VideoFeed";
import {
  homeSpotlight,
  homeVideos,
  videoCategories,
  videosContent,
  type FeedVideo,
  type HomeFeatured,
  type VideoCategoryId,
} from "@/data/videos";
import styles from "./VideosSection.module.css";

const CATEGORY = Object.fromEntries(videoCategories.map((c) => [c.id, c])) as Record<
  VideoCategoryId,
  (typeof videoCategories)[number]
>;

/** The short line under a title: the video's own, else its series'. */
const blurb = (v: FeedVideo) => v.caption || CATEGORY[v.category].tagline;

/** "All": the series' featured videos taken in turn, so the row mixes. */
function interleave(lists: HomeFeatured[][]): HomeFeatured[] {
  const out: HomeFeatured[] = [];
  const longest = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < longest; i++) for (const list of lists) if (list[i]) out.push(list[i]);
  return out;
}

/** The cards for one tab. */
function cardsFor(videos: HomeFeatured[], category: VideoCategoryId): HomeFeatured[] {
  const inCategory = (id: VideoCategoryId) => videos.filter((f) => f.video.category === id);
  if (category === "all") {
    return interleave(
      videoCategories.filter((c) => c.id !== "all").map((c) => inCategory(c.id).filter((f) => f.video.featured)),
    );
  }
  const all = inCategory(category);
  return [...all.filter((f) => f.video.featured), ...all.filter((f) => !f.video.featured)];
}

/** The distance from one item of a scroller to the next. */
function stepOf(el: HTMLElement) {
  const first = el.firstElementChild as HTMLElement | null;
  return first ? first.offsetWidth + (parseFloat(getComputedStyle(el).columnGap) || 0) : 0;
}

/**
 * Drag-to-scroll for a mouse (touch already swipes natively): press and
 * drag sideways; letting go glides to the nearest item. A drag doesn't
 * count as a click on the item it started on.
 */
function useDragScroll<T extends HTMLElement = HTMLUListElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startX = 0;
    let startLeft = 0;
    let down = false;
    let moved = false;
    let settle = 0;
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
    /* Glide to the nearest item before snapping is back on: turned straight
       back on, Chrome returns to the item it last snapped to. */
    const onUp = () => {
      if (!down) return;
      down = false;
      if (!moved) return;
      // A row that doesn't snap (the tabs) just stays where it was let go.
      el.classList.remove(styles.dragging);
      if (getComputedStyle(el).scrollSnapType === "none") return;
      el.classList.add(styles.dragging);
      const step = stepOf(el);
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

/** Hides a picture that fails to load, leaving the dark ground. */
const hide = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.visibility = "hidden";
};

export interface VideosSectionProps {
  /** The featured slides, in order. */
  spotlight?: HomeFeatured[];
  /** Every video the cards can show; the `featured` ones make up "All". */
  videos?: HomeFeatured[];
}

export function VideosSection({ spotlight = homeSpotlight, videos = homeVideos }: VideosSectionProps) {
  const rootRef = useRef<HTMLElement>(null);
  const { ready, reduced } = useMotion();
  const { open: openVideo } = useVideoPlayer();
  /** The vertical video open in the swipe viewer, if any. */
  const [feed, setFeed] = useState<HomeFeatured | null>(null);
  const [category, setCategory] = useState<VideoCategoryId>("all");
  const [slide, setSlide] = useState(0);
  const slidesRef = useDragScroll();
  const cardsRef = useDragScroll();
  const tabsRef = useDragScroll<HTMLDivElement>();
  /** Whether more tabs lie past either edge — those edges fade. */
  const [tabsMore, setTabsMore] = useState({ start: false, end: false });

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const measure = () => {
      const max = el.scrollWidth - el.clientWidth;
      setTabsMore({ start: el.scrollLeft > 2, end: el.scrollLeft < max - 2 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener("scroll", measure, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", measure);
    };
  }, [tabsRef]);

  /** Only the tabs that have something to show. */
  const tabs = useMemo(
    () => videoCategories.filter((c) => c.id === "all" || videos.some((f) => f.video.category === c.id)),
    [videos],
  );
  const cards = useMemo(() => cardsFor(videos, category), [videos, category]);

  const play = ({ video, series }: HomeFeatured) => {
    if (video.orientation === "horizontal") {
      openVideo({ url: video.src, poster: video.thumbnail || video.poster, title: video.title });
    } else {
      setFeed({ video, series, index: 0 });
    }
  };

  /* --- slides: which one is showing, and the dots ----------------------- */
  useEffect(() => {
    const el = slidesRef.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const step = stepOf(el);
        if (step) setSlide(Math.max(0, Math.min(spotlight.length - 1, Math.round(el.scrollLeft / step))));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
    };
  }, [slidesRef, spotlight.length]);

  const goTo = (i: number) => {
    const el = slidesRef.current;
    if (!el) return;
    el.scrollTo({ left: i * stepOf(el), behavior: reduced ? "auto" : "smooth" });
  };

  /* --- a tab change: back to the start, the new cards fade in ----------- */
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = cardsRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    if (!reduced) {
      el.animate(
        [
          { opacity: 0, transform: "translateY(14px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 600, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
    }
  }, [category, cardsRef, reduced]);

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
      const spot = q(`.${styles.spot}`)[0] as HTMLElement | undefined;
      if (spot) injectTrace(spot);

      if (head) {
        const tl = headReveal(head, { copy: q(`.${styles.sub}`) });
        if (spot) {
          tl.fromTo(
            spot,
            { y: 60, opacity: 0, clipPath: "inset(8% 6% 8% 6% round 14px)" },
            { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0% round 14px)", duration: 1.5, ease: EASE, clearProps: "clipPath" },
            0.3,
          ).fromTo(
            spot.querySelectorAll(`.${styles.slide}:first-child :is(.${styles.badge}, .${styles.slidePill}, .${styles.slideTitle}, .${styles.slideSub})`),
            { yPercent: 110, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1, stagger: 0.08 },
            1.0,
          );
          runTrace(tl, spot.querySelector(".card-trace"), 0.9, 2);
        }
      }

      gsap
        .timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: q(`.${styles.spotBar}`)[0], start: "top 92%" },
        })
        .fromTo(q(`.${styles.spotBar}`), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, clearProps: "transform" }, 0)
        .fromTo(q(`.${styles.tab}`), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, clearProps: "transform" }, 0.1)
        .fromTo(q(`.${styles.cardItem}`), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, clearProps: "transform,opacity" }, 0.25);

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

        {/* ---------------- Featured slides ---------------- */}
        {spotlight.length > 0 && (
          <>
            <div className={styles.spot} aria-roledescription="carousel" aria-label="Featured videos" data-a>
              <ul ref={slidesRef} className={styles.slides}>
                {spotlight.map((item, i) => {
                  const { video } = item;
                  return (
                    <li
                      key={video.id}
                      className={styles.slide}
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`${i + 1} of ${spotlight.length}`}
                    >
                      <button
                        type="button"
                        className={styles.slideBtn}
                        onClick={() => play(item)}
                        data-cursor="PLAY"
                        aria-label={`Play ${video.title}${video.duration ? `, ${video.duration}` : ""}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={video.thumbnail || video.poster}
                          alt=""
                          loading={i === 0 ? "eager" : "lazy"}
                          decoding="async"
                          onError={hide}
                        />
                        <span className={styles.scrim} aria-hidden="true" />
                        {i === 0 && (
                          <span className={`${styles.badge} f-sans caps`} aria-hidden="true">
                            {videosContent.latest}
                          </span>
                        )}
                        <span className={styles.vplay} aria-hidden="true">
                          <svg viewBox="0 0 12 14">
                            <path d="M0 0v14l12-7z" fill="#fff" />
                          </svg>
                        </span>
                        <span className={styles.slideText} aria-hidden="true">
                          <span className={`${styles.slidePill} f-sans caps`}>{CATEGORY[video.category].label}</span>
                          <span className={`${styles.slideTitle} f-display caps`}>{video.title}</span>
                          <span className={`${styles.slideSub} f-sans caps`}>{blurb(video)}</span>
                        </span>
                        {video.duration && (
                          <span className={`${styles.dur} f-sans`} aria-hidden="true">
                            {video.duration}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* ---------------- Dots + view all (long-form) ---------------- */}
            <div className={styles.spotBar} data-a>
              {spotlight.length > 1 && (
                <div className={styles.dots} role="group" aria-label="Choose a featured video">
                  {spotlight.map((item, i) => (
                    <button
                      key={item.video.id}
                      type="button"
                      className={styles.dot}
                      aria-label={`Featured video ${i + 1}: ${item.video.title}`}
                      aria-current={i === slide ? "true" : undefined}
                      onClick={() => goTo(i)}
                    />
                  ))}
                </div>
              )}
              <a href={videosContent.viewAllLong.href} className={`${styles.viewLong} f-sans caps`}>
                <span>{videosContent.viewAllLong.label}</span>
                <svg viewBox="0 0 30 16" aria-hidden="true">
                  <path d="M0 8h28M21 1l7 7-7 7" />
                </svg>
              </a>
            </div>
          </>
        )}

        {/* ---------------- Categories ---------------- */}
        <div
          ref={tabsRef}
          className={`${styles.tabs} ${tabsMore.start ? styles.moreStart : ""} ${tabsMore.end ? styles.moreEnd : ""}`}
          role="group"
          aria-label="Filter videos by category"
          data-a
        >
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

        {/* ---------------- Cards ---------------- */}
        <ul ref={cardsRef} className={styles.cards} aria-label={`${CATEGORY[category].label} videos`} data-a>
          {cards.map((item) => {
            const { video } = item;
            return (
              <li key={video.id} className={styles.cardItem}>
                <button
                  type="button"
                  className={styles.card}
                  onClick={() => play(item)}
                  data-cursor="PLAY"
                  aria-label={`Play ${video.title} — ${blurb(video)}${video.duration ? `, ${video.duration}` : ""}`}
                >
                  <span className={styles.thumb}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={video.cardThumbnail || video.thumbnail || video.poster}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={hide}
                    />
                    {video.duration && (
                      <span className={`${styles.cardDur} f-sans`} aria-hidden="true">
                        {video.duration}
                      </span>
                    )}
                  </span>
                  <span className={styles.cardBody} aria-hidden="true">
                    <span className={`${styles.cardTitle} f-display caps`}>{video.title}</span>
                    <span className={`${styles.cardDesc} f-sans caps`}>{blurb(video)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* ---------------- Watch all (short-form) ---------------- */}
        <div className={styles.btnWrap} data-a>
          <RedButton
            label={videosContent.viewAllShort.label}
            href={videosContent.viewAllShort.href}
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
