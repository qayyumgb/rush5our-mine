/**
 * SIGN-UPS — the rules for the Join the Movement form and the Early Access
 * page, shared by the browser and the server.
 *
 * Both post to the same route (app/api/subscribe) and differ only in
 * `source`: an Early Access sign-up is tagged "Early Access / Merch Drop"
 * in the business email and has no Terms checkbox to tick.
 *
 * The form (components/join/JoinSignup.tsx) runs `validateSubscribe` before
 * it submits, and the API route (app/api/subscribe/route.ts) runs the same
 * function again on what arrives — the browser's check is a courtesy, the
 * server's is the one that counts. One function, so the two can never
 * disagree about what a valid sign-up is.
 *
 * Nothing here may import server-only code: this file ships to the browser.
 */

import { EMAIL_RE, HONEYPOT_FIELD } from "@/lib/contact/validation";

export { HONEYPOT_FIELD };

/** Where a sign-up came from. Anything unrecognised counts as "join". */
export type SubscribeSource = "join" | "early-access";

/** How each source is named in the business inbox. */
export const SOURCE_LABEL: Record<SubscribeSource, string> = {
  join: "Join the Movement",
  "early-access": "Early Access / Merch Drop",
};

export interface SubscribeValues {
  source: SubscribeSource;
  name: string;
  email: string;
  /** "Send me updates about hunts, drops & opportunities." */
  updates: boolean;
  /** "I agree to the Terms & Privacy Policy." — required on the Join form. */
  agree: boolean;
}

export type SubscribeField = Exclude<keyof SubscribeValues, "source">;
export type SubscribeErrors = Partial<Record<SubscribeField, string>>;

/** Upper bounds, so one request can't carry an essay or a payload. */
export const SUBSCRIBE_LIMITS = {
  name: 100,
  /** The longest address the email standards allow. */
  email: 254,
} as const;

/**
 * Trims the text fields and flattens line breaks out of them (neither may
 * carry a newline into an email header); only a real `true` counts for a
 * checkbox.
 */
export function normalizeSubscribe(input: Partial<Record<keyof SubscribeValues, unknown>>): SubscribeValues {
  const oneLine = (v: unknown) => (typeof v === "string" ? v : "").replace(/[\r\n\t]+/g, " ").trim();
  return {
    source: input.source === "early-access" ? "early-access" : "join",
    name: oneLine(input.name),
    email: oneLine(input.email),
    updates: input.updates === true,
    agree: input.agree === true,
  };
}

/** Returns one message per invalid field; an empty object means valid. */
export function validateSubscribe(values: SubscribeValues): SubscribeErrors {
  const errors: SubscribeErrors = {};

  if (!values.name) errors.name = "Tell us your name.";
  else if (values.name.length > SUBSCRIBE_LIMITS.name) errors.name = "That name is too long.";

  if (!values.email) errors.email = "Enter your email address.";
  else if (values.email.length > SUBSCRIBE_LIMITS.email || !EMAIL_RE.test(values.email))
    errors.email = "Enter a valid email address.";

  // The Early Access page has no Terms box: it only collects a name and email.
  if (values.source === "join" && !values.agree) errors.agree = "You’ll need to agree to the Terms to join.";

  return errors;
}

/** What the API route answers with, success or not. */
export type SubscribeResponse =
  | { ok: true }
  | { ok: false; error: string; fields?: SubscribeErrors };
