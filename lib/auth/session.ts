/**
 * ACCOUNTS — the session cookie. Server-only.
 *
 * A signed-in browser holds one cookie, `r5_session`: a random token
 * (lib/auth/crypto.ts) whose hash is a row in `sessions`. It's httpOnly
 * (page scripts can't read it), SameSite=Lax (other sites' forms can't
 * send it with a POST), Secure on https, and lasts 30 days.
 *
 * `currentMember()` is for server components (the account page);
 * `startSession` / `endSession` for the route handlers that sign in and out.
 */

import "server-only";
import { cookies } from "next/headers";
import { dbConfigured } from "@/lib/db/client";
import { site } from "@/data/site";
import { SESSION_DAYS, createSession, deleteSession, memberForSession, type Member } from "./users";

export const SESSION_COOKIE = "r5_session";

/** The signed-in member, or null (no cookie, expired, or no database). */
export async function currentMember(): Promise<Member | null> {
  // The cookie is read first, always: that's what tells Next.js a page
  // using this depends on the request and must never be prerendered.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !dbConfigured()) return null;
  try {
    return await memberForSession(token);
  } catch (error) {
    console.error("[auth] session lookup failed:", (error as Error).message);
    return null;
  }
}

/** True when the request arrived over https (directly or via Vercel). */
export function isHttps(request: Request): boolean {
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
  return (proto ?? new URL(request.url).protocol.replace(":", "")) === "https";
}

export async function startSession(userId: string, request: Request): Promise<void> {
  const token = await createSession(userId);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps(request),
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(token);
  jar.delete(SESSION_COOKIE);
}

/** Hosts an email link may point at: the site's own domain and its
    subdomains, this deployment's Vercel addresses, and a local machine. */
function trustedHost(host: string): boolean {
  const name = host.split(":")[0].toLowerCase();
  const own = new URL(site.url).hostname.replace(/^www\./, "");
  const vercel = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
    .filter(Boolean)
    .map((h) => String(h).toLowerCase());
  return (
    name === own ||
    name.endsWith(`.${own}`) ||
    vercel.includes(name) ||
    name === "localhost" ||
    name.endsWith(".localhost") ||
    name === "127.0.0.1"
  );
}

/**
 * The site's address for links in emails (verify, reset): the host the
 * visitor used, so a link from a local test or a preview points back there
 * — but only a host on the list above. A request carrying any other Host
 * header gets the main site's address, so nobody can have a reset link
 * mailed out pointing at their own server.
 */
export function siteOrigin(request: Request): string {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  if (!trustedHost(host)) return site.url;
  return `${isHttps(request) ? "https" : "http"}://${host}`;
}
