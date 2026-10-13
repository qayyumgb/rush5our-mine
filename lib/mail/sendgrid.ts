/**
 * MAIL ROUTES — the plumbing app/api/contact and app/api/subscribe share:
 * the three environment variables, the same-origin check, reading a
 * bounded JSON body, and logging a SendGrid failure.
 *
 * CONFIGURATION — three environment variables, read at request time and
 * never hardcoded:
 *   SENDGRID_API_KEY     the SendGrid API key
 *   CONTACT_TO_EMAIL     the business inbox both forms deliver to
 *   CONTACT_FROM_EMAIL   the verified sender address
 *
 * Server-only.
 */

export interface MailConfig {
  apiKey: string;
  to: string;
  from: string;
}

/** Reads the three variables; logs which are missing and returns null. */
export function readMailConfig(tag: string): MailConfig | null {
  const apiKey = process.env.SENDGRID_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  const missing = [
    !apiKey && "SENDGRID_API_KEY",
    !to && "CONTACT_TO_EMAIL",
    !from && "CONTACT_FROM_EMAIL",
  ].filter(Boolean);

  if (!apiKey || !to || !from) {
    console.error(`[${tag}] not configured — missing: ${missing.join(", ")}`);
    return null;
  }
  return { apiKey, to, from };
}

/**
 * Logs a SendGrid failure with what is useful for debugging — the status
 * and SendGrid's own error list — and never the request, which carries the
 * API key in its headers.
 */
export function logSendGridError(tag: string, which: string, error: unknown) {
  const e = error as { code?: number; message?: string; response?: { body?: unknown } };
  // The body is stringified so SendGrid's nested `errors` list prints in
  // full rather than as "[Object]".
  console.error(
    `[${tag}] SendGrid failed (${which}) — code ${e?.code ?? "?"}: ${e?.message ?? "unknown error"}`,
    JSON.stringify(e?.response?.body ?? null),
  );
}

/**
 * True when a browser says the request came from another site. A browser
 * sends Origin on a cross-site POST; if it names another host, the form
 * was not ours. (Tools like curl send none, and are let through to the
 * rate limit and validation like anyone else.)
 */
export function isForeignOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host !== host;
  } catch {
    return true; // unparseable: treated as a mismatch
  }
}

export type JsonBody =
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; reason: "too-large" | "unreadable" };

/** Reads the body as one JSON object of at most `maxBytes`. */
export async function readJsonObject(request: Request, maxBytes: number): Promise<JsonBody> {
  if (Number(request.headers.get("content-length") ?? 0) > maxBytes) return { ok: false, reason: "too-large" };
  try {
    const raw = await request.text();
    if (raw.length > maxBytes) return { ok: false, reason: "too-large" };
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("not an object");
    return { ok: true, payload: parsed as Record<string, unknown> };
  } catch {
    return { ok: false, reason: "unreadable" };
  }
}
