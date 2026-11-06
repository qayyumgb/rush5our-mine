/**
 * PROXY (Next.js 16's name for middleware) — the join.rush5our.com
 * subdomain.
 *
 * That host serves the Early Access page and nothing else:
 *   • "/"                → shows /early-access (a rewrite: the address
 *                          bar keeps the clean https://join.rush5our.com)
 *   • "/early-access"    → redirected to "/", so there's one address
 *   • POST /api/subscribe → allowed: the page's own sign-up
 *   • anything else      → redirected to "/", so nobody can browse from
 *                          the subdomain into the rest of the site
 * Its pages also carry `X-Robots-Tag: noindex, nofollow`.
 *
 * Every other host (rush5our.com, Vercel previews, localhost) is untouched.
 * `join.localhost` is the subdomain on a local machine: open
 * http://join.localhost:3000 to try it.
 */

import { NextResponse, type NextRequest } from "next/server";

const EARLY_ACCESS_HOSTS = new Set(["join.rush5our.com", "join.localhost"]);
const EARLY_ACCESS_PATH = "/early-access";
/** What the page itself needs from the server, besides its own HTML. */
const ALLOWED_API = new Set(["/api/subscribe"]);

const NOINDEX = { "X-Robots-Tag": "noindex, nofollow" };

export function proxy(request: NextRequest) {
  const hostHeader = request.headers.get("host") ?? "";
  const host = hostHeader.split(":")[0].toLowerCase();
  if (!EARLY_ACCESS_HOSTS.has(host)) return NextResponse.next();

  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = EARLY_ACCESS_PATH;
    return NextResponse.rewrite(url, { headers: NOINDEX });
  }

  if (ALLOWED_API.has(pathname)) return NextResponse.next();

  // /early-access itself, and every other page or API: back to the page.
  // Built from the Host the visitor asked for (and the protocol their
  // browser used), so they stay on the subdomain — never the address the
  // server thinks it has, which on Vercel can be another domain.
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() || request.nextUrl.protocol.replace(":", "");
  return NextResponse.redirect(`${proto}://${hostHeader}/`, { status: 307, headers: NOINDEX });
}

export const config = {
  // Everything except Next's own files and anything with a file extension
  // (fonts, icons, images), which the page needs to load.
  matcher: ["/((?!_next/static|_next/image|.*\\.[a-zA-Z0-9]+$).*)"],
};
