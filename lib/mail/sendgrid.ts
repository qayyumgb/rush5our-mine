/**
 * MAIL ROUTES — the plumbing app/api/contact and app/api/subscribe share:
 * the three environment variables and logging a SendGrid failure. The
 * same-origin check and the bounded JSON body reader live in lib/http.ts.
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
