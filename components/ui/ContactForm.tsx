"use client";

/**
 * CONTACT FORM — opened from the FAQ section's "Reach out" bar.
 *
 * The mockups show "Still have a question? Reach out." as the only contact
 * affordance, so the form lives in an overlay rather than as an extra page
 * section. That keeps the measured composition exactly as designed while
 * still giving the site a working contact route.
 *
 * ▸ BACKEND SEAM — this is the one place that needs wiring before launch.
 *
 *   `submitContact` below is a stub. To go live, replace its body with a
 *   real call, for example:
 *
 *     const res = await fetch("/api/contact", {
 *       method: "POST",
 *       headers: { "Content-Type": "application/json" },
 *       body: JSON.stringify(values),
 *     });
 *     if (!res.ok) throw new Error("Request failed");
 *
 *   …and add `app/api/contact/route.ts` that forwards to an email service
 *   (Resend, Postmark, SendGrid) or a CRM. Nothing else in this component
 *   needs to change: it already handles pending, success and failure states.
 *
 *   Validation here is deliberately light — it catches obvious mistakes
 *   before a round trip. The server must validate independently.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "@/lib/motion/gsap";
import { useMotion } from "@/components/motion/MotionProvider";
import styles from "./ContactForm.module.css";
import buttonStyles from "./RedButton.module.css";

export interface ContactValues {
  name: string;
  email: string;
  message: string;
}

type Status = "idle" | "sending" | "sent" | "error";

/**
 * STUB — replace with a real API call (see the note at the top of the file).
 * Resolves on success, throws on failure.
 */
async function submitContact(values: ContactValues): Promise<void> {
  console.info("[contact] submit stub — wire to /api/contact", values);
  // Simulated latency so the pending state is visible during review.
  await new Promise((resolve) => setTimeout(resolve, 900));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactFormProps {
  open: boolean;
  onClose: () => void;
}

export function ContactForm({ open, onClose }: ContactFormProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const [values, setValues] = useState<ContactValues>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactValues, string>>>({});
  const [status, setStatus] = useState<Status>("idle");

  const { reduced, lockScroll, unlockScroll } = useMotion();

  /* --- scroll lock ------------------------------------------------------- */
  // Acquired only while open and released in cleanup, so the shared lock
  // count stays balanced and nothing unlocks on mount.
  useEffect(() => {
    if (!open) return;
    lockScroll();
    return () => unlockScroll();
  }, [open, lockScroll, unlockScroll]);

  /* --- entrance + focus --------------------------------------------------- */
  useEffect(() => {
    if (!open) return;

    lastFocus.current = document.activeElement as HTMLElement | null;
    firstFieldRef.current?.focus();

    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
      gsap.fromTo(
        panelRef.current,
        { scale: 0.94, y: 30, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.7, ease: "expo.out" },
      );
      // Fields cascade in behind the panel.
      gsap.fromTo(
        panelRef.current?.querySelectorAll(`.${styles.field}, .${styles.submit}`) ?? [],
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: "expo.out", delay: 0.15 },
      );
    });
    return () => ctx.revert();
  }, [open, reduced]);

  const close = useCallback(() => {
    lastFocus.current?.focus();
    onClose();
  }, [onClose]);

  /* --- Escape to close --------------------------------------------------- */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  /* --- submit ------------------------------------------------------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const next: Partial<Record<keyof ContactValues, string>> = {};
    if (!values.name.trim()) next.name = "Tell us your name.";
    if (!EMAIL_RE.test(values.email)) next.email = "Enter a valid email address.";
    if (values.message.trim().length < 10) next.message = "A little more detail, please.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("sending");
    try {
      await submitContact(values);
      setStatus("sent");
      setValues({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const set = (key: keyof ContactValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    // Clear the error as soon as the visitor starts fixing it.
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  if (!open || typeof document === "undefined") return null;

  /* Rendered into <body>, not where it sits in the tree.
     `<ContactForm>` is written inside the FAQ's <section>, and that section
     carries `isolation: isolate`, which makes it a stacking context — so the
     overlay's `z-index: 92` only ranked it against the FAQ's own children,
     and the whole section still painted beneath the nav at `z-index: 50`.
     A portal moves it out to the document root, where its z-index is
     compared against the nav's. `VideoPlayer` avoids the same trap by being
     mounted at the layout root instead. */
  return createPortal(
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div ref={panelRef} className={styles.panel}>
        <button type="button" className={styles.close} aria-label="Close contact form" onClick={close}>
          &times;
        </button>

        <h2 id="contact-title" className={styles.title}>
          Reach out
        </h2>
        <p className={styles.intro}>
          Questions, collabs, press or a prize claim — send it here and we will come back to you.
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="contact-name">
              Name
            </label>
            <input
              ref={firstFieldRef}
              id="contact-name"
              name="name"
              className={styles.input}
              value={values.name}
              onChange={set("name")}
              placeholder="Your name"
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
            />
            {errors.name && (
              <span id="contact-name-error" className={styles.error}>
                {errors.name}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="contact-email">
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              className={styles.input}
              value={values.email}
              onChange={set("email")}
              placeholder="you@email.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
            />
            {errors.email && (
              <span id="contact-email-error" className={styles.error}>
                {errors.email}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="contact-message">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              className={styles.textarea}
              value={values.message}
              onChange={set("message")}
              placeholder="What's up?"
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "contact-message-error" : undefined}
            />
            {errors.message && (
              <span id="contact-message-error" className={styles.error}>
                {errors.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={`${buttonStyles.btn} ${styles.submit}`}
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending…" : "Send it"}
            <svg className={buttonStyles.arrow} viewBox="0 0 22 14" aria-hidden="true">
              <path d="M1 7h19M13 1.5l6.5 5.5-6.5 5.5" />
            </svg>
          </button>
        </form>

        {/* Announced politely so a screen reader hears the outcome without
            losing the visitor's place in the form. */}
        <p
          className={[
            styles.status,
            status === "sent" ? styles.statusOk : "",
            status === "error" ? styles.statusFail : "",
          ]
            .filter(Boolean)
            .join(" ")}
          role="status"
          aria-live="polite"
        >
          {status === "sent" && "Got it. We'll be in touch soon."}
          {status === "error" && "That didn't send. Try again in a moment."}
        </p>
      </div>
    </div>,
    document.body,
  );
}

export default ContactForm;
