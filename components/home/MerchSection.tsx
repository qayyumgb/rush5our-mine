"use client";

/**
 * MERCH — section 4, "Rep the movement" (mockup 4.png).
 *
 * The Drop 01 teaser with a product carousel, then the locked progression
 * grid and the closing neon bar.
 *
 * ▸ BACKEND SEAM: `products` and `dropCards` arrive as props (defaulted to
 *   the static data), ready for a commerce API.
 *
 * MOTION:
 *   • the product carousel cross-dissolves through a blur while a red glow
 *     flashes behind it, as if the light changes with the garment
 *   • the product floats in 3D toward the cursor
 *   • drop cards hinge up with their images pushing out of an over-scale
 *   • locked cards refuse the click: the card shakes and the padlock rattles
 *   • the neon halos on the unlocked card and the bar breathe continuously
 */

import { useCallback, useEffect, useRef } from "react";
import { gsap, hasFinePointer } from "@/lib/motion/gsap";
import {
  EASE,
  EASE_IO,
  headReveal,
  injectTrace,
  pauseWhenOffscreen,
  prepareStrokes,
  runTrace,
  tilt,
  writeHand,
} from "@/lib/motion/helpers";
import { scramble } from "@/lib/motion/split";
import useCarousel from "@/lib/motion/useCarousel";
import { useMotion } from "@/components/motion/MotionProvider";
import Eyebrow from "@/components/ui/Eyebrow";
import HandAccent from "@/components/ui/HandAccent";
import Icon from "@/components/ui/Icon";
import RedButton from "@/components/ui/RedButton";
import {
  drops as defaultDrops,
  merch,
  productSlides as defaultProducts,
  type DropCard,
  type ProductSlide,
} from "@/data/merch";
import styles from "./MerchSection.module.css";

/** ms each product image holds before advancing. 0 turns autoplay off. */
const PRODUCT_AUTOPLAY = 4500;

export interface MerchSectionProps {
  products?: ProductSlide[];
  dropCards?: DropCard[];
}

