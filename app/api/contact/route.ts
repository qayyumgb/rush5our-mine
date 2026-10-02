/**
 * POST /api/contact — receives the Contact page's form and sends it on
 * through SendGrid.
 *
 * In order, a request is:
 *   1. checked for origin, size and shape
 *   2. rate limited per IP              (lib/contact/rateLimit.ts)
 *   3. dropped silently if the honeypot is filled
 *   4. validated                        (lib/contact/validation.ts — the
 *                                        same rules the form runs)
 *   5. sent as two emails               (lib/contact/emails.ts): the
 *      notification to the business, then the auto-reply to the visitor
 *
 * CONFIGURATION — three environment variables, read at request time and
 * never hardcoded (see .env.local.example):
 *   SENDGRID_API_KEY     the SendGrid API key
 *   CONTACT_TO_EMAIL     where submissions are delivered
 *   CONTACT_FROM_EMAIL   the verified sender address
 *
 * RESPONSES are always JSON of the shape `ContactResponse`. The details of a
 * failure — SendGrid's reply, a missing variable — go to the server log
 * only; the browser gets a friendly sentence and nothing about the insides.
 */

import sgMail from "@sendgrid/mail";
import { autoReplyEmail, notificationEmail } from "@/lib/contact/emails";
import { checkRateLimit, clientKey } from "@/lib/contact/rateLimit";
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

/** Reads the three variables; logs which are missing and returns null. */
function readConfig() {
  const apiKey = process.env.SENDGRID_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  const missing = [
    !apiKey && "SENDGRID_API_KEY",
    !to && "CONTACT_TO_EMAIL",
    !from && "CONTACT_FROM_EMAIL",
  ].filter(Boolean);

  if (!apiKey || !to || !from) {
    console.error(`[contact] not configured — missing: ${missing.join(", ")}`);
    return null;
  }
  return { apiKey, to, from };
}

/**
 * Logs a SendGrid failure with what is useful for debugging — the status
 * and SendGrid's own error list — and never the request, which carries the
 * API key in its headers.
 */
function logSendGridError(which: string, error: unknown) {
  const e = error as { code?: number; message?: string; response?: { body?: unknown } };
  // The body is stringified so SendGrid's nested `errors` list prints in
  // full rather than as "[Object]".
  console.error(
    `[contact] SendGrid failed (${which}) — code ${e?.code ?? "?"}: ${e?.message ?? "unknown error"}`,
    JSON.stringify(e?.response?.body ?? null),
  );
}

export async function POST(request: Request) {
  /* --- 1. origin, size, shape ------------------------------------------ */

  // A browser sends Origin on a cross-site POST; if it names another site,
  // the form was not ours. (Tools like curl send none, and are let through
  // to the rate limit and validation like anyone else.)
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin && host) {
    let originHost = "";
    try {
      originHost = new URL(origin).host;
    } catch {
      // Unparseable: treated as a mismatch below.
    }
    if (originHost !== host) return json({ ok: false, error: GENERIC_ERROR }, 403);
  }

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) {
    return json({ ok: false, error: "That message is too long." }, 413);
  }

  let payload: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY) return json({ ok: false, error: "That message is too long." }, 413);
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("not an object");
    payload = parsed as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "We couldn’t read that request." }, 400);
  }

  /* --- 2. rate limit ---------------------------------------------------- */

  const limit = checkRateLimit(clientKey(request));
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

  const config = readConfig();
  if (!config) return json({ ok: false, error: GENERIC_ERROR }, 500);

  sgMail.setApiKey(config.apiKey);

  // The notification is the one that matters: if it fails, the visitor is
  // told, so they can try again or use another channel.
  try {
    await sgMail.send(notificationEmail(values, config.to, config.from));
  } catch (error) {
    logSendGridError("notification", error);
    return json({ ok: false, error: GENERIC_ERROR }, 502);
  }

  // The auto-reply is a courtesy. The business already has the message, so
  // a failure here is logged and the submission still counts as sent.
  try {
    await sgMail.send(autoReplyEmail(values, config.from));
  } catch (error) {
    logSendGridError("auto-reply", error);
  }

  return json({ ok: true }, 200);
}
