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
 * SIGN-UP — with `joinSignup.accountFields` on (it is), the form creates a
 *   RUSH 5OUR account: it posts all six fields to app/api/auth/signup,
 *   which creates the member unverified and emails a confirmation link.
 *   The form then says "Check your email", with a button to send the link
 *   again. With the flag off it's the plain email sign-up it was before
 *   accounts (app/api/subscribe, no username or password).
 *
 *   The rules are shared with the server (lib/auth/validation.ts, or
 *   lib/subscribe/validation.ts without accounts) — run here first as a
 *   courtesy, again there as the ones that count — and the states are
 *   idle → sending → sent | error: the button locks while sending, and an
 *   error keeps what was typed and shows the server's own reason, field
 *   by field where it has one.
 *
 * ONE PANEL, FIVE FACES (with accounts on) — the Join page is where
 *   members come and go; there are no separate sign-in or password pages
 *   and no menu entry. The other faces are in JoinAccount.tsx:
 *   • sign up    the form above (the default)
 *   • sign in    "Already a member? Sign in" swaps the panel for a sign-in
 *                form, and "Create your account" swaps it back. Links from
 *                elsewhere open it too: /join?signin=1#signup, with a
 *                `notice` (an expired link, signed out) above the fields.
 *   • forgot     "Forgot your password?" in sign-in: an email, and a reset
 *                link is sent (/join?forgot=1 opens it directly)
 *   • reset      the reset email's link, /join?reset=<token>#signup: the
 *                new password twice
 *   • signed in  a member who's already signed in sees their RUSH Code, My
 *                account and Sign out instead (asked of /api/auth/me once
 *                the page has loaded). A reset link wins over this.
 *   The line over the panel ("Create your RUSH 5OUR account") follows the
 *   face. Faces are swapped with `hidden`, never unmounted, so what's
 *   typed into one survives a look at the other.
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
import { HONEYPOT_FIELD, normalizeSubscribe, validateSubscribe } from "@/lib/subscribe/validation";
import { normalizeSignUp, validateSignUp } from "@/lib/auth/validation";
import { JoinForgot, JoinMember, JoinReset, JoinSignIn, type JoinNotice } from "./JoinAccount";
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

/** The server's own rules: the account ones with accounts on, the email
    sign-up's without. */
function validate(v: Values, accountFields: boolean): Errors {
  return accountFields ? validateSignUp(normalizeSignUp(v)) : validateSubscribe(normalizeSubscribe(v));
}

type ServerAnswer = { ok: true } | { ok: false; error: string; fields?: Errors };

class SubmitError extends Error {
  constructor(
    message: string,
    readonly fields?: Errors,
  ) {
    super(message);
  }
}

/**
 * Posts the sign-up: the whole form to the account route, or only the four
 * email-sign-up fields (never a password) to the subscribe route. Resolves
 * when it was accepted; throws a `SubmitError` carrying the server's own
 * (visitor-safe) message otherwise, or a plain error if the request never
 * got an answer.
 */
async function submitSignup(values: Values, accountFields: boolean, honeypot: string): Promise<void> {
  const body = accountFields ? normalizeSignUp(values) : normalizeSubscribe(values);
  const res = await fetch(accountFields ? "/api/auth/signup" : "/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, [HONEYPOT_FIELD]: honeypot }),
  });

  let data: ServerAnswer | null = null;
  try {
    data = (await res.json()) as ServerAnswer;
  } catch {
    // Not JSON (a proxy's error page, say): handled as a failure below.
  }

  if (res.ok && data?.ok) return;
  if (data && !data.ok) throw new SubmitError(data.error, data.fields);
  throw new Error(`Unexpected response: ${res.status}`);
}

