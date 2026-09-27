"use client";

/**
 * ABOUT — section 1, "We create moments." (About mockup, a 950 x 1655 frame).
 *
 * Composition: a full-bleed night crowd photograph under a dark gradient and
 * the site's red atmosphere, with the headline top-left, a handwritten marker
 * note upper right, and the scroll cue centred at the foot.
 *
 * MOTION, in one orchestrated timeline:
 *   1. the photograph settles out of a slight push-in
 *   2. the eyebrow label decodes and its rule draws
 *   3. the headline's characters rise from behind their line masks
 *   4. body copy lifts, then the CTA row
 *   5. the marker note is written on, underline last
 *
 * Every tween is transform / opacity / clip-path, so none of it touches
 * layout, and all of it is skipped under `prefers-reduced-motion`.
 *
 * NOTE ON GPU HINTS: nothing here carries a standing `will-change` or
 * `translateZ(0)`. That was tried project-wide and reverted (see the note on
 * `.line-inner` in globals.css) — permanently promoted layers are what made
 * the headline drop characters on some devices, and blanket promotion also
 * turned every animated element into a containing block, which broke layout.
 * GSAP promotes each target for the duration of a tween and releases it
 * after, which is the only time these elements actually move.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn, writeHand } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { openIntroGate } from "@/lib/motion/intro";
import { useMotion } from "@/components/motion/MotionProvider";
import { useVideoPlayer } from "@/components/ui/VideoPlayer";
import Eyebrow from "@/components/ui/Eyebrow";
import HandAccent from "@/components/ui/HandAccent";
import RedButton from "@/components/ui/RedButton";
import ScrollCue from "@/components/ui/ScrollCue";
import { aboutHero } from "@/data/about";
import styles from "./AboutHero.module.css";

export function AboutHero() {
  const rootRef = useRef<HTMLElement>(null);
  const { ready, reduced } = useMotion();
  const { open: openVideo } = useVideoPlayer();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !ready) return;

    /* This page has no Preloader, and the intro gate is only ever opened by
       the Preloader. The shared Nav waits on that gate before revealing its
       logo and burger, so without this call the header would stay invisible
       here forever. Opening it is a no-op if something already has. */
    openIntroGate();

    const q = gsap.utils.selector(root);

    // Reduced motion: reveal everything, wire nothing.
    if (reduced) {
      gsap.set(q("[data-a]"), { visibility: "visible" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(q("[data-a]"), { visibility: "visible" });

      const tl = gsap.timeline({ defaults: { ease: EASE } });

      /* --- background -------------------------------------------------- */
      // Settles out of a push-in rather than into one, so the photograph is
      // already filling the frame on the first painted pixel.
      tl.fromTo(
        q(`.${styles.photo}`),
        { scale: 1.08, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.8, ease: "power2.out" },
        0,
      );

      /* --- eyebrow ----------------------------------------------------- */
      const label = q(".js-eyebrow-label")[0] as HTMLElement | undefined;
      if (label) tl.add(scramble(label, 0.9), 0.25);

      const rules = q(".js-eyebrow-rule");
      if (rules.length) {
        tl.fromTo(rules, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: EASE_IO }, 0.35);
      }

      /* --- headline ---------------------------------------------------- */
      // `splitTitle` walks every `.line-inner` in the headline, wraps each
      // glyph, and sets the aria-label from the full text so the split is
      // invisible to assistive tech. `.line` masks its contents, so the
      // characters rise from behind their own edge.
      const titleEl = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (titleEl) charsIn(tl, splitTitle(titleEl), 0.4);

      /* --- body and CTAs ----------------------------------------------- */
      tl.fromTo(
        q(`.${styles.body}`),
        { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1 },
        0.95,
      ).fromTo(
        q(`.${styles.ctas} > *`),
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.12 },
        1.15,
      );

      /* --- marker note -------------------------------------------------- */
      // `writeHand` unmasks each written line left-to-right, then strokes the
      // red underline on — the same pen the homepage accents use.
      writeHand(tl, q(`.${styles.accent}`)[0] ?? null, 1.3);

      /* --- cue ---------------------------------------------------------- */
      tl.fromTo(
        q(`.${styles.cueWrap}`),
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9 },
        1.7,
      );
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  const { media, storyVideo } = aboutHero;

  return (
    <section ref={rootRef} className={styles.about} aria-label={aboutHero.eyebrow}>
      {/* ---------------- Background ----------------
          The photograph is the mockup's own, lifted from the mockup file —
          see the note on `media` in data/about.ts for what that means and
          what to swap in when the client sends the original. */}
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.photo} data-a>
          <picture>
            <source media="(min-width: 640px)" srcSet={media.wide.src} />
            <img
              className={styles.img}
              src={media.tall.src}
              width={media.tall.width}
              height={media.tall.height}
              alt={media.alt}
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </div>
      </div>

      <div className={styles.shade} aria-hidden="true" />

      {/* ---------------- Marker note ---------------- */}
      <HandAccent
        lines={aboutHero.accentLines}
        className={styles.accent}
        underline="long"
        underlineClassName={styles.accentUnderline}
        hideUntilRevealed
      />

      {/* ---------------- Copy ---------------- */}
      <div className={styles.copy}>
        <Eyebrow
          label={aboutHero.eyebrow}
          className={styles.eyebrow}
          labelClassName={styles.eyebrowLabel}
          ruleClassName={styles.eyebrowRule}
        />

        <h1 className={styles.title}>
          {aboutHero.titleWhite.map((line) => (
            <span key={line} className="line f-display cz">
              <span className="line-inner t-white">{line}</span>
            </span>
          ))}
          {aboutHero.titleRed.map((line) => (
            <span key={line} className="line f-display cz glow-text">
              <span className="line-inner t-red">{line}</span>
            </span>
          ))}
        </h1>

        {/* Each line is its own block so the breaks match the mockup exactly
            rather than depending on where the font happens to wrap. They are
            still plain text, so a narrow viewport can re-wrap within a line
            instead of overflowing. */}
        <p className={`${styles.body} f-sans cz`} data-a>
          {aboutHero.bodyLines.map((line) => (
            <span key={line} className={styles.bodyLine}>
              {line}
            </span>
          ))}
        </p>

        <div className={styles.ctas}>
          <div data-a>
            <RedButton
              label={aboutHero.primaryCta.label}
              href={aboutHero.primaryCta.href}
              className={styles.btn}
              arrow="long"
              magnetStrength={0.25}
            />
          </div>

          <div data-a>
            {/* VIDEO: `storyVideo.videoUrl` in data/about.ts. Empty shows the
                player's poster state rather than breaking. */}
            <button
              type="button"
              className={styles.playGroup}
              data-cursor="PLAY"
              aria-label={`Watch ${storyVideo.title}`}
              onClick={() =>
                openVideo({
                  title: storyVideo.title,
                  url: storyVideo.videoUrl,
                  poster: storyVideo.poster,
                })
              }
            >
              <span className="magnet">
                <span className={styles.play}>
                  <svg viewBox="0 0 12 14" aria-hidden="true">
                    <path d="M0 0v14l12-7z" fill="#fff" />
                  </svg>
                </span>
              </span>
              <span className={`${styles.playLabel} f-sans cz caps`} aria-hidden="true">
                {storyVideo.label.map((l) => (
                  <span key={l} style={{ display: "block" }}>
                    {l}
                  </span>
                ))}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- Scroll cue ---------------- */}
      <ScrollCue
        label={aboutHero.cue.label}
        href={aboutHero.cue.href}
        className={styles.cueWrap}
        labelClassName={styles.cueLabel}
        lineClassName={styles.cueLine}
        chevClassName={styles.cueChev}
        hideUntilRevealed
      />
    </section>
  );
}

export default AboutHero;
