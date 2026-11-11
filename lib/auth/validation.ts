/**
 * ACCOUNTS — the rules for sign-up, sign-in and passwords, shared by the
 * browser and the server. The forms run them first as a courtesy; the API
 * routes run them again, and theirs are the ones that count.
 *
 * Nothing here may import server-only code: this file ships to the browser.
 */

import { EMAIL_RE } from "@/lib/contact/validation";

export const USERNAME_RE = /^[a-z0-9._]{3,24}$/i;
export const PASSWORD_MIN = 8;
/** scrypt is happy with long passwords, but a request body shouldn't be. */
export const PASSWORD_MAX = 128;

export interface SignUpValues {
  name: string;
  email: string;
  username: string;
  password: string;
  updates: boolean;
  agree: boolean;
}

export type SignUpField = keyof SignUpValues;
export type FieldErrors<F extends string = string> = Partial<Record<F, string>>;

const oneLine = (v: unknown) => (typeof v === "string" ? v : "").replace(/[\r\n\t]+/g, " ").trim();
/** Passwords are kept exactly as typed: spaces count. */
const raw = (v: unknown) => (typeof v === "string" ? v : "");

export function normalizeSignUp(input: Partial<Record<SignUpField, unknown>>): SignUpValues {
  return {
    name: oneLine(input.name),
    email: oneLine(input.email).toLowerCase(),
    username: oneLine(input.username),
    password: raw(input.password),
    updates: input.updates === true,
    agree: input.agree === true,
  };
}

export function passwordError(password: string): string | undefined {
  if (password.length < PASSWORD_MIN) return `At least ${PASSWORD_MIN} characters.`;
  if (password.length > PASSWORD_MAX) return "That password is too long.";
  return undefined;
}

export function validateSignUp(v: SignUpValues): FieldErrors<SignUpField> {
  const e: FieldErrors<SignUpField> = {};
  if (!v.name) e.name = "Tell us your name.";
  else if (v.name.length > 100) e.name = "That name is too long.";
  if (!v.email) e.email = "Enter your email address.";
  else if (v.email.length > 254 || !EMAIL_RE.test(v.email)) e.email = "Enter a valid email address.";
  if (!USERNAME_RE.test(v.username)) e.username = "3–24 letters, numbers, dots or underscores.";
  const pw = passwordError(v.password);
  if (pw) e.password = pw;
  if (!v.agree) e.agree = "You’ll need to agree to the Terms to join.";
  return e;
}

export interface SignInValues {
  /** Email or username. */
  login: string;
  password: string;
}

export function normalizeSignIn(input: Partial<Record<keyof SignInValues, unknown>>): SignInValues {
  return { login: oneLine(input.login), password: raw(input.password) };
}

export function validateSignIn(v: SignInValues): FieldErrors<keyof SignInValues> {
  const e: FieldErrors<keyof SignInValues> = {};
  if (!v.login) e.login = "Enter your email or username.";
  else if (v.login.length > 254) e.login = "That’s too long.";
  if (!v.password) e.password = "Enter your password.";
  else if (v.password.length > PASSWORD_MAX) e.password = "That password is too long.";
  return e;
}

/** What every account route answers with. `code` lets a form react to a
    particular case (an unverified email, say) beyond showing the message. */
export type AuthResponse =
  | { ok: true; redirect?: string }
  | { ok: false; error: string; code?: "unverified" | "invalid-token"; fields?: FieldErrors };
