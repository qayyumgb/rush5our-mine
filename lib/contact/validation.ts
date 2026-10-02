/**
 * CONTACT FORM — the rules, shared by the browser and the server.
 *
 * The form (components/contact/ContactFormSection.tsx) runs `validateContact`
 * before it submits, and the API route (app/api/contact/route.ts) runs the
 * same function again on what arrives — the browser's check is a courtesy,
 * the server's is the one that counts. Keeping both on one function means
 * the two can never disagree about what a valid message is.
 *
 * Nothing here may import server-only code: this file ships to the browser.
 */

export interface ContactValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type ContactField = keyof ContactValues;
export type ContactErrors = Partial<Record<ContactField, string>>;

export const EMPTY_CONTACT: ContactValues = { name: "", email: "", subject: "", message: "" };

/**
 * The honeypot's field name. It is hidden from people and labelled like a
 * real field, so only an automated form-filler puts anything in it.
 */
export const HONEYPOT_FIELD = "company";

/** Upper bounds, so one request can't carry an essay or a payload. */
export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  subject: 150,
  message: 5000,
  /** Shortest message worth sending. */
  messageMin: 10,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Trims every field, and flattens line breaks out of the single-line ones
 * (a subject must never carry a newline into an email header).
 */
export function normalizeContact(input: Partial<Record<ContactField, unknown>>): ContactValues {
  const text = (v: unknown) => (typeof v === "string" ? v : "");
  const oneLine = (v: unknown) => text(v).replace(/[\r\n\t]+/g, " ").trim();
  return {
    name: oneLine(input.name),
    email: oneLine(input.email),
    subject: oneLine(input.subject),
    message: text(input.message).replace(/\r\n/g, "\n").trim(),
  };
}

/** Returns one message per invalid field; an empty object means valid. */
export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};

  if (!values.name) errors.name = "Tell us your name.";
  else if (values.name.length > CONTACT_LIMITS.name) errors.name = "That name is too long.";

  if (!values.email) errors.email = "Enter your email address.";
  else if (values.email.length > CONTACT_LIMITS.email || !EMAIL_RE.test(values.email))
    errors.email = "Enter a valid email address.";

  if (!values.subject) errors.subject = "Add a subject.";
  else if (values.subject.length > CONTACT_LIMITS.subject) errors.subject = "Keep the subject shorter.";

  if (!values.message) errors.message = "Write your message.";
  else if (values.message.length < CONTACT_LIMITS.messageMin) errors.message = "A little more detail, please.";
  else if (values.message.length > CONTACT_LIMITS.message) errors.message = "That message is too long.";

  return errors;
}

/** What the API route answers with, success or not. */
export type ContactResponse =
  | { ok: true }
  | { ok: false; error: string; fields?: ContactErrors };