export function JoinSignup() {
  const rootRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { ready, reduced } = useMotion();

  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  /** The server's reason for the last failure, when it gave one. */
  const [failure, setFailure] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  /** The address the confirmation link went to, for "send it again". */
  const [sentTo, setSentTo] = useState("");
  const [resend, setResend] = useState<"idle" | "sending" | "sent">("idle");
  /** Which face the panel shows; see the header. */
  const [mode, setMode] = useState<"signup" | "signin" | "forgot" | "reset" | "member">("signup");
  /** From a reset email's link. */
  const [resetToken, setResetToken] = useState("");
  const [notice, setNotice] = useState<JoinNotice | null>(null);
  const [member, setMember] = useState<{ name: string; rushCode: string } | null>(null);

  // Once loaded: the face asked for in the address, then whether someone's
  // already signed in (which wins).
  useEffect(() => {
    if (!joinSignup.accountFields) return;
    let cancelled = false;
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("reset");
      if (token) {
        // A reset link wins: the member asked to change their password.
        setResetToken(token);
        setMode("reset");
        return;
      }
      const asked = params.get("notice");
      const known = asked && asked in joinSignup.signInMode.notices ? (asked as JoinNotice) : null;
      if (params.has("forgot")) setMode("forgot");
      else if (params.has("signin") || known) {
        setMode("signin");
        setNotice(known);
      }
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await res.json()) as { member: { name: string; rushCode: string } | null };
        if (!cancelled && data.member) {
          setMember(data.member);
          setMode("member");
        }
      } catch {
        // Not knowing is fine: the forms still work.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Swaps the panel's face and puts the cursor in its first field. */
  const switchTo = (next: "signup" | "signin" | "forgot") => {
    setMode(next);
    setNotice(null);
    requestAnimationFrame(() =>
      rootRef.current?.querySelector<HTMLInputElement>(`form:not([hidden]) input:not([tabindex="-1"])`)?.focus(),
    );
  };

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
  /** Moves focus to the first field that needs attention, once it renders. */
  const focusFirstInvalid = () =>
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    const next = validate(values, joinSignup.accountFields);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      focusFirstInvalid();
      return;
    }

    setStatus("sending");
    setFailure("");
    try {
      await submitSignup(values, joinSignup.accountFields, honeypot);
      setSentTo(values.email.trim());
      setResend("idle");
      setStatus("sent");
      setValues(EMPTY);
    } catch (err) {
      if (err instanceof SubmitError) {
        // The server disagreed about a field: show it where it belongs.
        if (err.fields) {
          setErrors(err.fields);
          focusFirstInvalid();
        }
        setFailure(err.message);
      }
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

  /** Another confirmation link, to the address just signed up with. */
  const resendLink = async () => {
    if (resend === "sending") return;
    setResend("sending");
    try {
      await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sentTo }),
      });
    } catch {
      // The route answers the same either way; the member can try again.
    }
    setResend("sent");
  };

  const c = joinSignup;
  /** The line over the panel, for the face it shows. */
  const face =
    mode === "signin"
      ? c.signInMode
      : mode === "forgot"
        ? c.forgotMode
        : mode === "reset"
          ? c.resetMode
          : { createLead: c.createLead, createTail: c.createTail, lead: c.lead };

  const errorId = (key: Field) => `signup-${key}-error`;

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
          aria-required="true"
          aria-invalid={Boolean(errors[key])}
          aria-describedby={errors[key] ? errorId(key) : undefined}
          {...(key === "email" ? { inputMode: "email" as const, autoCapitalize: "none", spellCheck: false } : {})}
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
      {errors[key] && (
        <span id={errorId(key)} className={styles.error}>
          {errors[key]}
        </span>
      )}
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
              {mode === "member" && member ? (
                <>
                  {c.memberMode.createLead} <span className={styles.red}>{member.name.split(/\s+/)[0]}</span>
                </>
              ) : (
                <>
                  {face.createLead} <span className={styles.red}>{c.createBrand}</span> {face.createTail}
                </>
              )}
            </span>
          </p>
          <p className={`${styles.lead} f-sans cz`} data-a>
            {mode === "member" ? c.memberMode.lead : face.lead}
          </p>
        </div>

        {/* ---------------- Form ---------------- */}
        <form
          ref={formRef}
          className={styles.panel}
          onSubmit={handleSubmit}
          noValidate
          aria-label={c.submit}
          hidden={mode !== "signup"}
          data-a
        >
          {textField("name", "user", "text", "name")}
          {textField("email", "envelope", "email", "email")}
          {/* Account fields — off until Phase 3; see `joinSignup.accountFields`. */}
          {c.accountFields && textField("username", "at", "text", "username")}
          {c.accountFields && textField("password", "lock", "password", "new-password")}

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
                aria-required="true"
                aria-invalid={Boolean(errors.agree)}
                aria-describedby={errors.agree ? errorId("agree") : undefined}
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
            {errors.agree && (
              <span id={errorId("agree")} className={styles.error}>
                {errors.agree}
              </span>
            )}
          </div>

          {/* Honeypot: off-screen, out of the tab order and hidden from
              assistive tech, so no person fills it — a bot that does is
              dropped by the API route. Not `display: none`, which some
              bots skip. Its name and label mean nothing to a browser, so
              autofill never fills it for a real person ("company" would be). */}
          <div className={styles.trap} aria-hidden="true">
            <label>
              Leave this empty
              <input
                type="text"
                name="hp_check"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </label>
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
                  <strong className="f-cond caps">{c.accountFields ? c.verifyTitle : c.sentTitle}</strong>
                  {c.accountFields ? c.verify.replace("{email}", sentTo) : c.sent}
                  {c.accountFields && (
                    <button type="button" className={styles.noteAction} onClick={resendLink} disabled={resend === "sending"}>
                      {resend === "sent" ? c.resent : c.resend}
                    </button>
                  )}
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
                  {failure || c.failed}
                </span>
              </p>
            )}
          </div>

          {c.accountFields && (
            <p className={`${styles.signIn} f-sans`}>
              {c.signIn.lead}{" "}
              <button type="button" className={styles.signInLink} onClick={() => switchTo("signin")}>
                {c.signIn.label}
              </button>
            </p>
          )}
        </form>

        {c.accountFields && (
          <>
            <JoinSignIn
              notice={notice}
              onCreateAccount={() => switchTo("signup")}
              onForgot={() => switchTo("forgot")}
              hidden={mode !== "signin"}
            />
            <JoinForgot onBack={() => switchTo("signin")} hidden={mode !== "forgot"} />
            {resetToken && <JoinReset token={resetToken} onAgain={() => switchTo("forgot")} hidden={mode !== "reset"} />}
            {member && <JoinMember rushCode={member.rushCode} hidden={mode !== "member"} />}
          </>
        )}

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
