"use client";

/**
 * HERO — section 1 (mockup 1.png).
 *
 * Composition: a full-bleed street photograph under layered red light, with
 * the headline anchored bottom-left and handwritten marker notes framing the
 * subject.
 *
 * MOTION, in four parts:
 *
 *  1. ENTRANCE — a single orchestrated timeline, started by the intro gate so
 *     it overlaps the preloader's wipe. The background scales down out of a
 *     push-in, a camera flash pops, the headline's characters rise from
 *     behind their masks, sub-copy lines lift one after another, the CTA
 *     wipes in, and the marker accents are written on.
 *
 *  2. AMBIENT — the red glow breathes, the lamp flickers, smoke drifts. These
 *     run forever, slowly, so the hero never feels frozen.
 *
 *  3. SCROLL — the whole background parallaxes and pushes in while the copy
 *     rises and fades, the two headline lines drift apart, and a black veil
 *     takes the section down into the next one. Accents move at their own
 *     depths.
 *
 *  4. POINTER — photo, glow and smoke shift against each other, and a soft
 *     red light trails the cursor. Fine pointers only.
 *
 * Every tween is transform/opacity/clip-path, so none of it touches layout.
 * All of it is skipped under `prefers-reduced-motion`.
 */

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, hasFinePointer } from "@/lib/motion/gsap";
import {
  EASE,
  EASE_IO,
  charsIn,
  magnetic,
  pauseWhenOffscreen,
  writeHand,
} from "@/lib/motion/helpers";
import { scramble, splitBrLines, splitTitle } from "@/lib/motion/split";
import { useMediaQuery } from "@/lib/motion/useMediaQuery";
import { whenIntroReady } from "@/lib/motion/intro";
import { useMotion } from "@/components/motion/MotionProvider";
import { useVideoPlayer } from "@/components/ui/VideoPlayer";
import HandAccent from "@/components/ui/HandAccent";
import RedButton from "@/components/ui/RedButton";
import ScrollCue from "@/components/ui/ScrollCue";
import { hero } from "@/data/hero";
import styles from "./HeroSection.module.css";

