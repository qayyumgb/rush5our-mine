"use client";

/**
 * CONTACT — section 3, "Send us a message" / "Other ways to reach us"
 * (mockups/Contact/3.png, a 1024 x 1536 phone frame).
 *
 * Two red-framed panels under a tracked eyebrow:
 *   • the form — slanted two-colour headline, tracked subline, four fields
 *     (name and email side by side, subject, a tall message box) each with
 *     a red line icon, and the red send button
 *   • the channels — headline and subline, a list of four ways to reach the
 *     brand, a hairline, the response-time note, and at the right a ghosted
 *     brush note with a red swoosh, a short rule and a two-line tagline
 *
 * The same red grunge as the rest of the page creeps in at both edges.
 *
 * ▸ SENDING — the form posts to `app/api/contact/route.ts`, which sends the
 *   message on through SendGrid. The rules for a valid message live in
 *   lib/contact/validation.ts and are run here before submitting and again
 *   on the server. A hidden honeypot field rides along to catch bots.
 *
 * MOTION: the eyebrow decodes; each panel rises as it enters, its
 * headline's characters rise, its subline lifts, then the fields (or list
 * rows) cascade in, the button wipes open, and the note writes itself
 * before its swoosh sweeps on.
 *
 * No standing `will-change` or `translateZ(0)` — see AboutHero.tsx.
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { EASE, EASE_IO, charsIn, prepareStrokes } from "@/lib/motion/helpers";
import { scramble, splitTitle } from "@/lib/motion/split";
import { useMotion } from "@/components/motion/MotionProvider";
import Icon from "@/components/ui/Icon";
import { contactForm } from "@/data/contact";
import {
  EMPTY_CONTACT,
  HONEYPOT_FIELD,
  normalizeContact,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactResponse,
  type ContactValues,
} from "@/lib/contact/validation";
import styles from "./ContactFormSection.module.css";

/** A failed submission: a sentence for the visitor, and any field errors. */
class SubmitError extends Error {
  constructor(
    message: string,
    readonly fields?: ContactErrors,
  ) {
    super(message);
  }
}

/**
 * Posts the form to the API route. Resolves when the message has been
 * accepted; throws a `SubmitError` carrying the server's own (already
 * visitor-safe) message otherwise, or a plain error if the request never
 * got an answer.
 */
async function submitContact(values: ContactValues, honeypot: string): Promise<void> {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...values, [HONEYPOT_FIELD]: honeypot }),
  });

  let data: ContactResponse | null = null;
  try {
    data = (await res.json()) as ContactResponse;
  } catch {
    // Not JSON (a proxy's error page, say): handled as a failure below.
  }

  if (res.ok && data?.ok) return;
  if (data && !data.ok) throw new SubmitError(data.error, data.fields);
  throw new Error(`Unexpected response: ${res.status}`);
}

