/**
 * GET /api/auth/me — who's signed in on this browser, for the Join page:
 * it shows a signed-in member their RUSH Code and a way to My Account
 * instead of the sign-up form. Only what that panel shows; never cached.
 */

import { currentMember } from "@/lib/auth/session";

export async function GET() {
  const member = await currentMember();
  return Response.json(
    member ? { member: { name: member.name, username: member.username, rushCode: member.rushCode } } : { member: null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
