/**
 * MOTION HELPERS — the reusable building blocks every section composes from.
 *
 * Keeping these here (rather than inside section components) is what makes
 * the whole page feel like one piece of choreography: a headline reveals the
 * same way in the hero as it does in the FAQ, because it is literally the
 * same function.
 *
 * Everything is transform/opacity/clip-path only, so the compositor can run
 * it at 60fps without touching layout.
 */
import { gsap, EASE, EASE_IO, hasFinePointer } from "./gsap";
import { scramble, splitTitle } from "./split";

type TL = gsap.core.Timeline;

/* ------------------------------------------------------------------------ */
/* Handwritten accents                                                       */
/* ------------------------------------------------------------------------ */

/**
 * "Writes" a handwritten accent: each marker line is unmasked left-to-right
 * at a speed proportional to its length (longer words take longer to write),
 * then the red underline strokes itself on.
 *
 * The inset mask is deliberately over-sized top/bottom (-40%) so the tilted,
 * skewed glyphs are never clipped while the mask sweeps across.
 */
export function writeHand(tl: TL, el: Element | null, at: number): TL {
  if (!el) return tl;

  let t = at;
  el.querySelectorAll<HTMLElement>(".hand-line").forEach((line) => {
    const d = 0.2 + (line.textContent ?? "").trim().length * 0.045;
    tl.fromTo(
      line,
      { clipPath: "inset(-40% 100% -40% -10%)" },
      { clipPath: "inset(-40% -10% -40% -10%)", duration: d, ease: "power1.inOut" },
      t,
    );
    t += d * 0.8; // overlap, so the pen never fully stops between words
  });

  const underline = el.querySelector<SVGPathElement>(".hand-underline path");
  if (underline) {
    tl.fromTo(
      underline,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.6, ease: "power2.out" },
      t - 0.05,
    );
  }

  return tl;
}

/* ------------------------------------------------------------------------ */
/* Headlines                                                                 */
/* ------------------------------------------------------------------------ */

/**
 * Raises split characters from behind their mask with a slight rotation, so
 * the line reads as physically hinged rather than simply sliding.
 */
export function charsIn(tl: TL, chars: Element[], at: number, stagger = 0.028): TL {
  return tl.fromTo(
    chars,
    { yPercent: 118, rotate: 10, transformOrigin: "0% 100%" },
    { yPercent: 0, rotate: 0, duration: 1.3, stagger, ease: EASE },
    at,
  );
}

/**
 * The standard section-heading reveal, shared by sections 2-6:
 * eyebrow decodes → its rule draws → headline characters rise → a highlight
 * sweeps the letters → supporting copy lifts → the hand accent writes itself.
 *
 * @param head       the `[data-head]` block containing the eyebrow and h2
 * @param copy       supporting paragraphs to lift in after the headline
 * @param extraHand  a hand accent living outside `head`
 */
export function headReveal(
  head: HTMLElement,
  { copy = [], extraHand = null }: { copy?: Element[]; extraHand?: Element | null } = {},
): TL {
  const title = head.querySelector<HTMLElement>("h1, h2");
  const tl = gsap.timeline({
    defaults: { ease: EASE },
    scrollTrigger: { trigger: head, start: "top 80%" },
  });

  const eyebrowLabel = head.querySelector<HTMLElement>(".js-eyebrow-label");
  if (eyebrowLabel) tl.add(scramble(eyebrowLabel, 0.9), 0);

  const eyebrowRules = head.querySelectorAll(".js-eyebrow-rule");
  if (eyebrowRules.length) {
    tl.fromTo(eyebrowRules, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: EASE_IO }, 0.1);
  }

  if (title) {
    charsIn(tl, splitTitle(title), 0.1);
    tl.add(() => title.classList.add("sheen"), 0.9);
  }

  if (copy.length) {
    tl.fromTo(copy, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, 0.45);
  }

  writeHand(tl, extraHand ?? head.querySelector(".accent"), 0.7);

  return tl;
}

/* ------------------------------------------------------------------------ */
/* Border trace                                                              */
/* ------------------------------------------------------------------------ */

/**
 * Sends a single point of light once around an element's border. Used as a
 * "this just arrived" accent on cards, the CTA bar and the featured player.
 */