export function MerchSection({
  products = defaultProducts,
  dropCards = defaultDrops,
}: MerchSectionProps) {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLElement | null)[]>([]);
  const glowRef = useRef<HTMLSpanElement>(null);
  const { ready, reduced } = useMotion();

  /* --- product carousel -------------------------------------------------- */
  const animateSlide = useCallback(
    (from: HTMLElement, to: HTMLElement, dir: 1 | -1, done: () => void) => {
      gsap
        .timeline({ onComplete: done })
        // A pulse of red light covers the swap.
        .fromTo(glowRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" }, 0)
        .to(glowRef.current, { opacity: 0, duration: 0.9, ease: "power2.inOut" }, 0.35)
        .to(
          from,
          { opacity: 0, xPercent: -5 * dir, scale: 0.92, filter: "blur(8px)", duration: 0.75, ease: "power3.inOut" },
          0,
        )
        .fromTo(
          to,
          { opacity: 0, xPercent: 6 * dir, scale: 1.08, filter: "blur(8px)" },
          {
            opacity: 1,
            xPercent: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.1,
            ease: "expo.out",
            clearProps: "filter",
          },
          0.25,
        )
        .set(from, { clearProps: "all" });
    },
    [],
  );

  const { index: productIndex, goTo } = useCarousel({
    stageRef,
    slidesRef,
    activeClass: styles.slideActive,
    autoplay: PRODUCT_AUTOPLAY,
    reduced,
    animate: animateSlide,
  });

  /* --- entrance, ambient, hover ------------------------------------------ */
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
      prepareStrokes(root);

      /* --- ambient ------------------------------------------------------ */
      // Opacity only. These two carry a 30-unit blurred `box-shadow`, so
      // scaling them forced the browser to redraw that shadow every frame,
      // on the main thread, for the whole life of the page. The neon still
      // pulses — by brightness rather than size. Same reasoning as the hero
      // glow; see the note in HeroSection.tsx.
      const neonLoop = gsap.to(q(`.${styles.dropPulse}, .${styles.barGlow}`), {
        opacity: 1,
        duration: 1.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      const textureLoop = gsap.to(q(`.${styles.stageBg}`), {
        opacity: 0.7,
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // These sit far below the fold. Without this they ran the entire time
      // someone was reading the hero.
      cleanups.push(pauseWhenOffscreen(root, [neonLoop, textureLoop]));

      /* --- teaser heading ----------------------------------------------- */
      const copy = q(`.${styles.copy}`)[0] as HTMLElement | undefined;
      if (copy) {
        const tl = headReveal(copy, {
          copy: q(`.${styles.sub}`),
          extraHand: q(`.${styles.accentLevel}`)[0],
        });

        tl.fromTo(
          q(`.${styles.btn}`),
          { clipPath: "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: EASE_IO, clearProps: "clipPath" },
          0.6,
        )
          .fromTo(q(`.${styles.badge}`), { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.12 }, 0.8)
          .fromTo(
            q(`.${styles.badge} svg`),
            { scale: 0.4, rotate: -30 },
            { scale: 1, rotate: 0, duration: 1, stagger: 0.12, ease: "back.out(2)" },
            0.8,
          )
          .fromTo(
            stageRef.current,
            { opacity: 0, x: 60, scale: 0.94 },
            { opacity: 1, x: 0, scale: 1, duration: 1.6 },
            0.1,
          )
          .fromTo(q(`.${styles.dot}`), { scale: 0 }, { scale: 1, duration: 0.6, stagger: 0.08, ease: "back.out(3)" }, 1);
      }

      // The product drifts against the page as the section scrolls past.
      gsap.fromTo(
        q(`.${styles.slides}`),
        { yPercent: 6 },
        {
          yPercent: -6,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top bottom", end: "center top", scrub: true },
        },
      );

      gsap.fromTo(
        q(`.${styles.divider}`),
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.6,
          ease: EASE_IO,
          scrollTrigger: { trigger: q(`.${styles.divider}`)[0], start: "top 90%" },
        },
      );

      /* --- progression heading ------------------------------------------ */
      const prog = q(`.${styles.prog}`)[0] as HTMLElement | undefined;
      if (prog) headReveal(prog, { copy: q(`.${styles.progIntro}`) });

      /* --- drop cards --------------------------------------------------- */
      const dropEls = q(`.${styles.drop}`) as HTMLElement[];
      const unlockedEl = q(`.${styles.unlocked}`)[0] as HTMLElement | undefined;
      if (unlockedEl) injectTrace(unlockedEl);

      const dropsTl = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.drops}`)[0], start: "top 82%" },
      });

      dropsTl
        .fromTo(
          dropEls,
          { y: 80, opacity: 0, rotateX: -12, transformPerspective: 1000, transformOrigin: "50% 100%" },
          { y: 0, opacity: 1, rotateX: 0, duration: 1.3, stagger: 0.12 },
          0,
        )
        .fromTo(
          q(`.${styles.dropMedia} img`),
          { scale: 1.3 },
          {
            // Locked cards settle at 1.04, which is where their blur needs
            // them; unlocked ones land at exactly 1.
            scale: (_i: number, el: Element) => (el.closest(`.${styles.locked}`) ? 1.04 : 1),
            duration: 1.8,
            stagger: 0.12,
          },
          0,
        )
        .fromTo(
          q(`.${styles.lock}`),
          { scale: 0, rotate: -40 },
          { scale: 1, rotate: 0, duration: 0.8, stagger: 0.12, ease: "back.out(2.5)" },
          0.6,
        )
        .fromTo(
          q(`.${styles.pill}`),
          { scale: 0.6, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.7, stagger: 0.1, ease: "back.out(2)" },
          0.5,
        )
        .fromTo(
          q(`.${styles.dropGo}`),
          { scale: 0, rotate: -90 },
          { scale: 1, rotate: 0, duration: 0.9, ease: "back.out(2)" },
          0.7,
        );

      q(`.${styles.dropLevel}`).forEach((s, i) => {
        dropsTl.add(scramble(s as HTMLElement, 0.7), 0.3 + i * 0.12);
      });
      runTrace(dropsTl, unlockedEl?.querySelector(".card-trace") ?? null, 0.6, 1.8);

      /* --- bottom bar --------------------------------------------------- */
      const bar = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.bar}`)[0], start: "top 88%" },
      });
      bar
        .fromTo(q(`.${styles.bar}`), { y: 50, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 1.3 }, 0)
        .fromTo(q(`.${styles.barDivider}`), { scaleY: 0 }, { scaleY: 1, duration: 0.8, ease: EASE_IO }, 0.4)
        .fromTo(q(`.${styles.barArt}`), { xPercent: 40, opacity: 0 }, { xPercent: 0, opacity: 0.95, duration: 1.4 }, 0.3);

      q(`.${styles.barTags} span`).forEach((s, i) => {
        bar.add(scramble(s as HTMLElement, 0.8), 0.4 + i * 0.12);
      });
      writeHand(bar, q(`.${styles.accentSupport}`)[0], 0.5);

      /* --- hover + locked feedback -------------------------------------- */
      if (unlockedEl) cleanups.push(tilt(unlockedEl, 8, 6));

      (q(`.${styles.locked}`) as HTMLElement[]).forEach((card) => {
        // Lifts a little, but stays heavy — it is, after all, locked.
        cleanups.push(tilt(card, 4, 4));

        const lock = card.querySelector(`.${styles.lock}`);
        const rattle = () =>
          gsap.fromTo(lock, { rotate: 0 }, { keyframes: { rotate: [0, -12, 9, -5, 0] }, duration: 0.6, ease: "none" });

        const refuse = () => {
          gsap.fromTo(card, { x: 0 }, { keyframes: { x: [0, -8, 7, -5, 4, 0] }, duration: 0.5, ease: "none" });
          gsap.fromTo(lock, { rotate: 0 }, { keyframes: { rotate: [0, -18, 14, -8, 0] }, duration: 0.6, ease: "none" });
        };

        card.addEventListener("pointerenter", rattle);
        card.addEventListener("click", refuse);
        cleanups.push(() => {
          card.removeEventListener("pointerenter", rattle);
          card.removeEventListener("click", refuse);
        });
      });

      // The product tips in 3D toward the cursor.
      if (hasFinePointer() && stageRef.current) {
        const slides = q(`.${styles.slides}`)[0];
        gsap.set(slides, { transformPerspective: 1000 });
        const rotY = gsap.quickTo(slides, "rotationY", { duration: 1, ease: "power3.out" });
        const rotX = gsap.quickTo(slides, "rotationX", { duration: 1, ease: "power3.out" });

        const stage = stageRef.current;
        const onMove = (e: PointerEvent) => {
          const r = stage.getBoundingClientRect();
          rotY(((e.clientX - r.left) / r.width - 0.5) * 12);
          rotX(-((e.clientY - r.top) / r.height - 0.5) * 10);
        };
        const onLeave = () => {
          rotY(0);
          rotX(0);
        };
        stage.addEventListener("pointermove", onMove);
        stage.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          stage.removeEventListener("pointermove", onMove);
          stage.removeEventListener("pointerleave", onLeave);
        });
      }
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [ready, reduced]);

  return (
    <section ref={rootRef} id="merch" className={styles.merch} aria-labelledby="merch-title">
      <div className="frame">
        <div className={styles.top}>
          {/* ---------------- Teaser copy ---------------- */}
          <div className={styles.copy}>
            <Eyebrow
              label={merch.eyebrow}
              className={styles.eyebrow}
              labelClassName={styles.eyebrowLabel}
              ruleClassName={styles.eyebrowRule}
            />

            <h2 id="merch-title" className={styles.title}>
              <span className={`line ${styles.l1} f-display cz`}>
                <span className="line-inner t-white">{merch.titleWhite}</span>
              </span>
              <span className={`line ${styles.l2} f-display cz glow-text`}>
                <span className="line-inner t-red">{merch.titleRed}</span>
              </span>
            </h2>

            <p className={`${styles.sub} f-sans cz`}>
              {merch.subLines[0]}
              <br />
              {merch.subLines[1]}
              <b>{merch.subBold}</b>
            </p>

            <RedButton
              label={merch.cta.label}
              href={merch.cta.href}
              className={styles.btn}
              arrow="short"
              magnetStrength={0.2}
            />

            <ul className={styles.badges}>
              {merch.badges.map((b) => (
                <li key={b.label.join(" ")} className={styles.badge}>
                  <Icon name={b.icon} />
                  <p className="f-sans cz caps">
                    {b.label.map((line, i) => (
                      <span key={i} style={{ display: "block" }}>
                        {line}
                      </span>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------------- Product carousel ---------------- */}
          {/* MERCH PHOTOS: replace the sources in data/merch.ts with real
              product shots — square-ish, product centred, dark background. */}
          <div
            ref={stageRef}
            className={styles.stage}
            data-cursor="DRAG"
            aria-roledescription="carousel"
            aria-label="Drop 01 products"
          >
            <div className={styles.stageBg} aria-hidden="true" />
            <span ref={glowRef} className={styles.stageGlow} aria-hidden="true" />

            <div className={styles.slides}>
              {products.map((p, i) => (
                <figure
                  key={p.src}
                  ref={(el) => {
                    slidesRef.current[i] = el;
                  }}
                  className={`${styles.slide} ${i === 0 ? styles.slideActive : ""}`}
                  aria-label={p.alt}
                  aria-hidden={i !== productIndex}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.src}
                    alt={p.alt}
                    width={p.width}
                    height={p.height}
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                </figure>
              ))}
            </div>
          </div>

          <div className={styles.dots} role="tablist" aria-label="Choose product image">
            {products.map((p, i) => (
              <button
                key={p.src}
                type="button"
                role="tab"
                className={`${styles.dot} ${i === productIndex ? styles.dotActive : ""}`}
                aria-selected={i === productIndex}
                aria-label={`Image ${i + 1}`}
                onClick={() => goTo(i, i > productIndex ? 1 : -1)}
              />
            ))}
          </div>

          <HandAccent
            lines={merch.accent.lines}
            className={styles.accentLevel}
            underline="steep"
            underlineClassName={styles.accentLevelUnderline}
          />
        </div>
      </div>

      <div className={styles.divider} data-a />

      <div className="frame">
        {/* ---------------- Progression ---------------- */}
        <div className={styles.prog}>
          <Eyebrow
            label={merch.progression.eyebrow}
            className={styles.progEyebrow}
            labelClassName={styles.progEyebrowLabel}
            ruleClassName={styles.progEyebrowRule}
          />

          <h2 className={styles.progTitle}>
            <span className="line f-display cz">
              <span className="line-inner">
                <span className="t-white">{merch.progression.titleWhite}</span>
                <span className="t-red">{merch.progression.titleRed}</span>
              </span>
            </span>
          </h2>

          <p className={`${styles.progIntro} f-sans cz`}>
            {merch.progression.intro.map((line, i) => (
              <span key={i} style={{ display: "block" }}>
                {line}
              </span>
            ))}
          </p>
        </div>

        {/* ---------------- Drop cards ---------------- */}
        {/* SWAP each image for the real product photo; locked cards are
            blurred by the stylesheet, so nothing is revealed early. */}
        <div className={styles.drops} data-a>
          {dropCards.map((drop) =>
            drop.unlocked ? (
              <a
                key={drop.id}
                href={drop.href ?? "#"}
                className={`${styles.drop} ${styles.unlocked} ${styles.neon}`}
                aria-label={`${drop.level} — ${drop.kicker} ${drop.name} (unlocked)`}
              >
                <span className={styles.dropPulse} aria-hidden="true" />
                <span className={styles.dropMedia}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={drop.image} alt="" loading="lazy" />
                </span>
                <span className={`${styles.dropLevel} f-display cz`}>{drop.level}</span>
                <span className={`${styles.pill} ${styles.pillUnlocked}`}>Unlocked</span>
                <span className={styles.dropName}>
                  <small className="f-sans cz caps">{drop.kicker}</small>
                  <strong className="f-display cz">{drop.name}</strong>
                </span>
                <span className={styles.dropGo} aria-hidden="true">
                  <Icon name="arrowRight" />
                </span>
              </a>
            ) : (
              <div
                key={drop.id}
                className={`${styles.drop} ${styles.locked}`}
                role="group"
                aria-label={`${drop.level} — ${drop.kicker} ${drop.name} (locked)`}
              >
                <span className={styles.dropMedia}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={drop.image} alt="" loading="lazy" />
                </span>
                <span className={`${styles.dropLevel} f-display cz`}>{drop.level}</span>
                <Icon name="lock" className={styles.lock} />
                <span className={styles.dropName}>
                  <small className="f-sans cz caps">{drop.kicker}</small>
                  <strong className="f-display cz">{drop.name}</strong>
                </span>
                <span className={`${styles.pill} ${styles.pillLocked}`}>Locked</span>
              </div>
            ),
          )}
        </div>

        {/* ---------------- Bottom bar ---------------- */}
        <div className={`${styles.bar} ${styles.neon}`} data-a>
          <span className={styles.barGlow} aria-hidden="true" />

          <span className={styles.barClip}>
            {/* SWAP for the brand graphic file. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.barArt} src={merch.bar.art} alt="" loading="lazy" />
          </span>

          <HandAccent
            lines={merch.bar.accent.lines}
            className={styles.accentSupport}
            underline="medium"
            underlineClassName={styles.accentSupportUnderline}
          />

          <span className={styles.barDivider} aria-hidden="true" />

          <p className={`${styles.barTags} f-sans cz caps`}>
            {merch.bar.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}

export default MerchSection;
