"use client";

/**
 * JOIN THE MOVEMENT — section 3, "Ready? Make it official." (mockups/Join
 * The Movement/3.png, a 1024 x 1536 phone frame).
 *
 * The sign-up: a tracked eyebrow over a red rule, a two-line leaning
 * headline, the "CREATE YOUR RUSH 5OUR ACCOUNT" line and a lead, then the
 * red-framed form — four fields with grey line icons (the password one with
 * a show/hide eye), two checkboxes, the glowing red button — followed by
 * "ONCE YOU'RE IN…" between rules, four perks divided by red hairlines, and
 * "FREE TO JOIN. BUILT TO GROW." between rules.
 *
 * ▸ BACKEND SEAM — `submitSignup` is a stub: Phase 1 ships the form's UI
 *   and the account system is Phase 3 (see RUSH5OUR-Implementation-Plan.md,
 *   3.1). To go live, replace its body with a POST to an `app/api/signup`
 *   route handler; the pending, sent and failed states are already handled
 *   here, as the Contact form's are.
 *
 * MOTION:
 *   • the eyebrow decodes, the rule draws, the headline's characters rise,
 *     the two lines under it lift
 *   • the form rises; its fields cascade, the checkboxes follow, the button
 *     wipes open
 *   • "once you're in" draws its rules as its characters rise; the dividers
 *     drop, each perk's icon draws itself, its text lifts
 *   • the closing line draws its rules as its characters rise
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn, prepareStrokes } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import Icon from "@/components/ui/Icon";
import { joinSignup } from "@/data/join";
import styles from "./JoinSignup.module.css";

interface Values {
  name: string;
  email: string;
  username: string;
  password: string;
  updates: boolean;
  agree: boolean;
}

type Field = keyof Values;
type Errors = Partial<Record<Field, string>>;

/** Each perk icon's own size, so the field icons' classes stay separate. */
const PERK_ICON: Record<string, string> = {
  envelope: styles.perkEnvelope,
  target: styles.perkTarget,
  gift: styles.perkGift,
  bolt: styles.perkBolt,
};

const EMPTY: Values = { name: "", email: "", username: "", password: "", updates: false, agree: false };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[a-z0-9._]{3,24}$/i;

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Tell us your name.";
  if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address.";
  if (!USERNAME_RE.test(v.username.trim())) e.username = "3–24 letters, numbers, dots or underscores.";
  if (v.password.length < 8) e.password = "At least 8 characters.";
  if (!v.agree) e.agree = "You’ll need to agree to the Terms to join.";
  return e;
}

async function submitSignup(values: Values): Promise<void> {
  // BACKEND SEAM — see the header comment.
  await new Promise((r) => setTimeout(r, 900));
  void values;
}

