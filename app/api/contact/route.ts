/**
 * POST /api/contact — receives the Contact page's form and sends it on
 * through SendGrid.
 *
 * In order, a request is:
 *   1. checked for origin, size and shape
 *   2. rate limited per IP              (lib/mail/rateLimit.ts)
 *   3. dropped silently if the honeypot is filled
 *   4. validated                        (lib/contact/validation.ts — the
 *                                        same rules the form runs)
 *   5. sent as two emails               (lib/contact/emails.ts): the
 *      notification to the business, then the auto-reply to the visitor
 *
 * CONFIGURATION — SENDGRID_API_KEY, CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL,
 * read at request time and never hardcoded (lib/mail/sendgrid.ts).
 *
 * RESPONSES are always JSON of the shape `ContactResponse`. The details of a
 * failure — SendGrid's reply, a missing variable — go to the server log
 * only; the browser gets a friendly sentence and nothing about the insides.
 */

import sgMail from "@sendgrid/mail";
import { autoReplyEmail, notificationEmail } from "@/lib/contact/emails";
import { checkRateLimit, clientKey } from "@/lib/mail/rateLimit";
import { isForeignOrigin, logSendGridError, readJsonObject, readMailConfig } from "@/lib/mail/sendgrid";
import {
  HONEYPOT_FIELD,
  normalizeContact,
  validateContact,
  type ContactResponse,
} from "@/lib/contact/validation";

/** Largest request body accepted, in bytes. A full message is ~5 KB. */
const MAX_BODY = 20_000;

const GENERIC_ERROR = "We couldn’t send your message. Please try again in a moment.";

function json(body: ContactResponse, status: number, headers?: HeadersInit) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export async function POST(request: Request) {
  /* --- 1. origin, size, shape ------------------------------------------ */

  if (isForeignOrigin(request)) return json({ ok: false, error: GENERIC_ERROR }, 403);

  const body = await readJsonObject(request, MAX_BODY);
  if (!body.ok) {
    return body.reason === "too-large"
      ? json({ ok: false, error: "That message is too long." }, 413)
      : json({ ok: false, error: "We couldn’t read that request." }, 400);
  }
  const payload = body.payload;

  /* --- 2. rate limit ---------------------------------------------------- */

  const limit = checkRateLimit(`contact:${clientKey(request)}`);
  if (!limit.allowed) {
    return json(
      { ok: false, error: "Too many messages from here. Please try again in a few minutes." },
      429,
      { "Retry-After": String(limit.retryAfter) },
    );
  }

  /* --- 3. honeypot ------------------------------------------------------ */

  // A person never sees this field. Answering "ok" gives a bot nothing to
  // learn from; nothing is sent.
  const trap = payload[HONEYPOT_FIELD];
  if (typeof trap === "string" && trap.trim() !== "") {
    console.warn("[contact] honeypot filled — submission dropped");
    return json({ ok: true }, 200);
  }

  /* --- 4. validation ---------------------------------------------------- */

  const values = normalizeContact(payload);
  const fields = validateContact(values);
  if (Object.keys(fields).length > 0) {
    return json({ ok: false, error: "Please check the highlighted fields.", fields }, 400);
  }

  /* --- 5. send ---------------------------------------------------------- */

  const config = readMailConfig("contact");
  if (!config) return json({ ok: false, error: GENERIC_ERROR }, 500);

  sgMail.setApiKey(config.apiKey);

  // The notification is the one that matters: if it fails, the visitor is
  // told, so they can try again or use another channel.
  try {
    await sgMail.send(notificationEmail(values, config.to, config.from));
  } catch (error) {
    logSendGridError("contact", "notification", error);
    return json({ ok: false, error: GENERIC_ERROR }, 502);
  }

  // The auto-reply is a courtesy. The business already has the message, so
  // a failure here is logged and the submission still counts as sent.
  try {
    await sgMail.send(autoReplyEmail(values, config.from));
  } catch (error) {
    logSendGridError("contact", "auto-reply", error);
  }

  return json({ ok: true }, 200);
}
