/**
 * POST /api/subscribe — receives the Join the Movement sign-up and sends it
 * on through SendGrid.
 *
 * In order, a request is:
 *   1. checked for origin, size and shape   (lib/http.ts)
 *   2. rate limited per IP                  (lib/mail/rateLimit.ts)
 *   3. dropped silently if the honeypot is filled
 *   4. validated                            (lib/subscribe/validation.ts —
 *                                            the same rules the form runs)
 *   5. sent as two emails                   (lib/subscribe/emails.ts): the
 *      notification to the business, then the welcome to the new member
 *
 * CONFIGURATION — the contact form's three variables, nothing new:
 * SENDGRID_API_KEY, CONTACT_TO_EMAIL (the sign-ups arrive in the same
 * inbox as contact messages) and CONTACT_FROM_EMAIL.
 *
 * NO DATABASE YET: the business inbox is the sign-up list, and a repeat
 * sign-up from the same address simply arrives again. The member system is
 * Phase 3 (RUSH5OUR-Implementation-Plan.md, 3.1).
 *
 * RESPONSES are always JSON of the shape `SubscribeResponse`:
 *   200 ok · 400 unreadable or invalid · 403 another site's form ·
 *   413 too large · 429 rate limited · 500 not configured · 502 SendGrid
 *   failed. Details of a failure go to the server log only.
 */

import sgMail from "@sendgrid/mail";
import { checkRateLimit, clientKey } from "@/lib/mail/rateLimit";
import { isForeignOrigin, readJsonObject } from "@/lib/http";
import { logSendGridError, readMailConfig } from "@/lib/mail/sendgrid";
import { signupNotificationEmail, welcomeEmail } from "@/lib/subscribe/emails";
import {
  HONEYPOT_FIELD,
  normalizeSubscribe,
  validateSubscribe,
  type SubscribeResponse,
} from "@/lib/subscribe/validation";

/** Largest request body accepted, in bytes. A sign-up is a few hundred. */
const MAX_BODY = 4_000;

const GENERIC_ERROR = "We couldn’t sign you up just now. Please try again in a moment.";

function json(body: SubscribeResponse, status: number, headers?: HeadersInit) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export async function POST(request: Request) {
  /* --- 1. origin, size, shape ------------------------------------------ */

  if (isForeignOrigin(request)) return json({ ok: false, error: GENERIC_ERROR }, 403);

  const body = await readJsonObject(request, MAX_BODY);
  if (!body.ok) {
    return body.reason === "too-large"
      ? json({ ok: false, error: "That request is too large." }, 413)
      : json({ ok: false, error: "We couldn’t read that request." }, 400);
  }
  const payload = body.payload;

  /* --- 2. rate limit ---------------------------------------------------- */

  const limit = checkRateLimit(`subscribe:${clientKey(request)}`);
  if (!limit.allowed) {
    return json(
      { ok: false, error: "Too many sign-ups from here. Please try again in a few minutes." },
      429,
      { "Retry-After": String(limit.retryAfter) },
    );
  }

  /* --- 3. honeypot ------------------------------------------------------ */

  // A person never sees this field. Answering "ok" gives a bot nothing to
  // learn from; nothing is sent.
  const trap = payload[HONEYPOT_FIELD];
  if (typeof trap === "string" && trap.trim() !== "") {
    console.warn("[subscribe] honeypot filled — sign-up dropped");
    return json({ ok: true }, 200);
  }

  /* --- 4. validation ---------------------------------------------------- */

  const values = normalizeSubscribe(payload);
  const fields = validateSubscribe(values);
  if (Object.keys(fields).length > 0) {
    return json({ ok: false, error: "Please check the highlighted fields.", fields }, 400);
  }

  /* --- 5. send ---------------------------------------------------------- */

  const config = readMailConfig("subscribe");
  if (!config) return json({ ok: false, error: GENERIC_ERROR }, 500);

  sgMail.setApiKey(config.apiKey);

  // The notification is the sign-up's only record: if it fails, the visitor
  // is told, so they can try again.
  try {
    await sgMail.send(signupNotificationEmail(values, config.to, config.from, new Date()));
  } catch (error) {
    logSendGridError("subscribe", "notification", error);
    return json({ ok: false, error: GENERIC_ERROR }, 502);
  }

  // The welcome is a courtesy. The sign-up is already recorded, so a
  // failure here is logged and the sign-up still counts.
  try {
    await sgMail.send(welcomeEmail(values, config.from));
  } catch (error) {
    logSendGridError("subscribe", "welcome", error);
  }

  return json({ ok: true }, 200);
}
