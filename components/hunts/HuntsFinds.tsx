"use client";

/**
 * RUSH HUNTS — section 5, "Found in the wild" (mockups/Rush Hunts/5.png, a
 * 950 x 1655 phone frame).
 *
 * A centred statement — red tracked eyebrow between two rules, a very wide
 * two-line headline, a tracked subline — over a carousel of community
 * finds. Each card is a photograph with a location chip, over a strip with
 * the find's number, status, place and reward. The next card shows at the
 * right edge. Arrows, a label and dots sit under the carousel, then the red
 * button and a tracked line between two rules.
 *
 * The first photograph and the edge grunge are lifted from the mockup file
 * (see data/hunts.ts).
 *
 * CAROUSEL: the track slides by one card at a time — arrows, dots, a swipe
 * or a drag. It is not the shared `useCarousel` hook, which cross-fades a
 * stack of slides; here the cards sit side by side and the neighbour shows.
 *
 * MOTION:
 *   • the eyebrow decodes between its rules drawing outward, the headline's
 *     characters rise, the subline lifts
 *   • the cards rise in turn, the controls and button lift
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import RedButton from "@/components/ui/RedButton";
import { huntsFinds } from "@/data/hunts";
import styles from "./HuntsFinds.module.css";

/** px a drag must travel before it turns the card. */
const SWIPE = 50;

