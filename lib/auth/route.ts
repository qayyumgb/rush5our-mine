/**
 * ACCOUNTS — what every account route shares: the JSON answer, the checks
 * on an incoming request (same site, bounded body, rate limit), sending an
 * email through SendGrid, and turning a failure into a visitor-safe
 * message. Server-only.
 */

import "server-only";
import sgMail, { type MailDataRequired } from "@sendgrid/mail";
import { isForeignOrigin, readJsonObject } from "@/lib/http";
import { checkRateLimit, clientKey } from "@/lib/mail/rateLimit";
import { logSendGridError, readMailConfig } from "@/lib/mail/sendgrid";
import { DatabaseUnavailable } from "@/lib/db/client";
import type { AuthResponse } from "./validation";

export const GENERIC_ERROR = "Something went wrong on our side. Please try again in a moment.";
export const CLOSED = "Accounts aren’t open yet. Please check back soon.";

export function json(body: AuthResponse, status = 200, headers?: HeadersInit) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

/** Same-site, small, JSON, and within its rate limit — or the answer to
    send instead. */
export async function readRequest(
  request: Request,
  bucket: string,
  limit: number,
): Promise<{ payload: Record<string, unknown> } | { response: Response }> {
  if (isForeignOrigin(request)) return { response: json({ ok: false, error: GENERIC_ERROR }, 403) };

  const rate = checkRateLimit(`${bucket}:${clientKey(request)}`, limit);
  if (!rate.allowed) {
    return {
      response: json({ ok: false, error: "Too many attempts. Please wait a few minutes and try again." }, 429, {
        "Retry-After": String(rate.retryAfter),
      }),
    };
  }

  const body = await readJsonObject(request, 4_000);
  if (!body.ok) {
    return {
      response:
        body.reason === "too-large"
          ? json({ ok: false, error: "That request is too large." }, 413)
          : json({ ok: false, error: "We couldn’t read that request." }, 400),
    };
  }
  return { payload: body.payload };
}

/** Sends one email; true if SendGrid accepted it. Failures are logged. */
export async function sendMail(tag: string, build: (from: string, to: string) => MailDataRequired): Promise<boolean> {
  const config = readMailConfig(tag);
  if (!config) return false;
  sgMail.setApiKey(config.apiKey);
  try {
    await sgMail.send(build(config.from, config.to));
    return true;
  } catch (error) {
    logSendGridError(tag, "send", error);
    return false;
  }
}

/** A thrown error as a response: "not open yet" without a database,
    otherwise the generic message (details go to the server log). */
export function failure(tag: string, error: unknown) {
  if (error instanceof DatabaseUnavailable) return json({ ok: false, error: CLOSED }, 503);
  console.error(`[${tag}]`, error);
  return json({ ok: false, error: GENERIC_ERROR }, 500);
}