export function ContactFormSection() {
  const rootRef = useRef<HTMLElement>(null);
  const { ready, reduced } = useMotion();

  const [values, setValues] = useState<ContactValues>(EMPTY_CONTACT);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  /** The server's sentence for a failure; falls back to the stock line. */
  const [failure, setFailure] = useState("");

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
      prepareStrokes(root);

      /* --- eyebrow ------------------------------------------------------ */
      const head = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: {
          trigger: q(`.${styles.eyebrow}`)[0],
          start: "top 85%",
        },
      });
      (q(`.${styles.eyebrowWord}`) as HTMLElement[]).forEach((w, i) => {
        head.add(scramble(w, 0.8), i * 0.12);
      });
      head.fromTo(
        q(`.${styles.rule}`),
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9, ease: EASE_IO },
        0.2,
      );

      /* --- panels ------------------------------------------------------- */
      (q(`.${styles.panel}`) as HTMLElement[]).forEach((panel) => {
        const inP = gsap.utils.selector(panel);
        const tl = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: panel, start: "top 80%" },
        });
        tl.fromTo(
          panel,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1 },
          0,
        );
        const title = inP(`.${styles.title}`)[0] as HTMLElement | undefined;
        if (title) charsIn(tl, splitTitle(title), 0.2);
        tl.fromTo(
          inP(`.${styles.subline}`),
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9 },
          0.6,
        );
        // Each panel has only some of these; GSAP warns on an empty target
        // list, so the lists are checked first.
        const rows = inP(
          `.${styles.field}, .${styles.row}, .${styles.divider}, .${styles.response}`,
        );
        if (rows.length) {
          tl.fromTo(
            rows,
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 },
            0.7,
          );
        }
        tl.fromTo(
          inP(".i-stroke"),
          {
            strokeDashoffset: (_i: number, el: Element) =>
              Number((el as SVGElement).dataset.len ?? 0),
          },
          {
            strokeDashoffset: 0,
            duration: 1,
            stagger: 0.04,
            ease: "power2.inOut",
          },
          0.9,
        );
        const submit = inP(`.${styles.submitWrap}`);
        if (submit.length) {
          tl.fromTo(
            submit,
            { opacity: 0, clipPath: "inset(0 50% 0 50%)" },
            {
              opacity: 1,
              clipPath: "inset(0 0% 0 0%)",
              duration: 1,
              ease: EASE_IO,
              clearProps: "clipPath",
            },
            1.1,
          );
        }

        // The channels panel's right column.
        const noteLines = inP(`.${styles.noteLine}`);
        if (noteLines.length) {
          tl.fromTo(
            noteLines,
            { clipPath: "inset(-40% 100% -40% 0)" },
            {
              clipPath: "inset(-40% 0% -40% 0)",
              duration: 0.7,
              stagger: 0.18,
              ease: EASE_IO,
              clearProps: "clipPath",
            },
            0.9,
          )
            .fromTo(
              inP(`.${styles.swoosh}`),
              { clipPath: "inset(-20% 100% -20% 0)" },
              {
                clipPath: "inset(-20% 0% -20% 0)",
                duration: 0.9,
                ease: EASE_IO,
                clearProps: "clipPath",
              },
              1.7,
            )
            .fromTo(
              inP(`.${styles.tagRule}`),
              { scaleX: 0 },
              { scaleX: 1, duration: 0.7, ease: EASE_IO },
              2.0,
            );
          (inP(`.${styles.tagline} span`) as HTMLElement[]).forEach((s, i) => {
            tl.add(scramble(s, 0.8), 2.05 + i * 0.15);
          });
        }
      });
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  /* --- submit ------------------------------------------------------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;

    // The same rules the server applies — see lib/contact/validation.ts.
    const clean = normalizeContact(values);
    const next = validateContact(clean);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("sending");
    setFailure("");
    try {
      await submitContact(clean, honeypot);
      setStatus("sent");
      setValues(EMPTY_CONTACT);
    } catch (err) {
      if (err instanceof SubmitError) {
        // The server disagreed about a field: show it where it belongs.
        if (err.fields) setErrors(err.fields);
        setFailure(err.message);
      }
      setStatus("error");
    }
  };

  const set =
    (key: ContactField) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
      if (status !== "idle") setStatus("idle");
    };

  const { form, reach } = contactForm;

  return (
    <section
      ref={rootRef}
      id="form"
      className={styles.section}
      aria-labelledby="contact-form-title"
    >
      <div className={styles.atmos} aria-hidden="true" />

      <div className={styles.col}>
        <p className={`${styles.eyebrow} f-sans cz caps`}>
          {contactForm.eyebrow.map((w) => (
            <span key={w} className={styles.eyebrowWord}>
              {w}
            </span>
          ))}
        </p>
        <span className={styles.rule} aria-hidden="true" />

        {/* ---------------- Panel 1: the form ---------------- */}
        <div className={`${styles.panel} ${styles.formPanel}`} data-a>
          <h2 id="contact-form-title" className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner">
                <span className="t-white">{form.titleWhite} </span>
                <span className="t-red">{form.titleRed}</span>
              </span>
            </span>
          </h2>
          <p className={`${styles.subline} f-sans cz caps`}>{form.subline}</p>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={`${styles.slot} ${styles.half}`}>
              <label className={styles.field}>
                <Icon name="user" className={styles.fieldIcon} />
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder={form.fields.name}
                  aria-label={form.fields.name}
                  aria-invalid={Boolean(errors.name)}
                  value={values.name}
                  onChange={set("name")}
                  className={styles.input}
                />
              </label>
              {errors.name && (
                <span className={styles.error}>{errors.name}</span>
              )}
            </div>

            <div className={`${styles.slot} ${styles.half}`}>
              <label className={styles.field}>
                <Icon name="envelope" className={styles.fieldIcon} />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder={form.fields.email}
                  aria-label={form.fields.email}
                  aria-invalid={Boolean(errors.email)}
                  value={values.email}
                  onChange={set("email")}
                  className={styles.input}
                />
              </label>
              {errors.email && (
                <span className={styles.error}>{errors.email}</span>
              )}
            </div>

            <div className={styles.slot}>
              <label className={styles.field}>
                <Icon name="tag" className={styles.fieldIcon} />
                <input
                  type="text"
                  name="subject"
                  placeholder={form.fields.subject}
                  aria-label={form.fields.subject}
                  aria-invalid={Boolean(errors.subject)}
                  value={values.subject}
                  onChange={set("subject")}
                  className={styles.input}
                />
              </label>
              {errors.subject && (
                <span className={styles.error}>{errors.subject}</span>
              )}
            </div>

            <div className={styles.slot}>
              <label className={`${styles.field} ${styles.tall}`}>
                <Icon name="pencil" className={styles.fieldIcon} />
                <textarea
                  name="message"
                  placeholder={form.fields.message}
                  aria-label={form.fields.message}
                  aria-invalid={Boolean(errors.message)}
                  value={values.message}
                  onChange={set("message")}
                  className={`${styles.input} ${styles.textarea}`}
                  rows={3}
                />
              </label>
              {errors.message && (
                <span className={styles.error}>{errors.message}</span>
              )}
            </div>

            {/* Honeypot: off-screen, out of the tab order and hidden from
                assistive tech, so no person fills it — a bot that does is
                dropped by the API route. Not `display: none`, which some
                bots skip. */}
            <div className={styles.trap} aria-hidden="true">
              <label>
                Company
                <input
                  type="text"
                  name={HONEYPOT_FIELD}
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
                <span className="f-cond cz caps">
                  {status === "sending" ? form.sending : form.submit}
                </span>
                {status === "sending" ? (
                  <span className={styles.spinner} aria-hidden="true" />
                ) : (
                  <svg
                    className={styles.submitArrow}
                    viewBox="0 0 32 20"
                    aria-hidden="true"
                  >
                    <path d="M1 10h29M21 1.5l9 8.5-9 8.5" />
                  </svg>
                )}
              </button>
              {status === "sent" && (
                <p className={`${styles.note} ${styles.noteSent}`} role="status">
                  <svg
                    className={styles.noteIcon}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M4 12.5l5.2 5.2L20 6.8" />
                  </svg>
                  <span>
                    <strong className="f-cond caps">{form.sentTitle}</strong>
                    {form.sent}
                  </span>
                </p>
              )}
              {status === "error" && (
                <p
                  className={`${styles.note} ${styles.noteError}`}
                  role="alert"
                >
                  <svg
                    className={styles.noteIcon}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 7v6.5M12 17v.5" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  <span>
                    <strong className="f-cond caps">{form.failedTitle}</strong>
                    {failure || form.failed}
                  </span>
                </p>
              )}
            </div>
          </form>
        </div>

        {/* ---------------- Panel 2: other ways ---------------- */}
        <div className={`${styles.panel} ${styles.reachPanel}`} data-a>
          <h2 className={styles.title}>
            <span className="line f-display cz">
              <span className="line-inner">
                <span className="t-white">{reach.titleWhite} </span>
                <span className="t-red">{reach.titleRed}</span>
                <span className="t-white"> {reach.titleTail}</span>
              </span>
            </span>
          </h2>
          <p className={`${styles.subline} f-sans cz caps`}>{reach.subline}</p>

          <div className={styles.reachBody}>
            <ul className={styles.channels}>
              {reach.channels.map((c) => (
                <li key={c.label} className={styles.row}>
                  <a
                    href={c.href}
                    className={styles.channel}
                    {...(c.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                  >
                    <Icon name={c.icon} className={styles.rowIcon} />
                    <span className={styles.rowText}>
                      <span className={styles.rowLabel}>{c.label}</span>
                      <span className={styles.rowValue}>{c.value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <span className={styles.divider} aria-hidden="true" />

            <div className={`${styles.row} ${styles.response}`}>
              <Icon name="clockGear" className={styles.rowIcon} />
              <span className={styles.rowText}>
                <span className={styles.rowLabel}>{reach.response.label}</span>
                {reach.response.lines.map((l) => (
                  <span key={l} className={styles.rowValue}>
                    {l}
                  </span>
                ))}
              </span>
            </div>

            {/* The ghosted brush note: the hand face in grey, each line
                leaning and stepping right, the mockup's swoosh beneath. */}
            <div className={styles.note2} aria-hidden="true">
              {reach.noteLines.map((l, i) => (
                <span key={l + i} className={`${styles.noteLine} hand`} data-a>
                  {l}
                </span>
              ))}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.swoosh}
                src="/assets/images/contact-form-swoosh.webp"
                width={315}
                height={154}
                alt=""
                decoding="async"
                data-a
              />
            </div>

            <span className={styles.tagRule} aria-hidden="true" />
            <p className={`${styles.tagline} f-sans cz caps`}>
              {reach.tagline.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactFormSection;
