"use client";

/**
 * VIDEOS — section 2, "Video series" (mockups/Videos/2.png, a 941 x 1672
 * phone frame).
 *
 * The page's index: a tracked eyebrow over the leaning VIDEO SERIES headline
 * with a red brush under it and four short lines at its right, a tracked
 * tagline, then five series cards — poster at the left, title, two lines of
 * copy, a "watch series" button and a ghost numeral — and a close: the play
 * mark on a rule, "new videos every day." and TAP IN & WATCH NOW.
 *
 * The five series are short VERTICAL Reels: "watch series" (or the poster)
 * opens the series in the full-screen feed viewer (VideoFeed.tsx). The
 * series and their videos come from data/videos.ts — BACKEND SEAM.
 *
 * The red grunge is the mockup's own, as are the play mark on its rule and
 * the posters, lifted from it as images (the posters until the real
 * thumbnails come) — see data/videos-page.ts. The card panels, their borders
 * and the glowing buttons are drawn live.
 *
 * LAYOUT: at the frame's width and above, every block sits where the mockup
 * puts it. Under 640px the type floors (12px titles, 9px copy) outgrow the
 * mockup's panels, so each card grows to fit its copy and the button drops
 * beneath it; the page's grunge stretches with the section.
 *
 * MOTION (scroll-triggered):
 *   • the eyebrow decodes, the headline's characters rise, the brush sweeps
 *     on, the aside lines and the tagline lift
 *   • each card rises as it arrives, its poster settling from a slight zoom
 *   • the play mark wipes on, the closing eyebrow decodes and its characters
 *     rise
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import RedButton from "@/components/ui/RedButton";
import VideoFeed from "@/components/videos/VideoFeed";
import { shortSeries, type ShortSeries, type TitleRun } from "@/data/videos";
import { videosSeries } from "@/data/videos-page";
import styles from "./VideosSeries.module.css";

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

export function VideosSeries() {
  const rootRef = useRef<HTMLElement>(null);
  const { ready, reduced } = useMotion();
  /** The series open in the feed viewer, if any. */
  const [open, setOpen] = useState<ShortSeries | null>(null);

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
        scrollTrigger: { trigger: q(`.${styles.head}`)[0], start: "top 80%" },
      });
      const eyebrow = q(`.${styles.eyebrow}`)[0] as HTMLElement | undefined;
      if (eyebrow) head.add(scramble(eyebrow, 0.9), 0);
      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(head, splitTitle(title), 0.15, 0.04);
      head
        .fromTo(
          q(`.${styles.brush}`),
          { clipPath: "inset(-10% 100% -10% 0)" },
          { clipPath: "inset(-10% 0% -10% 0)", duration: 0.9, ease: EASE_IO, clearProps: "clipPath" },
          0.9,
        )
        .fromTo(q(`.${styles.aside} span`), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, 0.7)
        .fromTo(q(`.${styles.tagline}`), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 1.1);

      q(`.${styles.card}`).forEach((card) => {
        gsap
          .timeline({
            defaults: { ease: EASE },
            scrollTrigger: { trigger: card, start: "top 92%" },
          })
          .fromTo(card, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0)
          .fromTo(card.querySelector(`.${styles.btnWrap}`), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.3)
          .fromTo(card.querySelector("img"), { scale: 1.08 }, { scale: 1, duration: 1.4, ease: EASE_IO }, 0);
      });

      const close = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.close}`)[0], start: "top 90%" },
      });
      close.fromTo(
        q(`.${styles.playMark}`),
        { clipPath: "inset(-10% 50% -10% 50%)", opacity: 0 },
        { clipPath: "inset(-10% 0% -10% 0%)", opacity: 1, duration: 1.1, ease: EASE_IO, clearProps: "clipPath" },
        0,
      );
      const closeEyebrow = q(`.${styles.closeEyebrow}`)[0] as HTMLElement | undefined;
      if (closeEyebrow) close.add(scramble(closeEyebrow, 0.9), 0.2);
      const closeTitle = q(`.${styles.closeTitle}`)[0] as HTMLElement | undefined;
      if (closeTitle) charsIn(close, splitTitle(closeTitle), 0.3, 0.035);
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  const c = videosSeries;

  return (
    <section ref={rootRef} id="series" className={styles.section} aria-labelledby="videos-series-title">
      {/* The mockup's own grunge, everything else removed. */}
      <div className={styles.atmos} aria-hidden="true" />

      <div className={styles.frame}>
        <div className={styles.head}>
          <p className={`${styles.eyebrow} f-sans cz caps`}>{c.eyebrow}</p>

          <h2 id="videos-series-title" className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner">
                <Runs runs={c.title} />
              </span>
            </span>
          </h2>

          {/* The dry-brush stroke under the headline, lifted from the mockup
              as an alpha image. A fixed 636px asset. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.brush}
            src="/assets/images/videos-series-brush.webp"
            width={636}
            height={32}
            alt=""
            aria-hidden="true"
            decoding="async"
            data-a
          />

          <p className={`${styles.aside} f-sans cz caps`}>
            {c.aside.map((l) => (
              <span key={l} data-a>
                {l}
              </span>
            ))}
          </p>

          <p className={`${styles.tagline} f-sans cz caps`} data-a>
            {c.tagline}
          </p>
        </div>

        <ul className={styles.list}>
          {shortSeries.map((s) => {
            const titleText = s.title.map((line) => line.map((r) => r.text).join("")).join(" ");
            const openFeed = () => setOpen(s);
            return (
              <li key={s.id} id={`series-${s.id}`} className={styles.card} data-a>
                <button type="button" className={styles.thumb} onClick={openFeed} aria-label={`${c.cta}: ${titleText}`} tabIndex={-1}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.thumbnail} width={429} height={220} alt={s.thumbnailAlt} loading="lazy" decoding="async" />
                </button>

                <div className={styles.body}>
                  <h3 className={`${styles.cardTitle} f-display cz caps`}>
                    {s.title.map((line, i) => (
                      <span key={i} className={styles.cardLine}>
                        <Runs runs={line} />
                      </span>
                    ))}
                  </h3>
                  <p className={`${styles.desc} f-sans cz`}>
                    {s.description.map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </p>
                </div>

                <span className={`${styles.num} f-display cz`} aria-hidden="true">
                  {s.number}
                </span>

                <div className={styles.btnWrap}>
                  <RedButton label={c.cta} onClick={openFeed} className={styles.btn} wrapperClassName={styles.btnMagnet} arrow="short" magnetStrength={0.1} />
                </div>
              </li>
            );
          })}
        </ul>

        <div className={styles.close}>
          {/* The play mark on its rule, lifted from the mockup as an alpha
              image. A fixed 862px asset. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.playMark}
            src="/assets/images/videos-series-play.webp"
            width={862}
            height={74}
            alt=""
            aria-hidden="true"
            decoding="async"
            data-a
          />
          <p className={`${styles.closeEyebrow} f-sans cz caps`}>{c.closing.eyebrow}</p>
          <p className={styles.closeTitle}>
            <span className="line f-display cz">
              <span className="line-inner">
                <Runs runs={c.closing.title} />
              </span>
            </span>
          </p>
        </div>
      </div>

      {open && (
        <VideoFeed
          series={{ name: open.title.map((line) => line.map((r) => r.text).join("")).join(" "), videos: open.videos, platformUrl: open.platformUrl }}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}

export default VideosSeries;
