"use client";

/**
 * FEATURED VIDEOS — section 3 (mockup 3.png).
 *
 * A featured carousel, a filter tab row, and a 3-up grid.
 *
 * ▸ BACKEND SEAM: both lists arrive as props (defaulted to the static data),
 *   so a server component can fetch them and pass them straight in.
 *
 * MOTION:
 *   • featured slides cross-wipe with a clip-path, the incoming image pushes
 *     out of an over-scale while the outgoing one drifts the other way, and
 *     the title, play button and runtime cascade in behind it
 *   • the badge rolls out upward and the new one rolls in from below
 *   • the active-tab pill slides between tabs and squashes slightly on land
 *   • filtering uses GSAP Flip, so surviving cards *move* to their new
 *     positions instead of the grid snapping
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Flip, gsap } from "@/lib/motion/gsap";
import {
  EASE,
  EASE_IO,
  headReveal,
  injectTrace,
  lift,
  runTrace,
} from "@/lib/motion/helpers";
import useCarousel from "@/lib/motion/useCarousel";
import { useMotion } from "@/components/motion/MotionProvider";
import { useVideoPlayer } from "@/components/ui/VideoPlayer";
import Eyebrow from "@/components/ui/Eyebrow";
import HandAccent from "@/components/ui/HandAccent";
import Icon from "@/components/ui/Icon";
import RedButton from "@/components/ui/RedButton";
import {
  featuredVideos as defaultFeatured,
  gridVideos as defaultGrid,
  videosContent,
  type VideoItem,
} from "@/data/videos";
import styles from "./VideosSection.module.css";

/** ms each featured slide holds before advancing. 0 turns autoplay off. */
const FEATURED_AUTOPLAY = 6500;

export interface VideosSectionProps {
  featured?: VideoItem[];
  videos?: VideoItem[];
}

