/**
 * ROUTE HANDLERS — request plumbing shared by app/api/contact, app/api/
 * subscribe and app/api/cart: the same-origin check and reading a bounded
 * JSON body.
 */

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