export function HuntsFinds() {
  const rootRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const indexRef = useRef(0);
  const draggedRef = useRef(false);
  const { ready, reduced } = useMotion();
  const [index, setIndex] = useState(0);

  const c = huntsFinds;
  const count = c.finds.length;

  /** Distance from one card's edge to the next, as laid out right now. */
  const pitch = useCallback(() => {
    const slides = trackRef.current?.children;
    if (!slides || slides.length < 2) return 0;
    return (slides[1] as HTMLElement).offsetLeft - (slides[0] as HTMLElement).offsetLeft;
  }, []);

  const goTo = useCallback(
    (next: number, instant = false) => {
      const track = trackRef.current;
      if (!track) return;
      const n = Math.max(0, Math.min(count - 1, next));
      indexRef.current = n;
      setIndex(n);
      const x = -n * pitch();
      if (instant || reduced) gsap.set(track, { x });
      else gsap.to(track, { x, duration: 0.9, ease: EASE, overwrite: true });
    },
    [count, pitch, reduced],
  );

  /* --- drag / swipe, and keeping the offset true on resize --------------- */
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    let x0 = 0;
    let y0 = 0;
    let base = 0;
    let active = false;
    let dragging = false;

    const onDown = (ev: PointerEvent) => {
      if (ev.pointerType === "mouse" && ev.button !== 0) return;
      active = true;
      dragging = false;
      draggedRef.current = false;
      x0 = ev.clientX;
      y0 = ev.clientY;
      base = -indexRef.current * pitch();
    };
    const onMove = (ev: PointerEvent) => {
      if (!active) return;
      const dx = ev.clientX - x0;
      const dy = ev.clientY - y0;
      if (!dragging) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
        dragging = true;
        draggedRef.current = true;
        viewport.setPointerCapture(ev.pointerId);
        viewport.classList.add(styles.dragging);
      }
      // Past either end the track resists.
      const min = -(count - 1) * pitch();
      let x = base + dx;
      if (x > 0) x *= 0.3;
      else if (x < min) x = min + (x - min) * 0.3;
      gsap.set(track, { x });
    };
    const onUp = (ev: PointerEvent) => {
      if (!active) return;
      active = false;
      viewport.classList.remove(styles.dragging);
      if (!dragging) return;
      dragging = false;
      const dx = ev.clientX - x0;
      if (dx < -SWIPE) goTo(indexRef.current + 1);
      else if (dx > SWIPE) goTo(indexRef.current - 1);
      else goTo(indexRef.current);
    };
    // A drag that ends over a card must not follow its link.
    const onClick = (ev: MouseEvent) => {
      if (!draggedRef.current) return;
      ev.preventDefault();
      ev.stopPropagation();
      draggedRef.current = false;
    };
    const onResize = () => gsap.set(track, { x: -indexRef.current * pitch() });

    viewport.addEventListener("pointerdown", onDown);
    viewport.addEventListener("pointermove", onMove);
    viewport.addEventListener("pointerup", onUp);
    viewport.addEventListener("pointercancel", onUp);
    viewport.addEventListener("click", onClick, true);
    window.addEventListener("resize", onResize);

    return () => {
      viewport.removeEventListener("pointerdown", onDown);
      viewport.removeEventListener("pointermove", onMove);
      viewport.removeEventListener("pointerup", onUp);
      viewport.removeEventListener("pointercancel", onUp);
      viewport.removeEventListener("click", onClick, true);
      window.removeEventListener("resize", onResize);
    };
  }, [count, goTo, pitch]);

  /* --- entrance ---------------------------------------------------------- */
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
      head.fromTo(q(`.${styles.eyebrowRule}`), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: EASE_IO }, 0);
      const label = q(`.${styles.eyebrowLabel}`)[0] as HTMLElement | undefined;
      if (label) head.add(scramble(label, 0.9), 0.05);
      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(head, splitTitle(title), 0.2, 0.04);
      head.fromTo(q(`.${styles.subline}`), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.9);

      gsap
        .timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: q(`.${styles.viewport}`)[0], start: "top 82%" },
        })
        .fromTo(
          q(`.${styles.card}`),
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1, stagger: 0.14 },
          0,
        )
        .fromTo(
          q(`.${styles.chip}`),
          { y: -12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.14 },
          0.5,
        );

      gsap
        .timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: q(`.${styles.controls}`)[0], start: "top 92%" },
        })
        .fromTo(q(`.${styles.controls}`), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0)
        .fromTo(q(`.${styles.ctaWrap}`), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0.15)
        .fromTo(q(`.${styles.footRule}`), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: EASE_IO }, 0.3)
        .fromTo(q(`.${styles.footLabel}`), { opacity: 0 }, { opacity: 1, duration: 1 }, 0.5);
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <section ref={rootRef} id="finds" className={styles.section} aria-labelledby="hunts-finds-title">
      <div className={styles.atmos} aria-hidden="true" />

      <div className={`frame ${styles.frame}`}>
        {/* ---------------- Statement ---------------- */}
        <div className={styles.head}>
          <p className={styles.eyebrow}>
            <span className={`${styles.eyebrowRule} ${styles.ruleL}`} aria-hidden="true" />
            <span className={`${styles.eyebrowLabel} f-cond cz caps`}>{c.eyebrow}</span>
            <span className={`${styles.eyebrowRule} ${styles.ruleR}`} aria-hidden="true" />
          </p>

          <h2 id="hunts-finds-title" className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner t-white">{c.titleWhite}</span>
            </span>
            <span className="line f-display cz">
              <span className="line-inner t-red">{c.titleRed}</span>
            </span>
          </h2>

          <p className={`${styles.subline} f-sans cz caps`} data-a>
            {c.subline}
          </p>
        </div>

        {/* ---------------- Carousel ---------------- */}
        <div className={styles.stage}>
          <div
            ref={viewportRef}
            className={styles.viewport}
            role="group"
            aria-roledescription="carousel"
            aria-label={c.eyebrow}
          >
            <ul ref={trackRef} className={styles.track}>
              {c.finds.map((find, i) => (
                <li
                  key={find.number}
                  className={styles.slide}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${count}`}
                >
                  <a
                    className={styles.card}
                    href={find.href}
                    draggable={false}
                    tabIndex={i === index ? 0 : -1}
                    data-a
                  >
                    <span className={styles.photo}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={find.photo.src}
                        width={find.photo.width}
                        height={find.photo.height}
                        alt={find.photo.alt}
                        decoding="async"
                        loading="lazy"
                        draggable={false}
                      />
                    </span>

                    <span className={`${styles.chip} f-sans`}>
                      <svg className={styles.chipPin} viewBox="0 0 17 24" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M8.5 0C3.8 0 0 3.7 0 8.3 0 14 8.5 24 8.5 24S17 14 17 8.3C17 3.7 13.2 0 8.5 0Zm0 11.6a3.4 3.4 0 1 1 0-6.8 3.4 3.4 0 0 1 0 6.8Z"
                        />
                      </svg>
                      <span>{find.location}</span>
                    </span>

                    <span className={styles.info}>
                      <span className={`${styles.number} f-display cz`}>{find.number}</span>
                      <span className={styles.rule1} aria-hidden="true" />
                      <span className={`${styles.status} f-cond cz caps`}>{find.status}</span>
                      <span className={`${styles.place} f-sans cz`}>{find.place}</span>
                      <span className={styles.rule2} aria-hidden="true" />
                      <span className={`${styles.rewardLabel} f-sans cz caps`}>{c.rewardLabel}</span>
                      <span className={`${styles.reward} f-display cz`}>{find.reward}</span>
                      <svg className={styles.chev} viewBox="0 0 17 32" aria-hidden="true">
                        <path d="M2 2l13 14L2 30" />
                      </svg>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.controls} data-a>
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowL}`}
              aria-label="Previous find"
              disabled={index === 0}
              onClick={() => goTo(index - 1)}
            >
              <svg viewBox="0 0 45 44" aria-hidden="true">
                <path d="M43.5 22H2M22 2 2 22l20 20" />
              </svg>
            </button>

            <p className={`${styles.swipe} f-sans cz caps`}>{c.swipe}</p>

            <div className={styles.dots}>
              {c.finds.map((find, i) => (
                <button
                  key={find.number}
                  type="button"
                  className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                  aria-label={`Show find ${find.number}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>

            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowR}`}
              aria-label="Next find"
              disabled={index === count - 1}
              onClick={() => goTo(index + 1)}
            >
              <svg viewBox="0 0 45 44" aria-hidden="true">
                <path d="M1.5 22H43M23 2l20 20-20 20" />
              </svg>
            </button>
          </div>

          <div className={styles.ctaWrap} data-a>
            <RedButton
              label={c.cta.label}
              href={c.cta.href}
              className={styles.cta}
              wrapperClassName={styles.ctaMagnet}
              arrow="short"
              magnetStrength={0.1}
            />
          </div>

          <p className={styles.foot}>
            <span className={`${styles.footRule} ${styles.footTop}`} aria-hidden="true" data-a />
            <span className={`${styles.footLabel} f-sans cz caps`} data-a>
              {c.foot}
            </span>
            <span className={`${styles.footRule} ${styles.footBottom}`} aria-hidden="true" data-a />
          </p>
        </div>
      </div>
    </section>
  );
}

export default HuntsFinds;