export function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);
  const playWrapRef = useRef<HTMLSpanElement>(null);
  const { ready, reduced } = useMotion();
  /* Ambient glow loops are pointer-device only — see the note in the effect. */
  const isTouch = useMediaQuery("(pointer: coarse)", false);
  const { open: openVideo } = useVideoPlayer();

  /* --- entrance + ambient + scroll + pointer ---------------------------- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !ready) return;

    const q = gsap.utils.selector(root);

    // Reduced motion: reveal everything, wire nothing.
    if (reduced) {
      gsap.set(q("[data-a]"), { visibility: "visible" });
      return;
    }

    let cancelled = false;
    /** Listener teardown that GSAP's context doesn't own. */
    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      /* ---------------------------------------------------------------- */
      /* Split text up front so measurements happen once                    */
      /* ---------------------------------------------------------------- */
      const titleEl = q(".js-hero-title")[0] as HTMLElement | undefined;
      const subEl = q(".js-hero-sub")[0] as HTMLElement | undefined;
      const titleChars = titleEl ? splitTitle(titleEl) : [];
      const subLines = subEl ? splitBrLines(subEl) : [];

      /* ---------------------------------------------------------------- */
      /* 2. AMBIENT — start immediately, they belong to the scene not the   */
      /*    entrance                                                        */
      /* ---------------------------------------------------------------- */
      // THE GLOW BREATHES ON POINTER DEVICES ONLY.
      //
      // `.glowBreathe` carries `mix-blend-mode: screen` and covers the whole
      // hero. A blended element cannot be composited on its own — the browser
      // has to re-blend it against the photograph across the full viewport
      // whenever anything about it changes. So even opacity, which is free on
      // an ordinary layer, costs a full-screen blend here, on the main thread,
      // every frame, forever.
      //
      // Scale and the smoke drift were worse still (they re-rasterised a blur
      // and a four-octave feTurbulence filter respectively) and are gone
      // everywhere. This last loop is cheap enough for a desktop and not for
      // a phone, so phones get a still glow: same picture, no per-frame work.
      // The hero's main thread is then genuinely idle when you are not
      // scrolling, which is the whole point.
      const ambient: gsap.core.Animation[] = [];

      if (!isTouch) {
        ambient.push(
          gsap.to(q(`.${styles.glowBreathe}`), {
            opacity: 0.35,
            duration: 3.6,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          }),
        );

        // The lamp flicker sits *inside* that same blended container, so it
        // carries the identical cost despite being a small element.
        ambient.push(
          gsap.to(q(`.${styles.gLamp}`), {
            keyframes: { opacity: [1, 0.6, 1, 0.8, 1] },
            duration: 2.4,
            repeat: -1,
            repeatDelay: 1.3,
            ease: "none",
          }),
        );
      }

      // Whatever is left idles out when the hero is off screen.
      if (ambient.length) cleanups.push(pauseWhenOffscreen(root, ambient));

      /* ---------------------------------------------------------------- */
      /* 3. SCROLL SCENES                                                  */
      /* ---------------------------------------------------------------- */
      const hard = { trigger: root, start: "top top", end: "bottom top", scrub: true };
      const soft = { trigger: root, start: "top top", end: "bottom top", scrub: 1 };

      gsap.to(q(`.${styles.bgParallax}`), { yPercent: 18, ease: "none", scrollTrigger: hard });
      gsap.to(q(`.${styles.photo}`), { scale: 1.12, ease: "none", scrollTrigger: hard });
      gsap.to(q(`.${styles.dim}`), { opacity: 0.7, ease: "none", scrollTrigger: hard });

      // The two headline lines slide apart as the section leaves.
      const lines = q(`.${styles.title} .line`);
      if (lines[0]) gsap.to(lines[0], { xPercent: -9, ease: "none", scrollTrigger: soft });
      if (lines[1]) gsap.to(lines[1], { xPercent: 9, ease: "none", scrollTrigger: soft });

      gsap.to(q(`.${styles.copy}`), {
        y: () => -window.innerHeight * 0.12,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom 20%", scrub: 1 },
      });

      gsap.to(q(`.${styles.cueWrap}`), {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "+=160", scrub: true },
      });

      // Accents travel at their own depths, so the frame gains dimension.
      q("[data-depth]").forEach((el) => {
        const depth = parseFloat((el as HTMLElement).dataset.depth ?? "0");
        gsap.to(el, {
          y: () => -window.innerHeight * depth,
          ease: "none",
          // 2D translate, not translate3d. GSAP's default would give each
          // accent a standing GPU layer for the whole time the hero is in
          // view, and this device drops those layers' textures and repaints
          // them empty. These are a few small blocks of text, so painting them
          // with the document costs nothing and cannot fail that way.
          force3D: false,
          scrollTrigger: soft,
        });
      });

      /* ---------------------------------------------------------------- */
      /* 4. POINTER PARALLAX                                               */
      /* ---------------------------------------------------------------- */
      if (hasFinePointer()) {
        const pointerGlow = q(`.${styles.glowPointer}`)[0];
        const px = gsap.quickTo(pointerGlow, "x", { duration: 1.2, ease: "power3.out" });
        const py = gsap.quickTo(pointerGlow, "y", { duration: 1.2, ease: "power3.out" });

        // Negative amount on the glow makes it counter-move, which reads as
        // depth rather than as the whole scene sliding.
        const layers = (
          [
            [q(`.${styles.photo}`)[0], 12],
            [q(`.${styles.glowBreathe}`)[0], -24],
            [q(`.${styles.smoke}`)[0], 18],
          ] as [Element, number][]
        )
          .filter(([el]) => !!el)
          .map(([el, amt]) => ({
            x: gsap.quickTo(el, "x", { duration: 1.4, ease: "power3.out" }),
            y: gsap.quickTo(el, "y", { duration: 1.4, ease: "power3.out" }),
            amt,
          }));

        const onMove = (e: PointerEvent) => {
          const r = root.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          layers.forEach((l) => {
            l.x(nx * l.amt * 2);
            l.y(ny * l.amt * 2);
          });
          px(e.clientX - r.left);
          py(e.clientY - r.top);
          gsap.to(pointerGlow, { opacity: 1, duration: 0.8, overwrite: "auto" });
        };

        const onLeave = () => {
          layers.forEach((l) => {
            l.x(0);
            l.y(0);
          });
          gsap.to(pointerGlow, { opacity: 0, duration: 0.8, overwrite: "auto" });
        };

        root.addEventListener("pointermove", onMove);
        root.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          root.removeEventListener("pointermove", onMove);
          root.removeEventListener("pointerleave", onLeave);
        });
      }

      /* ---------------------------------------------------------------- */
      /* 1. ENTRANCE — waits for the preloader's handoff                   */
      /* ---------------------------------------------------------------- */
      // Pre-set the entrance state now, then reveal: [data-a] elements are
      // hidden by CSS until this point, so nothing flashes un-animated.
      whenIntroReady().then(() => {
        if (cancelled) return;

        gsap.set(q("[data-a]"), { visibility: "visible" });

        const tl = gsap.timeline({ defaults: { ease: EASE } });

        tl.fromTo(
          q(`.${styles.bg}`),
          { scale: 1.25, opacity: 0 },
          { scale: 1, opacity: 1, duration: 2.6, ease: "power3.out" },
          0,
        )
          // The photo lifts out of near-black, like an exposure settling.
          .fromTo(
            q(`.${styles.img}`),
            { filter: "brightness(.2)" },
            { filter: "brightness(1)", duration: 2.4, ease: "power3.out", clearProps: "filter" },
            0.2,
          )
          // Camera flash: fast in, slow out.
          .fromTo(
            q(`.${styles.flash}`),
            { opacity: 0 },
            { opacity: 0.85, duration: 0.18, ease: "power2.in" },
            0.3,
          )
          .to(q(`.${styles.flash}`), { opacity: 0, duration: 1.4, ease: "power2.out" }, 0.48)
          // (The nav runs its own entrance off the same gate — see Nav.tsx.)
          .fromTo(
            q(`.${styles.rule}`),
            { scaleX: 0 },
            { scaleX: 1, duration: 0.9, ease: EASE_IO },
            0.55,
          );

        charsIn(tl, titleChars, 0.6);

        // The highlight sweep is a CSS animation; adding the class here keeps
        // it locked to the timeline rather than to page load.
        tl.add(() => titleEl?.classList.add("sheen"), 1.5)
          .fromTo(subLines, { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.07 }, 1.05)
          .fromTo(
            q(`.${styles.ctas} > *`),
            { y: 26, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.1, stagger: 0.12 },
            1.25,
          )
          .fromTo(
            q(`.${styles.btn}`),
            { clipPath: "inset(0% 100% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: EASE_IO, clearProps: "clipPath" },
            1.25,
          )
          .fromTo(
            q(`.${styles.playGroup} .magnet`),
            { scale: 0, rotate: -140 },
            { scale: 1, rotate: 0, duration: 1.2, ease: "back.out(1.6)" },
            1.4,
          )
          .fromTo(
            q(`.${styles.tagsRule}`),
            { scaleX: 0 },
            { scaleX: 1, duration: 0.8, ease: EASE_IO },
            1.75,
          )
          .fromTo(
            q(`.${styles.cueWrap} a`),
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 1 },
            2.0,
          );

        // Tracked caps decode one line at a time.
        q(`.${styles.tags} span`).forEach((s, i) => {
          tl.add(scramble(s as HTMLElement, 0.8), 1.3 + i * 0.12);
        });

        // Marker notes are written on, staggered so the eye follows a path
        // around the frame rather than seeing three at once.
        writeHand(tl, q(`.${styles.accentMore}`)[0], 1.35);
        writeHand(tl, q(`.${styles.accentSame}`)[0], 1.8);
        writeHand(tl, q(`.${styles.accentMoments}`)[0], 2.15);

        ScrollTrigger.refresh();
      });
    }, root);

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [ready, reduced, isTouch]);

  /* --- magnetic play button -------------------------------------------- */
  useEffect(() => {
    const el = playWrapRef.current;
    if (!el || !ready || reduced) return;
    return magnetic(el, 0.35);
  }, [ready, reduced]);

  const { media, storyVideo, accents } = hero;

  return (
    <section ref={rootRef} id="hero" className={styles.hero} aria-label={hero.titleRed}>
      {/* ---------------- Background ---------------- */}
      <div className={styles.bgParallax} aria-hidden="true">
        <div className={styles.bg} data-a>
          {/* HERO PHOTO — client asset. `tall` on phones/portrait, `wide` on
              desktop/landscape. Swap the paths in data/hero.ts. */}
          <div className={styles.photo}>
            <picture>
              <source
                media="(min-width: 1024px), (orientation: landscape) and (min-width: 640px)"
                srcSet={media.wide.src}
                width={media.wide.width}
                height={media.wide.height}
              />
              <img
                className={styles.img}
                src={media.tall.src}
                alt={media.alt}
                width={media.tall.width}
                height={media.tall.height}
                fetchPriority="high"
                decoding="async"
              />
            </picture>
          </div>

          {/* Layered red light — the brand's signature atmosphere. */}
          <div className={styles.glowBreathe}>
            <div className={`${styles.glow} ${styles.gFlare}`} />
            <div className={`${styles.glow} ${styles.gBack}`} />
            <div className={`${styles.glow} ${styles.gLamp}`} />
          </div>

          {/* Procedural smoke — no asset needed, drifts on a slow loop. */}
          <svg className={styles.smoke} viewBox="0 0 400 700" preserveAspectRatio="none">
            <filter id="hero-smoke" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.008 0.013" numOctaves="4" seed="3" />
              <feColorMatrix values="0 0 0 0 0.78  0 0 0 0 0.05  0 0 0 0 0.05  0 0 0 1.5 -0.55" />
            </filter>
            <rect width="100%" height="100%" filter="url(#hero-smoke)" />
          </svg>

          <div className={styles.flash} />
        </div>
      </div>

      <div className={styles.glowPointer} aria-hidden="true" />
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.dim} aria-hidden="true" />

      {/* ---------------- Accents ---------------- */}
      <HandAccent
        lines={accents.moreThanContent.lines}
        className={styles.accentMore}
        underline="heroMore"
        underlineClassName={styles.accentMoreUnderline}
        depth={0.35}
        hideUntilRevealed
      />

      <div className={styles.accentTags} data-depth="0.25" aria-hidden="true" data-a>
        <p className={`f-sans cz caps ${styles.tags}`}>
          {hero.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </p>
        <i className={styles.tagsRule} />
      </div>

      <HandAccent
        lines={accents.sameCity.lines}
        className={styles.accentSame}
        underline="tiny"
        greyUnderline
        underlineClassName={styles.accentSameUnderline}
        depth={0.5}
        hideUntilRevealed
      />

      <HandAccent
        lines={accents.realMoments.lines}
        className={styles.accentMoments}
        underline="short"
        greyUnderline
        underlineClassName={styles.accentMomentsUnderline}
        depth={0.15}
        hideUntilRevealed
      />

      {/* ---------------- Copy ---------------- */}
      <div className={styles.copy} data-a>
        <span className={styles.rule} aria-hidden="true" />

        <h1 className={`${styles.title} js-hero-title grunge`}>
          <span className={`line ${styles.l1} f-display cz`}>
            <span className="line-inner t-white">{hero.titleWhite}</span>
          </span>
          <span className={`line ${styles.l2} f-display cz glow-text`}>
            <span className="line-inner t-red">{hero.titleRed}</span>
          </span>
        </h1>

        <p
          className={`${styles.sub} js-hero-sub f-sans cz caps`}
          // Rendered as HTML so `splitBrLines` can turn each <br> into its own
          // masked line; the strings are static content from data/hero.ts.
          dangerouslySetInnerHTML={{ __html: hero.subLines.join("<br>") }}
        />

        <div className={styles.ctas}>
          <div>
            <RedButton
              label={hero.primaryCta.label}
              href={hero.primaryCta.href}
              className={styles.btn}
              arrow="long"
              magnetStrength={0.25}
            />
          </div>

          <div>
            {/* VIDEO: `storyVideo.videoUrl` in data/hero.ts. Empty shows the
                poster state in the player rather than breaking. */}
            <button
              type="button"
              className={styles.playGroup}
              data-cursor="PLAY"
              aria-label={`Watch ${storyVideo.title}`}
              onClick={() =>
                openVideo({
                  url: storyVideo.videoUrl,
                  poster: storyVideo.poster,
                  title: storyVideo.title,
                })
              }
            >
              <span ref={playWrapRef} className="magnet">
                <span className={styles.play}>
                  <svg viewBox="0 0 12 14" aria-hidden="true">
                    <path d="M0 0v14l12-7z" fill="#fff" />
                  </svg>
                </span>
              </span>
              <span className={`${styles.playLabel} f-sans cz caps`} aria-hidden="true">
                {storyVideo.label.split("\n").map((l, i) => (
                  <span key={i} style={{ display: "block" }}>
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
        label={hero.scrollCue}
        href="#concept"
        className={styles.cueWrap}
        labelClassName={styles.cueLabel}
        lineClassName={styles.cueLine}
        chevClassName={styles.cueChev}
        hideUntilRevealed
      />
    </section>
  );
}

export default HeroSection;
