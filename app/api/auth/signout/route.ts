/**
 * POST /api/auth/signout — ends this browser's session and clears the
 * cookie. Same-site requests only, so another site can't sign members out.
 */

import { isForeignOrigin } from "@/lib/http";
import { failure, json } from "@/lib/auth/route";
import { endSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  if (isForeignOrigin(request)) return json({ ok: false, error: "Not allowed." }, 403);
  try {
    await endSession();
    return json({ ok: true, redirect: "/join?signin=1&notice=signed-out#signup" });
  } catch (error) {
    return failure("signout", error);
  }
}