export function JoinSignup() {
  const rootRef = useRef<HTMLElement>(null);
  const { ready, reduced } = useMotion();

  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [showPassword, setShowPassword] = useState(false);

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
      prepareStrokes(q(`.${styles.perks}`)[0] as HTMLElement);

      /* --- statement ---------------------------------------------------- */
      const head = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.head}`)[0], start: "top 80%" },
      });
      (q(`.${styles.eyebrowWord}`) as HTMLElement[]).forEach((w, i) => {
        head.add(scramble(w, 0.8), i * 0.12);
      });
      head.fromTo(q(`.${styles.rule}`), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: EASE_IO }, 0.2);
      const title = q(`.${styles.title}`)[0] as HTMLElement | undefined;
      if (title) charsIn(head, splitTitle(title), 0.25, 0.04);
      head.fromTo(
        q(`.${styles.create}, .${styles.lead}`),
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.12 },
        1.0,
      );

      /* --- form --------------------------------------------------------- */
      const form = q(`.${styles.panel}`)[0] as HTMLElement | undefined;
      if (form) {
        const inF = gsap.utils.selector(form);
        gsap
          .timeline({ defaults: { ease: EASE }, scrollTrigger: { trigger: form, start: "top 82%" } })
          .fromTo(form, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, 0)
          .fromTo(
            inF(`.${styles.field}, .${styles.checkRow}`),
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 },
            0.3,
          )
          .fromTo(
            inF(`.${styles.submitWrap}`),
            { opacity: 0, clipPath: "inset(0 50% 0 50%)" },
            { opacity: 1, clipPath: "inset(0 0% 0 0%)", duration: 1, ease: EASE_IO, clearProps: "clipPath" },
            0.9,
          );
      }

      /* --- once you're in ----------------------------------------------- */
      const once = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.once}`)[0], start: "top 85%" },
      });
      once.fromTo(q(`.${styles.onceRule}`), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: EASE_IO }, 0);
      const ot = q(`.${styles.onceTitle}`)[0] as HTMLElement | undefined;
      if (ot) charsIn(once, splitTitle(ot), 0.1, 0.04);
      once
        .fromTo(q(`.${styles.divider}`), { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: EASE_IO }, 0.5)
        .fromTo(
          q(`.${styles.perks} .i-stroke`),
          { strokeDashoffset: (_i: number, el: Element) => Number((el as SVGElement).dataset.len ?? 0) },
          { strokeDashoffset: 0, duration: 1.1, stagger: 0.04, ease: "power2.inOut" },
          0.55,
        )
        .fromTo(
          q(`.${styles.perkTitle}, .${styles.perkBody}`),
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.06 },
          0.7,
        );

      /* --- closing line ------------------------------------------------- */
      const close = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: q(`.${styles.close}`)[0], start: "top 95%" },
      });
      close.fromTo(q(`.${styles.closeRule}`), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: EASE_IO }, 0);
      const ct = q(`.${styles.closeTitle}`)[0] as HTMLElement | undefined;
      if (ct) charsIn(close, splitTitle(ct), 0.1, 0.04);
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  /* --- submit ------------------------------------------------------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    const next = validate(values);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("sending");
    try {
      await submitSignup(values);
      setStatus("sent");
      setValues(EMPTY);
    } catch {
      setStatus("error");
    }
  };

  const setText = (key: Field) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (status !== "idle") setStatus("idle");
  };

  const setFlag = (key: "updates" | "agree") => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.checked }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (status !== "idle") setStatus("idle");
  };

  const c = joinSignup;

  const textField = (
    key: "name" | "email" | "username" | "password",
    icon: "user" | "envelope" | "at" | "lock",
    type: string,
    autoComplete: string,
  ) => (
    <div className={styles.slot}>
      <label className={styles.field} data-a>
        <Icon name={icon} className={`${styles.fieldIcon} ${styles[icon]}`} />
        <input
          type={key === "password" && showPassword ? "text" : type}
          name={key}
          autoComplete={autoComplete}
          placeholder={c.fields[key]}
          aria-label={c.fields[key]}
          aria-invalid={Boolean(errors[key])}
          value={values[key]}
          onChange={setText(key)}
          className={styles.input}
        />
        {key === "password" && (
          <button
            type="button"
            className={styles.eye}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((s) => !s)}
          >
            <Icon name="eye" className={styles.eyeIcon} />
            {showPassword && <span className={styles.eyeSlash} aria-hidden="true" />}
          </button>
        )}
      </label>
      {errors[key] && <span className={styles.error}>{errors[key]}</span>}
    </div>
  );

  return (
    <section ref={rootRef} id="signup" className={styles.section} aria-labelledby="join-signup-title">
      <div className={styles.atmos} aria-hidden="true" />

      <div className={styles.col}>
        {/* ---------------- Statement ---------------- */}
        <div className={styles.head}>
          <p className={`${styles.eyebrow} f-sans cz caps`}>
            {c.eyebrow.map((w) => (
              <span key={w} className={styles.eyebrowWord}>
                {w}
              </span>
            ))}
          </p>
          <span className={styles.rule} aria-hidden="true" />

          <h2 id="join-signup-title" className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner t-white">{c.titleWhite}</span>
            </span>
            <span className="line f-display cz glow-text">
              <span className="line-inner t-red">{c.titleRed}</span>
            </span>
          </h2>

          <p className={`${styles.create} f-display cz caps`} data-a>
            <span className={styles.slant}>
              {c.createLead} <span className={styles.red}>{c.createBrand}</span> {c.createTail}
            </span>
          </p>
          <p className={`${styles.lead} f-sans cz`} data-a>
            {c.lead}
          </p>
        </div>

        {/* ---------------- Form ---------------- */}
        <form className={styles.panel} onSubmit={handleSubmit} noValidate data-a>
          {textField("name", "user", "text", "name")}
          {textField("email", "envelope", "email", "email")}
          {textField("username", "at", "text", "username")}
          {textField("password", "lock", "password", "new-password")}

          <label className={`${styles.checkRow} f-sans`} data-a>
            <input type="checkbox" className={styles.checkInput} checked={values.updates} onChange={setFlag("updates")} />
            <span className={styles.checkBox} aria-hidden="true" />
            <span className={`${styles.checkLabel} cz`}>{c.updatesLabel}</span>
          </label>

          <div className={styles.slot}>
            <label className={`${styles.checkRow} f-sans`} data-a>
              <input
                type="checkbox"
                className={styles.checkInput}
                checked={values.agree}
                onChange={setFlag("agree")}
                aria-invalid={Boolean(errors.agree)}
              />
              <span className={styles.checkBox} aria-hidden="true" />
              <span className={`${styles.checkLabel} cz`}>
                {c.agree.map((run, i) =>
                  run.href ? (
                    <a key={i} href={run.href} className={styles.checkLink}>
                      {run.text}
                    </a>
                  ) : (
                    <span key={i}>{run.text}</span>
                  ),
                )}
              </span>
            </label>
            {errors.agree && <span className={styles.error}>{errors.agree}</span>}
          </div>

          <div className={styles.submitWrap}>
            <button
              type="submit"
              className={styles.submit}
              disabled={status === "sending"}
              aria-busy={status === "sending"}
              aria-live="polite"
            >
              <span className="f-cond cz caps">{status === "sending" ? c.sending : c.submit}</span>
              {status === "sending" ? (
                <span className={styles.spinner} aria-hidden="true" />
              ) : (
                <svg className={styles.submitArrow} viewBox="0 0 32 20" aria-hidden="true">
                  <path d="M1 10h29M21 1.5l9 8.5-9 8.5" />
                </svg>
              )}
            </button>
            {status === "sent" && (
              <p className={`${styles.note} ${styles.noteSent}`} role="status">
                <svg className={styles.noteIcon} viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 12.5l5.2 5.2L20 6.8" />
                </svg>
                <span>
                  <strong className="f-cond caps">{c.sentTitle}</strong>
                  {c.sent}
                </span>
              </p>
            )}
            {status === "error" && (
              <p className={`${styles.note} ${styles.noteError}`} role="alert">
                <svg className={styles.noteIcon} viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 7v6.5M12 17v.5" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <span>
                  <strong className="f-cond caps">{c.failedTitle}</strong>
                  {c.failed}
                </span>
              </p>
            )}
          </div>
        </form>

        {/* ---------------- Once you're in ---------------- */}
        <div className={styles.once}>
          <span className={`${styles.onceRule} ${styles.onceL}`} aria-hidden="true" />
          <h3 className={styles.onceTitle}>
            <span className="line f-display cz">
              <span className="line-inner">
                <span className="t-white">{c.onceWhite} </span>
                <span className="t-red">{c.onceRed}</span>
              </span>
            </span>
          </h3>
          <span className={`${styles.onceRule} ${styles.onceR}`} aria-hidden="true" />
        </div>

        <ul className={styles.perks}>
          {c.perks.map((p, i) => (
            <li key={p.title} className={styles.perk}>
              {i > 0 && <span className={styles.divider} aria-hidden="true" data-a />}
              <span className={styles.perkIconSlot}>
                <Icon name={p.icon} className={`${styles.perkIcon} ${PERK_ICON[p.icon] ?? ""}`} />
              </span>
              <h4 className={`${styles.perkTitle} f-cond cz caps`} data-a>
                {p.title}
              </h4>
              <p className={`${styles.perkBody} f-sans cz`} data-a>
                {p.body.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </p>
            </li>
          ))}
        </ul>

        {/* ---------------- Closing line ---------------- */}
        <div className={styles.close}>
          <span className={`${styles.closeRule} ${styles.closeL}`} aria-hidden="true" />
          <p className={styles.closeTitle}>
            <span className="line f-display cz">
              <span className="line-inner">
                <span className="t-white">{c.closeWhite} </span>
                <span className="t-red">{c.closeRed}</span>
              </span>
            </span>
          </p>
          <span className={`${styles.closeRule} ${styles.closeR}`} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

export default JoinSignup;
