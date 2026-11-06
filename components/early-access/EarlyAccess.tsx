"use client";

/**
 * EARLY ACCESS — the merch drop's sign-up page (app/early-access).
 *
 * The RUSH 5OUR mark, the red tracked kicker, a three-line leaning headline
 * in Anton, the client's copy, then Name and Email and one red button. On
 * success the form gives way to the confirmation. Nothing on the page
 * links anywhere.
 *
 * SIGN-UP: posts to /api/subscribe — the Join the Movement backend — with
 * `source: "early-access"`, so the business email is tagged "Early Access /
 * Merch Drop". The same rules check the fields here and on the server
 * (lib/subscribe/validation.ts); a field the server rejects is marked
 * inline, and whatever was typed stays in the boxes.
 *
 * Phone first: everyone arrives by scanning a QR code. No animation
 * library, no images — the glow is CSS — so it loads fast on a weak signal.
 */

import { useRef, useState, type FormEvent } from "react";
import {
  HONEYPOT_FIELD,
  normalizeSubscribe,
  validateSubscribe,
  type SubscribeErrors,
  type SubscribeResponse,
} from "@/lib/subscribe/validation";
import { earlyAccess } from "@/data/early-access";
import { site } from "@/data/site";
import styles from "./EarlyAccess.module.css";

type Status = "idle" | "submitting" | "error" | "done";

const NETWORK_ERROR = "We couldn’t reach the server. Check your connection and try again.";

export function EarlyAccess() {
  const c = earlyAccess;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<SubscribeErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  const values = () => normalizeSubscribe({ source: "early-access", name, email });

  /** Moves focus to the first field with a problem. */
  const focusFirst = (e: SubscribeErrors) => {
    if (e.name) nameRef.current?.focus();
    else if (e.email) emailRef.current?.focus();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const v = values();
    const found = validateSubscribe(v);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setStatus("idle");
      setMessage("");
      focusFirst(found);
      return;
    }

    setStatus("submitting");
    setMessage("");
    let res: SubscribeResponse;
    try {
      const r = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...v, [HONEYPOT_FIELD]: honeypot }),
      });
      res = (await r.json()) as SubscribeResponse;
    } catch {
      res = { ok: false, error: NETWORK_ERROR };
    }

    if (res.ok) {
      setStatus("done");
      // The confirmation replaces the form; move focus to it so a screen
      // reader announces it.
      requestAnimationFrame(() => doneRef.current?.focus());
      return;
    }
    setStatus("error");
    setMessage(res.error);
    if (res.fields) {
      setErrors(res.fields);
      focusFirst(res.fields);
    }
  };

  /** Clears a field's message as soon as it's edited. */
  const edit = (field: "name" | "email", value: string) => {
    if (field === "name") setName(value);
    else setEmail(value);
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const busy = status === "submitting";

  return (
    <main className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <span className={styles.ghost} aria-hidden="true">
        5OUR
      </span>

      <div className={styles.inner}>
        {/* The mark, as the site draws it — not a link: this page goes nowhere. */}
        <p className={styles.brand} aria-label={site.name}>
          <span className={styles.mark} aria-hidden="true">
            <span>{site.mark}</span>
          </span>
          <span className={styles.word} aria-hidden="true">
            {site.wordmark.light}
            <span className={styles.red}>{site.wordmark.accent}</span>
          </span>
        </p>

        <p className={styles.kicker}>
          <span className={styles.rule} aria-hidden="true" />
          {c.kicker}
          <span className={styles.rule} aria-hidden="true" />
        </p>

        <h1 className={styles.title}>
          {c.title.map((line) => (
            <span key={line.text} className={line.red ? styles.titleRed : undefined}>
              {line.text}
            </span>
          ))}
        </h1>

        {status === "done" ? (
          <section className={styles.done} aria-live="polite">
            <span className={styles.check} aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M5 12.5 10 17.5 19 7" />
              </svg>
            </span>
            <h2 ref={doneRef} className={styles.doneTitle} tabIndex={-1}>
              {c.success.title}
            </h2>
            <p className={styles.doneBody}>{c.success.body}</p>
          </section>
        ) : (
          <>
            <p className={styles.body}>{c.body}</p>

            <form className={styles.form} onSubmit={onSubmit} noValidate>
              <div className={styles.field}>
                <label htmlFor="ea-name" className={styles.label}>
                  {c.fields.name}
                </label>
                <input
                  ref={nameRef}
                  id="ea-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  maxLength={100}
                  className={styles.input}
                  value={name}
                  onChange={(e) => edit("name", e.target.value)}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? "ea-name-error" : undefined}
                  disabled={busy}
                />
                {errors.name && (
                  <p id="ea-name-error" className={styles.fieldError}>
                    {errors.name}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="ea-email" className={styles.label}>
                  {c.fields.email}
                </label>
                <input
                  ref={emailRef}
                  id="ea-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="send"
                  maxLength={254}
                  className={styles.input}
                  value={email}
                  onChange={(e) => edit("email", e.target.value)}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "ea-email-error" : undefined}
                  disabled={busy}
                />
                {errors.email && (
                  <p id="ea-email-error" className={styles.fieldError}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* A field people never see; a bot that fills it is ignored. Its
                  name and label mean nothing to a browser, so autofill never
                  fills it in for a real person ("company" would be). */}
              <div className={styles.trap} aria-hidden="true">
                <label htmlFor="ea-hp">Leave this empty</label>
                <input
                  id="ea-hp"
                  name="hp_check"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <p className={styles.formError} role="alert">
                {status === "error" && !Object.values(errors).some(Boolean) ? message : ""}
              </p>

              <button type="submit" className={styles.button} disabled={busy} aria-busy={busy || undefined}>
                {busy && <span className={styles.spinner} aria-hidden="true" />}
                {busy ? c.button.busy : c.button.label}
              </button>
            </form>
          </>
        )}

        <p className={styles.tagline}>{c.tagline}</p>
      </div>
    </main>
  );
}

export default EarlyAccess;