export function runTrace(tl: TL, trace: Element | null, at: number, dur: number) {
  if (!trace) return;
  tl.fromTo(
    trace,
    { "--angle": "-60deg" },
    { "--angle": "300deg", duration: dur, ease: "power2.inOut" },
    at,
  )
    .fromTo(trace, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" }, at)
    .to(trace, { opacity: 0, duration: 0.5, ease: "power1.in" }, at + dur - 0.5);
}

/** Appends a `.card-trace` layer to an element and returns it. */
export function injectTrace(el: Element): HTMLElement {
  const existing = el.querySelector<HTMLElement>(":scope > .card-trace");
  if (existing) return existing;
  const trace = document.createElement("span");
  trace.className = "card-trace";
  trace.setAttribute("aria-hidden", "true");
  el.appendChild(trace);
  return trace;
}

/**
 * Prepares SVG icon strokes for a draw-on animation by setting each path's
 * dash array to its own length. Returns a setter for the "undrawn" state.
 */
export function prepareStrokes(scope: ParentNode) {
  scope.querySelectorAll<SVGGeometryElement>(".i-stroke").forEach((el) => {
    const len = el.getTotalLength ? Math.ceil(el.getTotalLength()) + 1 : 80;
    el.style.strokeDasharray = `${len} ${len}`;
    el.dataset.len = String(len);
  });
}

/* ------------------------------------------------------------------------ */
/* Pointer interactions                                                      */
/* ------------------------------------------------------------------------ */

/**
 * Card lift + 3D tilt toward the cursor, with the border trace looping while
 * hovered. Tilt is skipped on touch devices, where there is no hover state
 * to leave and a stuck rotation would look broken.
 *
 * @param amt   maximum tilt in degrees
 * @param lift  how far the card rises, in px
 * @returns a cleanup function that removes every listener
 */
export function tilt(el: HTMLElement, amt: number, lift: number): () => void {
  const trace = el.querySelector<HTMLElement>(".card-trace");
  let loop: gsap.core.Tween | null = null;
  let rx: ((v: number) => void) | null = null;
  let ry: ((v: number) => void) | null = null;

  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    ry?.(((e.clientX - r.left) / r.width - 0.5) * amt);
    rx?.(-((e.clientY - r.top) / r.height - 0.5) * amt);
  };

  if (hasFinePointer()) {
    gsap.set(el, { transformPerspective: 900 });
    rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
    ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
    el.addEventListener("pointermove", onMove);
  }

  const onEnter = () => {
    gsap.to(el, { y: -lift, duration: 0.6, ease: "power3.out", overwrite: "auto" });
    if (!trace) return;
    loop?.kill();
    loop = gsap.fromTo(
      trace,
      { "--angle": "0deg" },
      { "--angle": "360deg", duration: 2.6, ease: "none", repeat: -1 },
    );
    gsap.to(trace, { opacity: 1, duration: 0.4, overwrite: "auto" });
  };

  const onLeave = () => {
    gsap.to(el, { y: 0, duration: 0.8, ease: "power3.out", overwrite: "auto" });
    rx?.(0);
    ry?.(0);
    if (trace) {
      gsap.to(trace, {
        opacity: 0,
        duration: 0.5,
        overwrite: "auto",
        onComplete: () => loop?.kill(),
      });
    }
  };

  el.addEventListener("pointerenter", onEnter);
  el.addEventListener("pointerleave", onLeave);

  return () => {
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerenter", onEnter);
    el.removeEventListener("pointerleave", onLeave);
    loop?.kill();
  };
}

/**
 * Makes an element drift toward the cursor while it is nearby. Applied to the
 * `.magnet` wrapper rather than the button, so the button's own hover
 * transform stays independent.
 *
 * @param strength fraction of the cursor offset to follow (0.1–0.35 reads best)
 */
export function magnetic(el: HTMLElement, strength = 0.25): () => void {
  if (!hasFinePointer()) return () => {};

  const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
  const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });

  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    xTo((e.clientX - (r.left + r.width / 2)) * strength);
    yTo((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    xTo(0);
    yTo(0);
  };

  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerleave", onLeave);

  return () => {
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerleave", onLeave);
  };
}

/**
 * A simple vertical lift, for cards that should rise without tilting.
 */
export function lift(el: HTMLElement, distance = 10): () => void {
  const onEnter = () =>
    gsap.to(el, { y: -distance, duration: 0.6, ease: "power3.out", overwrite: "auto" });
  const onLeave = () => gsap.to(el, { y: 0, duration: 0.8, ease: "power3.out", overwrite: "auto" });

  el.addEventListener("pointerenter", onEnter);
  el.addEventListener("pointerleave", onLeave);

  return () => {
    el.removeEventListener("pointerenter", onEnter);
    el.removeEventListener("pointerleave", onLeave);
  };
}

/** Shared ambient loop for any scroll cue: the line fills, the chevron bobs. */
export function animateScrollCue(cue: Element): gsap.core.Animation[] {
  const line = cue.querySelector(".js-cue-line");
  const chev = cue.querySelector(".js-cue-chev");
  const anims: gsap.core.Animation[] = [];

  if (line) {
    anims.push(
      gsap
        .timeline({ repeat: -1, repeatDelay: 0.35 })
        .fromTo(
          line,
          { scaleY: 0, transformOrigin: "50% 0%" },
          { scaleY: 1, duration: 0.7, ease: "power2.inOut" },
        )
        .set(line, { transformOrigin: "50% 100%" })
        .to(line, { scaleY: 0, duration: 0.6, ease: "power2.inOut" }),
    );
  }

  if (chev) {
    anims.push(
      gsap.to(chev, { y: 5, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: -1 }),
    );
  }

  return anims;
}

/* ------------------------------------------------------------------------ */
/* Idle cost control                                                         */
/* ------------------------------------------------------------------------ */

/**
 * Pauses looping animations while `el` is outside the viewport.
 *
 * Ambient loops (`repeat: -1`) otherwise run for the entire life of the page,
 * including for sections nobody can see. Each running tween keeps GSAP's
 * ticker writing styles every frame, so the main thread never goes idle — and
 * scroll updates then have to queue behind that work, which is felt as
 * judder rather than as slowness.
 *
 * An IntersectionObserver is used rather than a ScrollTrigger on purpose: it
 * fires only when the element crosses the boundary, so it adds nothing at all
 * to the scroll path itself. `rootMargin` wakes the loops slightly before the
 * section arrives, so nothing visibly starts mid-scroll.
 *
 * @returns a cleanup function that disconnects the observer
 */
export function pauseWhenOffscreen(
  el: Element,
  anims: Array<gsap.core.Animation | null | undefined>,
): () => void {
  const list = anims.filter(Boolean) as gsap.core.Animation[];
  if (list.length === 0) return () => {};

  if (typeof IntersectionObserver === "undefined") return () => {};

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries[0]?.isIntersecting ?? true;
      list.forEach((a) => (visible ? a.play() : a.pause()));
    },
    { rootMargin: "200px 0px" },
  );
  io.observe(el);

  return () => io.disconnect();
}

export { EASE, EASE_IO };