export function VideosSection({
  featured = defaultFeatured,
  videos = defaultGrid,
}: VideosSectionProps) {
  const rootRef = useRef<HTMLElement>(null);
  const featRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLElement | null)[]>([]);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [activeFilter, setActiveFilter] = useState("all");
  const { ready, reduced } = useMotion();
  const { open: openVideo } = useVideoPlayer();

  const visible = useMemo(
    () => videos.filter((v) => activeFilter === "all" || v.category === activeFilter),
    [videos, activeFilter],
  );

  /* --- featured carousel ------------------------------------------------ */
  const onBadgeChange = useCallback(
    (n: number) => {
      const badge = badgeRef.current;
      const label = featured[n]?.badge ?? "";
      if (!badge) return;
      if (reduced) {
        badge.textContent = label;
        return;
      }
      // Out the top, swap the text at the midpoint, in from the bottom.
      gsap.to(badge, {
        yPercent: -120,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          badge.textContent = label;
          gsap.fromTo(
            badge,
            { yPercent: 120, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.6, ease: "expo.out" },
          );
        },
      });
    },
    [featured, reduced],
  );

  const animateSlide = useCallback(
    (from: HTMLElement, to: HTMLElement, dir: 1 | -1, done: () => void) => {
      const img = to.querySelector(`.${styles.media} img`);
      const fromImg = from.querySelector(`.${styles.media} img`);
      const text = to.querySelectorAll(`.${styles.featTitle}, .${styles.featSub}`);

      gsap
        .timeline({ onComplete: done })
        .set(to, { zIndex: 2 })
        .set(from, { zIndex: 1 })
        // The incoming frame is revealed by a hard edge sweeping across.
        .fromTo(
          to.querySelector(`.${styles.media}`),
          { clipPath: dir > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power4.inOut" },
          0,
        )
        .fromTo(img, { scale: 1.25, xPercent: 6 * dir }, { scale: 1, xPercent: 0, duration: 1.4, ease: "expo.out" }, 0.1)
        .to(fromImg, { xPercent: -8 * dir, duration: 1, ease: "power4.inOut" }, 0)
        .fromTo(text, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: "expo.out" }, 0.5)
        .fromTo(
          to.querySelector(`.${styles.vplay}`),
          { scale: 0.4, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(2)", clearProps: "transform,opacity" },
          0.6,
        )
        .fromTo(to.querySelector(`.${styles.dur}`), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 }, 0.7)
        .set([to, from, fromImg], { clearProps: "zIndex,transform" })
        .set(to.querySelector(`.${styles.media}`), { clearProps: "clipPath" });
    },
    [],
  );

  const { index: featIndex, goTo } = useCarousel({
    stageRef: featRef,
    slidesRef,
    activeClass: styles.slideActive,
    autoplay: FEATURED_AUTOPLAY,
    reduced,
    animate: animateSlide,
    onChange: onBadgeChange,
  });

  /* --- tab pill --------------------------------------------------------- */
  const movePill = useCallback(
    (instant: boolean) => {
      const tabs = tabsRef.current;
      const pill = pillRef.current;
      if (!tabs || !pill) return;

      const active = tabs.querySelector<HTMLElement>(`.${styles.tabActive}`);
      if (!active) return;

      const props = { x: active.offsetLeft, width: active.offsetWidth };
      if (instant || reduced) {
        gsap.set(pill, props);
        return;
      }
      gsap.to(pill, { ...props, duration: 0.7, ease: "expo.out" });
      // A slight vertical squash on arrival gives the pill some weight.
      gsap.fromTo(pill, { scaleY: 0.82 }, { scaleY: 1, duration: 0.6, ease: "back.out(3)" });
    },
    [reduced],
  );

  // Position the pill once the tabs exist, and keep it correct on resize.
  useEffect(() => {
    if (!ready) return;
    movePill(true);
    const onResize = () => movePill(true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [ready, movePill]);

  /* --- filtering, with Flip --------------------------------------------- */
  const handleFilter = useCallback(
    (key: string) => {
      if (key === activeFilter) return;

      const grid = gridRef.current;
      if (!grid || reduced || !ready) {
        setActiveFilter(key);
        return;
      }

      // Capture the current layout, let React re-render, then animate the
      // difference — surviving cards slide to their new slots.
      const state = Flip.getState(grid.querySelectorAll(`.${styles.card}, .${styles.empty}`));
      setActiveFilter(key);

      requestAnimationFrame(() => {
        Flip.from(state, {
          duration: 0.7,
          ease: "expo.out",
          absolute: true,
          scale: true,
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { opacity: 0, scale: 0.9, y: 30 },
              { opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.06, ease: "expo.out" },
            ),
          onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.35, ease: "power2.in" }),
        });
      });
    },
    [activeFilter, reduced, ready],
  );

  // Keep the pill under whichever tab is active, including after a re-render.
  useEffect(() => {
    if (ready) movePill(false);
  }, [activeFilter, ready, movePill]);

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
      const feat = featRef.current;
      if (feat) injectTrace(feat);

      if (head) {
        const tl = headReveal(head, { copy: q(`.${styles.sub}`) });

        tl.fromTo(
          feat,
          { y: 70, opacity: 0, clipPath: "inset(8% 6% 8% 6% round 14px)" },
          {
            y: 0,
            opacity: 1,
            clipPath: "inset(0% 0% 0% 0% round 14px)",
            duration: 1.5,
            ease: EASE,
            clearProps: "clipPath",
          },
          0.3,
        )
          .fromTo(
            q(`.${styles.slideActive} .${styles.media} img`),
            { scale: 1.3 },
            { scale: 1, duration: 2, ease: EASE },
            0.3,
          )
          .fromTo(q(`.${styles.badge}`), { xPercent: -120, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.9 }, 0.9)
          .fromTo(
            q(`.${styles.slideActive} .${styles.vplay}`),
            { scale: 0.3, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1, ease: "back.out(2)", clearProps: "transform,opacity" },
            1,
          )
          .fromTo(
            q(`.${styles.slideActive} .${styles.featTitle}, .${styles.slideActive} .${styles.featSub}`),
            { yPercent: 110, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1, stagger: 0.08 },
            1.05,
          )
          .fromTo(q(`.${styles.row}`), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1 }, 1.2);

        runTrace(tl, feat?.querySelector(".card-trace") ?? null, 0.9, 2);
      }

      /* tabs */
      gsap.fromTo(
        q(`.${styles.tab}`),
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.06,
          ease: EASE,
          scrollTrigger: { trigger: q(`.${styles.tabs}`)[0], start: "top 92%" },
          onComplete: () => gsap.set(q(`.${styles.tab}`), { clearProps: "transform" }),
        },
      );
      gsap.fromTo(
        pillRef.current,
        { scaleX: 0, transformOrigin: "left" },
        {
          scaleX: 1,
          duration: 0.9,
          ease: EASE_IO,
          scrollTrigger: { trigger: q(`.${styles.tabs}`)[0], start: "top 92%" },
        },
      );

      /* grid */
      const grid = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: gridRef.current, start: "top 85%" },
      });
      grid
        .fromTo(
          q(`.${styles.card}`),
          { y: 80, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.3, stagger: 0.14, clearProps: "transform" },
          0,
        )
        .fromTo(
          q(`.${styles.thumb} img`),
          { scale: 1.35 },
          { scale: 1, duration: 1.8, stagger: 0.14, clearProps: "transform" },
          0,
        )
        .fromTo(
          q(`.${styles.card} .${styles.dur}`),
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.14 },
          0.7,
        );

      /* watch-all button — opens from the centre outward */
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
      (q(`.${styles.card}`) as HTMLElement[]).forEach((card) => cleanups.push(lift(card, 10)));
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [ready, reduced]);

  const play = (v: VideoItem) =>
    openVideo({ url: v.videoUrl, poster: v.thumbnail, title: v.title });

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

        {/* ---------------- Featured carousel ---------------- */}
        <div
          ref={featRef}
          className={styles.feat}
          data-a
          data-cursor="DRAG"
          aria-roledescription="carousel"
          aria-label="Featured videos"
        >
          {featured.map((v, i) => (
            <article
              key={v.id}
              ref={(el) => {
                slidesRef.current[i] = el;
              }}
              className={`${styles.slide} ${i === 0 ? styles.slideActive : ""}`}
              aria-hidden={i !== featIndex}
            >
              <div className={styles.media}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.thumbnail}
                  alt=""
                  loading={i === 0 ? "eager" : "lazy"}
                  style={{ objectPosition: v.thumbnailPosition }}
                />
              </div>

              <button
                type="button"
                className={styles.vplay}
                data-cursor="PLAY"
                aria-label={`Play: ${v.title}`}
                onClick={() => play(v)}
              >
                <svg viewBox="0 0 12 14" aria-hidden="true">
                  <path d="M0 0v14l12-7z" fill="#fff" />
                </svg>
              </button>

              <div className={styles.featText}>
                <h3 className={`${styles.featTitle} f-display cz`}>{v.title}</h3>
                <p className={`${styles.featSub} f-sans cz caps`}>{v.subtitle}</p>
              </div>

              <span className={styles.dur}>{v.duration}</span>
            </article>
          ))}

          {/* Single badge element, retargeted on change — one thing that
              moves, rather than four that cross-fade. */}
          <span ref={badgeRef} className={styles.badge} aria-hidden="true">
            {featured[0]?.badge}
          </span>
        </div>

        <div className={styles.row}>
          <div className={styles.dots} role="tablist" aria-label="Choose featured video">
            {featured.map((v, i) => (
              <button
                key={v.id}
                type="button"
                role="tab"
                className={`${styles.dot} ${i === featIndex ? styles.dotActive : ""}`}
                aria-selected={i === featIndex}
                aria-label={`Video ${i + 1}`}
                onClick={() => goTo(i, i > featIndex ? 1 : -1)}
              />
            ))}
          </div>

          <a href={videosContent.viewAll.href} className={styles.viewAll}>
            <span className="f-sans cz caps">{videosContent.viewAll.label}</span>
            <Icon name="arrowRight" />
          </a>
        </div>

        {/* ---------------- Filter tabs ---------------- */}
        <div ref={tabsRef} className={styles.tabs} role="tablist" aria-label="Filter videos" data-a>
          <span ref={pillRef} className={styles.tabPill} aria-hidden="true" />
          {videosContent.filters.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={f.key === activeFilter}
              className={`${styles.tab} ${f.key === activeFilter ? styles.tabActive : ""}`}
              onClick={() => handleFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ---------------- Grid ---------------- */}
        <div ref={gridRef} className={styles.grid} data-a>
          {visible.map((v) => (
            <article key={v.id} className={styles.card}>
              <div className={styles.thumb}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.thumbnail}
                  alt=""
                  loading="lazy"
                  style={{ objectPosition: v.thumbnailPosition }}
                />
                <button
                  type="button"
                  className={styles.vplay}
                  data-cursor="PLAY"
                  aria-label={`Play: ${v.title}`}
                  onClick={() => play(v)}
                >
                  <svg viewBox="0 0 12 14" aria-hidden="true">
                    <path d="M0 0v14l12-7z" fill="#fff" />
                  </svg>
                </button>
                <span className={styles.dur}>{v.duration}</span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={`${styles.cardTitle} f-display cz`}>{v.title}</h3>
                <p className={`${styles.cardSub} f-sans cz caps`}>{v.subtitle}</p>
              </div>

              <div className={styles.cardMeta}>
                <span className={styles.views}>
                  <Icon name="eye" />
                  {v.views}
                </span>
                {/* Placeholder affordance from the mockup — wire to a share or
                    save menu when one exists. */}
                <button type="button" className={styles.kebab} aria-label={`More options for ${v.title}`}>
                  <Icon name="kebab" />
                </button>
              </div>
            </article>
          ))}

          {visible.length === 0 && (
            <div className={styles.empty}>
              <strong>Dropping soon</strong>
              <span>New episodes on the way</span>
            </div>
          )}
        </div>

        {/* ---------------- Watch all ---------------- */}
        <div className={styles.btnWrap} data-a>
          <RedButton
            label={videosContent.watchAll.label}
            href={videosContent.watchAll.href}
            className={styles.btn}
            arrow="long"
            magnetStrength={0.08}
          />
        </div>
      </div>
    </section>
  );
}

export default VideosSection;
