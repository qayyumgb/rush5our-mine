/**
 * GET /api/auth/verify?token=… — the link in the verification email.
 *
 * A valid, in-date link marks the email verified, signs the member in on
 * this browser and opens their account page. An old or used link opens
 * the Join page's sign-in form, which explains and offers a new one.
 */

import { NextResponse } from "next/server";
import { siteOrigin, startSession } from "@/lib/auth/session";
import { consumeToken, markVerified } from "@/lib/auth/users";
import { DatabaseUnavailable } from "@/lib/db/client";

export async function GET(request: Request) {
  const origin = siteOrigin(request);
  const token = new URL(request.url).searchParams.get("token") ?? "";
  try {
    const userId = await consumeToken(token, "verify-email");
    if (!userId) return NextResponse.redirect(`${origin}/join?signin=1&notice=expired#signup`, 303);
    await markVerified(userId);
    await startSession(userId, request);
    return NextResponse.redirect(`${origin}/account?welcome=1`, 303);
  } catch (error) {
    if (!(error instanceof DatabaseUnavailable)) console.error("[verify]", error);
    return NextResponse.redirect(`${origin}/join?signin=1&notice=error#signup`, 303);
  }
}
