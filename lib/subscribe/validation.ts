/**
 * JOIN THE MOVEMENT — the sign-up's rules, shared by the browser and the
 * server.
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

export interface SubscribeValues {
  name: string;
  email: string;
  /** "Send me updates about hunts, drops & opportunities." */
  updates: boolean;
  /** "I agree to the Terms & Privacy Policy." — required. */
  agree: boolean;
}

export type SubscribeField = keyof SubscribeValues;
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
export function normalizeSubscribe(input: Partial<Record<SubscribeField, unknown>>): SubscribeValues {
  const oneLine = (v: unknown) => (typeof v === "string" ? v : "").replace(/[\r\n\t]+/g, " ").trim();
  return {
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

  if (!values.agree) errors.agree = "You’ll need to agree to the Terms to join.";

  return errors;
}

/** What the API route answers with, success or not. */
export type SubscribeResponse =
  | { ok: true }
  | { ok: false; error: string; fields?: SubscribeErrors };
