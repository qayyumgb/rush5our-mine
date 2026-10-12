"use client";

/**
 * VIDEOS — section 4, "The community is talking" (mockups/Videos/4.png, a
 * 941 x 1672 phone frame).
 *
 * "THE COMMUNITY IS" between two red rules over the huge red
 * TALKING with its brush; a tracked subline. Then the community wall: one
 * post card in the centre — portrait photo, avatar, handle and time, the
 * post, the TikTok mark, a column of heart / comment / share counts and a
 * handwritten "real people. real love." — flanked by the previous and next
 * posts leaning away at the frame's edges, with round prev / next buttons
 * and six dots. The close: the handwritten JOIN THE CONVO, the three
 * network marks, the handle, the FOLLOW THE MOVEMENT button, a tagline.
 *
 * WALL: `index` picks the centre post; its neighbours (wrapping) take the
 * sides. Prev / next, the dots, a swipe on the stage and the arrow keys
 * move it; the three panels cross-fade and drift in the direction of
 * travel. Posts live in data/videos-page.ts — the three the mockup shows
 * are repeated to fill its six dots; BACKEND SEAM.
 *
 * The grunge, the wordmark, the brushes, the handwriting, the marks and
 * the photos (their type blurred away) are the mockup's own.
 *
 * MOTION (scroll-triggered):
 *   • the rules draw, the eyebrow's characters rise,
 *     TALKING's characters rise and its brush sweeps on, the subline lifts
 *   • the centre card scales up as the sides slide in and the buttons pop
 *   • the handwriting wipes on, the marks pop in turn, the handle decodes,
 *     the button wipes open, the tagline decodes
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import RedButton from "@/components/ui/RedButton";
import { videosTalk, type CommunityPost } from "@/data/videos-page";
import { socialLinks } from "@/data/site";
import styles from "./VideosTalk.module.css";

const SWIPE = 40;

const MARKS = [
  { icon: "tiktok", src: "/assets/images/videos-talk-icon-tiktok.webp", w: 82, h: 90, cls: "markTiktok" },
  { icon: "youtube", src: "/assets/images/videos-talk-icon-youtube.webp", w: 110, h: 90, cls: "markYoutube" },
  { icon: "instagram", src: "/assets/images/videos-talk-icon-instagram.webp", w: 86, h: 90, cls: "markInstagram" },
] as const;

function Centre({ post, hand }: { post: CommunityPost; hand: string }) {
  return (
    <article className={styles.card} data-card aria-label={`${post.handle}, ${post.when}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.photo} src={post.photo} width={548} height={718} alt="" decoding="async" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.avatar} src={post.avatar} width={60} height={60} alt="" decoding="async" />
      <p className={`${styles.handle} f-sans cz`}>{post.handle}</p>
      <p className={`${styles.when} f-sans cz`}>{post.when}</p>
      <p className={`${styles.text} f-sans cz`}>
        {post.text.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.tiktok} src="/assets/images/videos-talk-tiktok.webp" width={62} height={64} alt="TikTok" decoding="async" />

      <div className={styles.counts}>
        <svg className={styles.heart} viewBox="0 0 48 43" aria-hidden="true">
          <path d="M24 43 4.6 24.5C-1.3 18.8-1.6 9.6 4 3.9 9.4-1.6 18.4-1.1 24 5c5.6-6.1 14.6-6.6 20-1.1 5.6 5.7 5.3 14.9-.6 20.6z" fill="#f0001d" />
        </svg>
        <span className={`${styles.count} f-sans cz`}>{post.likes}</span>
        <svg className={styles.bubble} viewBox="0 0 47 44" aria-hidden="true">
          <path d="M23.5 1C11.1 1 1 9.1 1 19.2c0 5.9 3.5 11.2 8.9 14.5L7.6 43l10.1-5.9c1.9.4 3.8.6 5.8.6C35.9 37.7 46 29.5 46 19.2 46 9.1 35.9 1 23.5 1z" fill="#fff" />
          <circle cx="13.5" cy="19.5" r="3.2" fill="#000" />
          <circle cx="23.5" cy="19.5" r="3.2" fill="#000" />
          <circle cx="33.5" cy="19.5" r="3.2" fill="#000" />
        </svg>
        <span className={`${styles.count} f-sans cz`}>{post.comments}</span>
        <svg className={styles.share} viewBox="0 0 47 38" aria-hidden="true">
          <path d="M27 1v10C12 11 3 20 1 37c6-9 14-13 26-13v10l20-16.5z" fill="#fff" />
        </svg>
        <span className={`${styles.count} f-sans cz`}>{post.shares}</span>
        <span className={styles.more} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>

      {/* The handwritten note painted across the first post, lifted from
          the mockup as an alpha image. A fixed 335px asset. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.hand} src="/assets/images/videos-talk-hand.webp" width={335} height={225} alt={hand} decoding="async" />
    </article>
  );
}

function Side({ post, side }: { post: CommunityPost; side: "left" | "right" }) {
  return (
    <div className={`${styles.side} ${side === "left" ? styles.sideLeft : styles.sideRight}`} data-card aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.sidePhoto} src={post.photo} alt="" decoding="async" />
      <div className={styles.sideBody}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.sideAvatar} src={post.avatar} width={36} height={36} alt="" decoding="async" />
        <p className={`${styles.sideHandle} f-sans cz`}>{post.handle}</p>
        <p className={`${styles.sideWhen} f-sans cz`}>{post.when}</p>
        <p className={`${styles.sideText} f-sans cz`}>
          {post.text.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </p>
      </div>
    </div>
  );
}

export function VideosTalk() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dirRef = useRef(0);
  const firstRef = useRef(true);
  const { ready, reduced } = useMotion();
  const [index, setIndex] = useState(0);

  const c = videosTalk;
  const count = c.posts.length;
  const at = (n: number) => c.posts[((n % count) + count) % count];

  const goTo = useCallback(
    (n: number, dir: number) => {
      dirRef.current = dir;
      setIndex(((n % count) + count) % count);
    },
    [count],
  );

  /* The three panels cross-fade and drift with each move. */
  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      return;
    }
    const stage = stageRef.current;
    if (!stage || reduced) return;
    const cards = stage.querySelectorAll("[data-card]");
    const tween = gsap.fromTo(cards, { opacity: 0, x: -dirRef.current * 28 }, { opacity: 1, x: 0, duration: 0.6, ease: EASE, stagger: 0.04, clearProps: "x" });
    return () => {
      tween.kill();
    };
  }, [index, reduced]);

  /* Swipe on the stage, arrow keys when it has focus. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let x0 = 0;
    let active = false;
    const onDown = (ev: PointerEvent) => {
      if (ev.pointerType === "mouse" && ev.button !== 0) return;
      x0 = ev.clientX;
      active = true;
    };
    const onUp = (ev: PointerEvent) => {
      if (!active) return;
      active = false;
      const dx = ev.clientX - x0;
      if (dx < -SWIPE) goTo(index + 1, 1);
      else if (dx > SWIPE) goTo(index - 1, -1);
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "ArrowRight") goTo(index + 1, 1);
      else if (ev.key === "ArrowLeft") goTo(index - 1, -1);
    };
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);
    stage.addEventListener("keydown", onKey);
    return () => {
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      stage.removeEventListener("keydown", onKey);
    };
  }, [index, goTo]);

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
        scrollTrigger: { trigger: q(`.${styles.top}`)[0], start: "top 80%" },
      });
      head
        .fromTo(q(`.${styles.ruleL}`), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: EASE_IO }, 0.1)
        .fromTo(q(`.${styles.ruleR}`), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: EASE_IO }, 0.1);
      const eyebrow = q(`.${styles.eyebrow}`)[0] as HTMLElement | undefined;
      if (eyebrow) charsIn(head, splitTitle(eyebrow), 0.15, 0.025);
      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(head, splitTitle(title), 0.4, 0.06);
      head
        .fromTo(
          q(`.${styles.brush}`),
          { clipPath: "inset(-10% 100% -10% 0)" },
          { clipPath: "inset(-10% 0% -10% 0)", duration: 0.8, ease: EASE_IO, clearProps: "clipPath" },
          1.2,
        )
        .fromTo(q(`.${styles.sub}`), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 1.3);

      gsap
        .timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: q(`.${styles.stage}`)[0], start: "top 80%" },
        })
        .fromTo(q(`.${styles.card}`), { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, ease: EASE_IO }, 0)
        .fromTo(q(`.${styles.sideLeft}`), { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 1, clearProps: "x" }, 0.2)
        .fromTo(q(`.${styles.sideRight}`), { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 1, clearProps: "x" }, 0.2)
        .fromTo(q(`.${styles.nav}`), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, stagger: 0.1, ease: "back.out(1.6)" }, 0.6)
        .fromTo(q(`.${styles.dot}`), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05 }, 0.8);

      const foot = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.foot}`)[0], start: "top 85%" },
      });
      foot
        .fromTo(
          q(`.${styles.join}`),
          { clipPath: "inset(-10% 100% -10% 0)", opacity: 0 },
          { clipPath: "inset(-10% 0% -10% 0)", opacity: 1, duration: 1, ease: EASE_IO, clearProps: "clipPath" },
          0,
        )
        .fromTo(q(`.${styles.markLink}`), { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, stagger: 0.12, ease: "back.out(1.6)" }, 0.5);
      const handle = q(`.${styles.handle2}`)[0] as HTMLElement | undefined;
      if (handle) foot.add(scramble(handle, 0.9), 0.8);
      foot.fromTo(
        q(`.${styles.btnWrap}`),
        { y: 20, opacity: 0, clipPath: "inset(0% 50% 0% 50%)" },
        { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: EASE_IO, clearProps: "clipPath" },
        1,
      );
      const tagline = q(`.${styles.tagline}`)[0] as HTMLElement | undefined;
      if (tagline) foot.add(scramble(tagline, 0.9), 1.4);
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  const post = at(index);

  return (
    <section ref={rootRef} id="community" className={styles.section} aria-labelledby="videos-talk-title">
      {/* The mockup's own grunge (and its R5 watermark), everything else removed. */}
      <div className={styles.atmos} aria-hidden="true" />

      <div className={styles.frame}>
        {/* ---- Head ------------------------------------------------------ */}
        <div className={styles.top}>
          <span className={`${styles.rule} ${styles.ruleL}`} aria-hidden="true" data-a />
          <span className={`${styles.rule} ${styles.ruleR}`} aria-hidden="true" data-a />

          <p className={styles.eyebrow}>
            <span className="line f-display cz">
              <span className="line-inner">{c.eyebrow}</span>
            </span>
          </p>

          <h2 id="videos-talk-title" className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner t-red">{c.title}</span>
            </span>
          </h2>

          {/* The brush under TALKING, lifted from the mockup as an alpha
              image. A fixed 610px asset. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.brush} src="/assets/images/videos-talk-brush.webp" width={610} height={30} alt="" aria-hidden="true" decoding="async" data-a />

          <p className={`${styles.sub} f-sans cz caps`} data-a>
            {c.sub}
          </p>
        </div>

        {/* ---- Wall ------------------------------------------------------ */}
        <div ref={stageRef} className={styles.stage} tabIndex={0} aria-roledescription="carousel" aria-label="Community posts">
          <Side key={`l-${index}`} post={at(index - 1)} side="left" />
          <Centre key={`c-${index}`} post={post} hand={c.hand} />
          <Side key={`r-${index}`} post={at(index + 1)} side="right" />

          <button type="button" className={`${styles.nav} ${styles.navPrev}`} onClick={() => goTo(index - 1, -1)} aria-label="Previous post" data-a>
            <svg viewBox="0 0 19 32" aria-hidden="true">
              <path d="M16.5 2.5 3 16l13.5 13.5" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" className={`${styles.nav} ${styles.navNext}`} onClick={() => goTo(index + 1, 1)} aria-label="Next post" data-a>
            <svg viewBox="0 0 19 32" aria-hidden="true">
              <path d="M2.5 2.5 16 16 2.5 29.5" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ---- Close ----------------------------------------------------- */}
        <div className={styles.foot}>
          <div className={styles.dots} role="tablist" aria-label="Choose a post">
            {c.posts.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                aria-selected={i === index}
                aria-label={`Post ${i + 1}: ${p.handle}`}
                onClick={() => goTo(i, i > index ? 1 : -1)}
                data-a
              />
            ))}
          </div>

          {/* The handwritten JOIN THE CONVO, lifted from the mockup as an
              alpha image. A fixed 520px asset. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.join} src="/assets/images/videos-talk-join.webp" width={520} height={90} alt={c.join} decoding="async" data-a />

          <ul className={styles.marks}>
            {MARKS.map((m) => {
              const link = socialLinks.find((s) => s.icon === m.icon);
              return (
                <li key={m.icon}>
                  <a className={`${styles.markLink} ${styles[m.cls]}`} href={link?.href ?? "#"} target="_blank" rel="noopener noreferrer" aria-label={link?.label ?? m.icon} data-a>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.src} width={m.w} height={m.h} alt="" decoding="async" />
                  </a>
                </li>
              );
            })}
          </ul>

          <p className={`${styles.handle2} f-display cz caps`}>{c.handle}</p>

          <div className={styles.btnWrap} data-a>
            <RedButton label={c.cta.label} href={c.cta.href} className={styles.btn} wrapperClassName={styles.btnMagnet} arrow="long" magnetStrength={0.12}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.people} src="/assets/images/videos-talk-people.webp" width={76} height={56} alt="" aria-hidden="true" decoding="async" />
            </RedButton>
          </div>

          <p className={`${styles.tagline} f-sans cz caps`}>{c.tagline}</p>
        </div>
      </div>
    </section>
  );
}

export default VideosTalk;
